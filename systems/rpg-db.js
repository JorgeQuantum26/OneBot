const memoria = new Map();
let bancoOficial = null;
let usandoFallback = false;

try {
    bancoOficial = require('./firestore');
} catch (error) {
    usandoFallback = true;
    console.error(
        '[RPG DB] Firestore indisponível; RPG Mundi usando armazenamento de desenvolvimento em memória:',
        error.message
    );
}

function clonar(valor) {
    if (valor === undefined) return undefined;
    return JSON.parse(JSON.stringify(valor));
}

function dividirCaminho(chave) {
    return String(chave).split('.').filter(Boolean);
}

function lerAninhado(valor, caminho) {
    return caminho.reduce((atual, parte) => (atual == null ? undefined : atual[parte]), valor);
}

function definirAninhado(valor, caminho, proximo) {
    if (!caminho.length) return clonar(proximo);
    const resultado = valor && typeof valor === 'object' && !Array.isArray(valor) ? clonar(valor) : {};
    let alvo = resultado;
    caminho.slice(0, -1).forEach((parte) => {
        if (!alvo[parte] || typeof alvo[parte] !== 'object') alvo[parte] = {};
        alvo = alvo[parte];
    });
    alvo[caminho[caminho.length - 1]] = clonar(proximo);
    return resultado;
}

function excluirAninhado(valor, caminho) {
    if (!valor || typeof valor !== 'object') return valor;
    if (!caminho.length) return undefined;
    const resultado = clonar(valor);
    let alvo = resultado;
    for (const parte of caminho.slice(0, -1)) {
        if (!alvo[parte] || typeof alvo[parte] !== 'object') return valor;
        alvo = alvo[parte];
    }
    delete alvo[caminho[caminho.length - 1]];
    return resultado;
}

function ativarFallback(error) {
    if (bancoOficial) {
        console.error(
            '[RPG DB] Falha no banco oficial; usando armazenamento de desenvolvimento em memória:',
            error.message
        );
        bancoOficial = null;
        usandoFallback = true;
    }
}

function executarOficial(operacao, fallback) {
    if (!bancoOficial) return fallback();
    try {
        return operacao(bancoOficial);
    } catch (error) {
        ativarFallback(error);
        return fallback();
    }
}

function obter(chave) {
    return executarOficial(
        (banco) => banco.get(chave),
        () => {
            const partes = dividirCaminho(chave);
            return clonar(lerAninhado(memoria.get(partes.shift()), partes));
        }
    );
}

function definir(chave, valor) {
    return executarOficial(
        (banco) => banco.set(chave, valor),
        () => {
            const partes = dividirCaminho(chave);
            const raiz = partes.shift();
            memoria.set(raiz, definirAninhado(memoria.get(raiz), partes, valor));
            return valor;
        }
    );
}

const db = {
    get: obter,
    fetch: obter,
    has(chave) {
        return obter(chave) !== undefined;
    },
    set: definir,
    add(chave, quantidade) {
        const valor = (Number(obter(chave)) || 0) + Number(quantidade || 0);
        definir(chave, valor);
        return valor;
    },
    subtract(chave, quantidade) {
        const valor = (Number(obter(chave)) || 0) - Number(quantidade || 0);
        definir(chave, valor);
        return valor;
    },
    sub(chave, quantidade) {
        return this.subtract(chave, quantidade);
    },
    push(chave, valor) {
        const lista = obter(chave) || [];
        lista.push(clonar(valor));
        definir(chave, lista);
        return lista;
    },
    delete(chave) {
        return executarOficial(
            (banco) => banco.delete(chave),
            () => {
                const partes = dividirCaminho(chave);
                const raiz = partes.shift();
                if (!partes.length) return memoria.delete(raiz);
                memoria.set(raiz, excluirAninhado(memoria.get(raiz), partes));
                return true;
            }
        );
    },
    remove(chave) {
        return this.delete(chave);
    },
    all() {
        return executarOficial(
            (banco) => banco.all(),
            () => [...memoria.entries()].map(([ID, data]) => ({ ID, data: clonar(data) }))
        );
    },
    get usandoFallback() {
        return usandoFallback;
    },
    get ready() {
        if (!bancoOficial?.ready) return Promise.resolve();
        return bancoOficial.ready.catch((error) => {
            ativarFallback(error);
            return undefined;
        });
    },
    async flush() {
        if (!bancoOficial?.flush) return undefined;
        try {
            return await bancoOficial.flush();
        } catch (error) {
            ativarFallback(error);
            return undefined;
        }
    }
};

module.exports = db;
