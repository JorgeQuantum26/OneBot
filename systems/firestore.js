// ==========================================
// SYSTEMS/FIRESTORE.JS - PARTE 1 DE 2 (CORRIGIDA)
// ==========================================
const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const { cert, applicationDefault, initializeApp, getApps } = require('firebase-admin/app'); // 💡 Importação moderna e segura para as credenciais
const { isDeepStrictEqual } = require('node:util');
const _ = require('lodash');

const COLLECTION = process.env.FIRESTORE_COLLECTION || 'rpg';
const cache = new Map();
let writeQueue = Promise.resolve();
const pendingRoots = new Set();
const pendingDeletes = new Set();
const pendingFlushes = [];
let flushTimer = null;

const DAILY_WRITE_LIMIT = Math.min(19900, Math.max(100, Number(process.env.FIRESTORE_DAILY_WRITE_LIMIT) || 18000));

// 🚀 CONFIGURAÇÃO DE TIMING E VOLUMETRIA (AUTO-SAVE EM LOTE)
const MAX_WRITES_PER_FLUSH = 500;
const WRITE_FLUSH_DELAY = 20 * 60 * 1000;

let writeWindowStartedAt = Date.now();
let writesInWindow = 0;

const metrics = {
    mutations: 0,
    changedMutations: 0,
    skippedMutations: 0,
    writes: 0,
    throttledFlushes: 0,
    byRoot: new Map(),
    byOrigin: new Map(),
    usingBackup: false
};

// 🛡️ INICIALIZAÇÃO MULTI-PROJETO (PRINCIPAL E CONTINGÊNCIA)
let firestorePrincipal;
let firestoreBackup = null;

function parseServiceAccount(jsonString) {
    if (!jsonString) return null;
    try {
        const sa = JSON.parse(jsonString);
        if (typeof sa.private_key === 'string') {
            sa.private_key = sa.private_key.replace(/\\n/g, '\n');
        }
        return sa;
    } catch (e) {
        console.error(`[Firestore] Erro ao processar JSON de credencial: ${e.message}`);
        return null;
    }
}

// 1. Inicializa o App Principal usando a sintaxe moderna do SDK
const saPrincipal = parseServiceAccount(process.env.FIREBASE_SERVICE_ACCOUNT);
const appPrincipal = initializeApp({
    credential: saPrincipal ? cert(saPrincipal) : applicationDefault()
}, 'principal');
firestorePrincipal = getFirestore(appPrincipal);

// 2. Inicializa o App Reserva (Se configurado no Render)
const saBackup = parseServiceAccount(process.env.FIREBASE_SERVICE_ACCOUNT_SECUNDARIO);
if (saBackup) {
    const appBackup = initializeApp({
        credential: cert(saBackup)
    }, 'backup');
    firestoreBackup = getFirestore(appBackup);
    console.log('[Firestore] 🛡️ Banco de dados Secundário (Reserva) pronto para contingência.');
} else {
    console.warn('[Firestore] ⚠️ Credencial secundária ausente em FIREBASE_SERVICE_ACCOUNT_SECUNDARIO.');
}

// Inicializa apontando para a coleção do banco principal
let currentCollection = firestorePrincipal.collection(COLLECTION);

