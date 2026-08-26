const db = require('./rpg-db');

function lerPopulacao(nomePais) {
    return Math.max(0, Number(db.get(`pais_${nomePais}.populacao`)) || 0);
}

function alterarPopulacao(nomePais, variacao) {
    const atual = lerPopulacao(nomePais);
    const delta = Number(variacao) || 0;
    const nova = Math.max(0, atual + delta);
    db.set(`pais_${nomePais}.populacao`, nova);
    return { anterior: atual, variacao: nova - atual, atual: nova };
}

function reduzirPopulacao(nomePais, perdas) {
    return alterarPopulacao(nomePais, -Math.max(0, Number(perdas) || 0));
}

function aumentarPopulacao(nomePais, crescimento) {
    return alterarPopulacao(nomePais, Math.max(0, Number(crescimento) || 0));
}

module.exports = { lerPopulacao, alterarPopulacao, reduzirPopulacao, aumentarPopulacao };
