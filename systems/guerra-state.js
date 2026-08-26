const CASUS_BELLI_PADRAO = 'seguranca_nacional';
const OBJETIVO_PADRAO = 'conquista_territorial';

function criarGuerra(dados = {}) {
    return normalizarGuerra({
        id:
            dados.id ||
            `guerra_${dados.atacante || 'desconhecido'}_${dados.defensor || 'desconhecido'}_${dados.inicio || Date.now()}`,
        atacante: dados.atacante,
        defensor: dados.defensor,
        participantes: dados.participantes || [dados.atacante, dados.defensor].filter(Boolean),
        lados: dados.lados || {
            atacante: [dados.atacante].filter(Boolean),
            defensor: [dados.defensor].filter(Boolean)
        },
        tipo: dados.tipo || 'invasao_terrestre',
        progresso: dados.progresso || 0,
        inicio: dados.inicio || Date.now(),
        general: dados.general || 'Comando Central',
        baixasAtacante: dados.baixasAtacante || 0,
        baixasDefensor: dados.baixasDefensor || 0,
        baixasCivis: dados.baixasCivis || 0,
        status: dados.status || 'ativa',
        casusBelli: dados.casusBelli || CASUS_BELLI_PADRAO,
        objetivos: dados.objetivos || [OBJETIVO_PADRAO],
        batalhas: dados.batalhas || [],
        ocupacao: dados.ocupacao || { percentual: 0, territorios: [] },
        bases: dados.bases || { atacante: [], defensor: [] },
        pontuacao: dados.pontuacao || { atacante: 50, defensor: 50 },
        propostasPaz: dados.propostasPaz || [],
        capitulacao: dados.capitulacao || null,
        conferenciaPaz: dados.conferenciaPaz || null
    });
}

function calcularPontuacao(guerra) {
    const progresso = Math.max(0, Math.min(100, Number(guerra.progresso) || 0));
    const ocupacao = Math.max(0, Math.min(100, Number(guerra.ocupacao?.percentual) || 0));
    const batalhas = Array.isArray(guerra.batalhas) ? guerra.batalhas : [];
    const saldoBatalhas = batalhas.reduce((total, batalha) => {
        if (batalha.vencedor === guerra.atacante) return total + 1;
        if (batalha.vencedor === guerra.defensor) return total - 1;
        return total;
    }, 0);
    const fatorBatalhas = Math.max(-15, Math.min(15, saldoBatalhas * 3));
    const totalPerdas = batalhas.reduce(
        (total, batalha) => total + Number(batalha.perdaAtacante || 0) + Number(batalha.perdaDefensor || 0),
        0
    );
    const perdasAtacante = batalhas.reduce((total, batalha) => total + Number(batalha.perdaAtacante || 0), 0);
    const pressaoMilitar = totalPerdas > 0 ? (perdasAtacante / totalPerdas) * 100 : 50;
    const fatorPerdas = Math.max(-10, Math.min(10, 5 - (pressaoMilitar - 50) / 5));
    const atacante = Math.max(
        0,
        Math.min(100, Math.round(50 + (progresso - 50) * 0.55 + ocupacao * 0.25 + fatorBatalhas + fatorPerdas))
    );
    return { atacante, defensor: 100 - atacante };
}

function normalizarGuerra(guerra) {
    const atual = { ...guerra };
    atual.casusBelli = atual.casusBelli || CASUS_BELLI_PADRAO;
    atual.objetivos = Array.isArray(atual.objetivos) && atual.objetivos.length ? atual.objetivos : [OBJETIVO_PADRAO];
    atual.batalhas = Array.isArray(atual.batalhas) ? atual.batalhas : [];
    atual.participantes = Array.isArray(atual.participantes)
        ? atual.participantes
        : [atual.atacante, atual.defensor].filter(Boolean);
    atual.lados =
        atual.lados && typeof atual.lados === 'object'
            ? atual.lados
            : { atacante: [atual.atacante], defensor: [atual.defensor] };
    atual.ocupacao =
        atual.ocupacao && typeof atual.ocupacao === 'object' ? atual.ocupacao : { percentual: 0, territorios: [] };
    atual.ocupacao.percentual = Math.max(0, Math.min(100, Number(atual.ocupacao.percentual) || 0));
    atual.ocupacao.territorios = Array.isArray(atual.ocupacao.territorios) ? atual.ocupacao.territorios : [];
    atual.bases = atual.bases && typeof atual.bases === 'object' ? atual.bases : { atacante: [], defensor: [] };
    atual.propostasPaz = Array.isArray(atual.propostasPaz) ? atual.propostasPaz : [];
    atual.pontuacao = calcularPontuacao(atual);
    return atual;
}

function registrarBatalha(guerra, dados) {
    const atual = normalizarGuerra(guerra);
    atual.batalhas = [...atual.batalhas, { ...dados, em: dados.em || Date.now() }].slice(-50);
    const ocupacaoAnterior = Number(atual.ocupacao.percentual) || 0;
    const variacaoOcupacao =
        dados.vencedor === atual.atacante
            ? Math.min(12, Math.max(1, Number(dados.progressoGanho) || 3))
            : -Math.min(8, Math.max(0, Number(dados.progressoGanho) || 1));
    atual.ocupacao.percentual = Math.max(0, Math.min(100, ocupacaoAnterior + variacaoOcupacao));
    if (dados.territorio && !atual.ocupacao.territorios.includes(dados.territorio)) {
        atual.ocupacao.territorios.push(dados.territorio);
    }
    atual.pontuacao = calcularPontuacao(atual);
    return atual;
}

module.exports = { criarGuerra, normalizarGuerra, calcularPontuacao, registrarBatalha };