// ⚙️ FUNÇÕES INTERNAS DE MAPEAMENTO DE DADOS
function splitPath(key) { return String(key).split('.').filter(Boolean); }
function getNested(value, path) { return path.reduce((current, part) => current == null ? undefined : current[part], value); }
function setNested(value, path, nextValue) {
    if (path.length === 0) return nextValue;
    const result = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    let target = result;
    path.slice(0, -1).forEach((part) => { if (!target[part] || typeof target[part] !== 'object') target[part] = {}; target = target[part]; });
    target[path[path.length - 1]] = nextValue; return result;
}
function deleteNested(value, path) {
    if (path.length === 0) return undefined; if (!value || typeof value !== 'object') return value;
    const result = Array.isArray(value) ? [...value] : { ...value }; let target = result;
    for (const part of path.slice(0, -1)) { if (!target[part] || typeof target[part] !== 'object') return value; target[part] = Array.isArray(target[part]) ? [...target[part]] : { ...target[part] }; target = target[part]; }
    if (Array.isArray(target)) delete target[Number(path[path.length - 1])]; else delete target[path[path.length - 1]]; return result;
}
function clone(value) { if (value === undefined) return undefined; return JSON.parse(JSON.stringify(value)); }
function rootAndPath(key) { const path = splitPath(key); return { root: path.shift(), path }; }
function getOrigin() { const line = new Error().stack?.split('\n').find((stackLine) => !stackLine.includes('systems/firestore.js')); return line ? line.trim() : 'desconhecida'; }
function recordMutation(root, changed) {
    metrics.mutations++; if (changed) metrics.changedMutations++; else metrics.skippedMutations++;
    const rootMetrics = metrics.byRoot.get(root) || { mutations: 0, writes: 0 }; rootMetrics.mutations++; metrics.byRoot.set(root, rootMetrics);
    const origin = getOrigin(); metrics.byOrigin.set(origin, (metrics.byOrigin.get(origin) || 0) + 1);
}
function schedulePersist(root) { if (root) pendingRoots.add(root); scheduleFlush(WRITE_FLUSH_DELAY); }


// ==========================================
// SYSTEMS/FIRESTORE.JS - PARTE 2 DE 2
// ==========================================
function scheduleFlush(delay = 0) {
    if (flushTimer) return;
    flushTimer = setTimeout(() => {
        flushTimer = null;
        if (Date.now() - writeWindowStartedAt >= 86400000) {
            writeWindowStartedAt = Date.now(); writesInWindow = 0;
        }
        const disponiveis = DAILY_WRITE_LIMIT - writesInWindow;

        if (disponiveis <= 0 && !metrics.usingBackup) {
            if (firestoreBackup) {
                console.warn('[Firestore] 🚨 Limite diário local atingido no principal. Alternando para o reserva...');
                metrics.usingBackup = true; currentCollection = firestoreBackup.collection(COLLECTION);
            } else {
                metrics.throttledFlushes++;
                if (metrics.throttledFlushes === 1) console.error(`[Firestore] Limite de ${DAILY_WRITE_LIMIT} writes atingido e nenhum banco reserva configurado.`);
                scheduleFlush(Math.max(1000, writeWindowStartedAt + 86400000 - Date.now())); return;
            }
        }

        const quantidade = Math.min(MAX_WRITES_PER_FLUSH, DAILY_WRITE_LIMIT - writesInWindow);
        const roots = [...pendingRoots].slice(0, quantidade); roots.forEach((root) => pendingRoots.delete(root));
        const restantes = Math.max(0, quantidade - roots.length);
        const deletes = [...pendingDeletes].slice(0, restantes); deletes.forEach((root) => pendingDeletes.delete(root));

        if (roots.length === 0 && deletes.length === 0) {
            for (const resolve of pendingFlushes.splice(0)) resolve(); return;
        }

        writeQueue = writeQueue.then(async () => {
            const bancoAtivo = metrics.usingBackup ? firestoreBackup : firestorePrincipal;
            const batch = bancoAtivo.batch();

            roots.forEach((pendingRoot) => {
                const value = cache.get(pendingRoot); const docRef = currentCollection.doc(pendingRoot);
                batch.set(docRef, { value: value === undefined ? null : value }, { merge: true });
                metrics.writes++; writesInWindow++;
                const rootMetrics = metrics.byRoot.get(pendingRoot) || { mutations: 0, writes: 0 }; rootMetrics.writes++; metrics.byRoot.set(pendingRoot, rootMetrics);
            });

            deletes.forEach((pendingRoot) => {
                const docRef = currentCollection.doc(pendingRoot); batch.delete(docRef);
                metrics.writes++; writesInWindow++;
                const rootMetrics = metrics.byRoot.get(pendingRoot) || { mutations: 0, writes: 0 }; rootMetrics.writes++; metrics.byRoot.set(pendingRoot, rootMetrics);
            });

            try {
                await batch.commit();
                console.log(`[Firestore] Auto-save executado com sucesso (${metrics.usingBackup ? '⚠️ RESERVA' : '✅ PRINCIPAL'}). Enviados ${roots.length + deletes.length} documentos.`);
            } catch (error) {
                if ((error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('quota') || error.code === 8) && firestoreBackup && !metrics.usingBackup) {
                    console.error('[Firestore] 🛑 Banco principal esgotou as cotas! Devolvendo dados à fila e ativando backup...');
                    roots.forEach(r => pendingRoots.add(r)); deletes.forEach(d => pendingDeletes.add(d));
                    metrics.usingBackup = true; currentCollection = firestoreBackup.collection(COLLECTION);
                    scheduleFlush(1000);
                } else {
                    console.error('[Firestore] Erro crítico ao processar o lote de salvamento:', error.message);
                }
            }
        });

        if (pendingRoots.size || pendingDeletes.size) { scheduleFlush(WRITE_FLUSH_DELAY); } else { for (const resolve of pendingFlushes.splice(0)) resolve(); }
    }, delay);
}

