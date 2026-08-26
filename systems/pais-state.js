const db = require('./rpg-db');
const { getDadosPais } = require('./real-countries-data');

function getPaisState(nomePais) {
    const nome = String(nomePais || '').toLowerCase();
    const estado = db.get(`pais_${nome}`);
    if (!estado) return null;
    return {
        nome,
        estado,
        base: getDadosPais(nome)
    };
}

function getValorAtual(nomePais, campo, fallback = 0) {
    const contexto = getPaisState(nomePais);
    if (!contexto) return fallback;
    const valor = contexto.estado[campo];
    return valor === undefined || valor === null ? (contexto.base?.[campo] ?? fallback) : valor;
}

module.exports = { getPaisState, getValorAtual };