function persist(root) { schedulePersist(root); return writeQueue; }

async function load() {
    const snapshot = await currentCollection.get();
    snapshot.forEach((document) => { const data = document.data(); cache.set(document.id, data.value); });
    console.log(`[Firestore] ${snapshot.size} documento(s) carregado(s) da coleção ${COLLECTION}.`);
}

const ready = load().catch((error) => { console.error('[Firestore] Erro fatal no carregamento inicial do banco.'); throw error; });

// 📦 OBJETO DE INTERFACE EXPORTADO (PADRÃO QUICK.DB COMPATÍVEL)
const db = {
    ready,
    flush() {
        if (!flushTimer) return writeQueue;
        return new Promise((resolve) => { pendingFlushes.push(() => resolve(writeQueue)); }).then(() => writeQueue);
    },
    metrics() {
        return {
            mutations: metrics.mutations, changedMutations: metrics.changedMutations, skippedMutations: metrics.skippedMutations,
            writes: metrics.writes, throttledFlushes: metrics.throttledFlushes, usingBackup: metrics.usingBackup,
            byRoot: Object.fromEntries(metrics.byRoot), byOrigin: Object.fromEntries(metrics.byOrigin)
        };
    },
    firestore: firestorePrincipal,
    collection: () => currentCollection,
    get(key) { const { root, path } = rootAndPath(key); return clone(getNested(cache.get(root), path)); },
    fetch(key) { return this.get(key); },
    has(key) { return this.get(key) !== undefined; },
    set(key, value) {
        const { root, path } = rootAndPath(key); if (!root) return value;
        pendingDeletes.delete(root); const current = cache.get(root);
        const next = path.length ? setNested(current, path, clone(value)) : clone(value);
        if (isDeepStrictEqual(current, next)) { recordMutation(root, false); return value; }
        recordMutation(root, true); cache.set(root, next); persist(root); return value;
    },
    add(key, amount) { const current = Number(this.get(key)) || 0; const value = current + Number(amount || 0); this.set(key, value); return value; },
    subtract(key, amount) { const current = Number(this.get(key)) || 0; const value = current - Number(amount || 0); this.set(key, value); return value; },
    sub(key, amount) { return this.subtract(key, amount); },
    push(key, value) { const values = this.get(key) || []; values.push(clone(value)); this.set(key, values); return values; },
    delete(key) {
        const { root, path } = rootAndPath(key); if (!root) return false;
        if (path.length === 0) {
            cache.delete(root); pendingRoots.delete(root); pendingDeletes.add(root); recordMutation(root, true); scheduleFlush(WRITE_FLUSH_DELAY);
        } else {
            const current = cache.get(root); const next = deleteNested(current, path);
            if (isDeepStrictEqual(current, next)) return true;
            cache.set(root, next); recordMutation(root, true); persist(root);
        }
        return true;
    },
    remove(key) { return this.delete(key); },
    all() { return [...cache.entries()].map(([ID, value]) => ({ ID, data: clone(value) })); }
};

module.exports = db;