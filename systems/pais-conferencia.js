const { getPaisState } = require('./pais-state');

const LIMITES = {
    aprovacaoPopular: { minimo: 0, maximo: 100, unidade: '%' },
    inflacao: { minimo: -0.05, maximo: 0.5, unidade: '%' },
    infraestrutura: { minimo: 0, maximo: 5, unidade: 'níveis' },
    taxaImposto: { minimo: 0, maximo: 0.95, unidade: '%' },
    produtividade: { minimo: 0, maximo: 100, unidade: 'índice' }
};

function numero(valor) {
    const convertido = Number(valor);
    return Number.isFinite(convertido) ? convertido : 0;
}

function adicionarAnomalia(anomalias, codigo, severidade, mensagem, campos) {
    anomalias.push({ codigo, severidade, mensagem, campos });
}

function conferirPais(nomePais) {
    const contexto = getPaisState(nomePais);
    if (!contexto) {
        return {
            ok: false,
            nomePais: String(nomePais || '').toLowerCase(),
            anomalias: [
                { codigo: 'pais_inexistente', severidade: 'critica', mensagem: 'País não encontrado.', campos: [] }
            ]
        };
    }

    const { estado: pais } = contexto;
    const anomalias = [];
    const energia = {
        producao: numero(pais.producaoEnergetica),
        consumo: numero(pais.consumoEnergetico),
        saldo: numero(pais.producaoEnergetica) - numero(pais.consumoEnergetico)
    };

    if (pais.saldoEnergetico !== undefined && numero(pais.saldoEnergetico) !== energia.saldo) {
        adicionarAnomalia(
            anomalias,
            'saldo_energetico_divergente',
            'media',
            'O saldo energético persistido não corresponde à produção menos o consumo.',
            ['producaoEnergetica', 'consumoEnergetico', 'saldoEnergetico']
        );
    }

    for (const [campo, limite] of Object.entries(LIMITES)) {
        const valor = numero(pais[campo]);
        if (pais[campo] !== undefined && (valor < limite.minimo || valor > limite.maximo)) {
            adicionarAnomalia(anomalias, 'valor_fora_da_faixa', 'alta', `${campo} está fora da faixa esperada.`, [
                campo
            ]);
        }
    }

    const exercito = pais.exercito || {};
    const camposExercito = ['infantaria', 'tanques', 'avioes', 'navios'];
    for (const campo of camposExercito) {
        if (pais.exercito && numero(exercito[campo]) < 0) {
            adicionarAnomalia(
                anomalias,
                'forca_negativa',
                'critica',
                `A quantidade de ${campo} não pode ser negativa.`,
                [`exercito.${campo}`]
            );
        }
    }

    const construcoes = pais.construcoes || {};
    for (const [nome, valor] of Object.entries(construcoes)) {
        const nivel = numero(valor && typeof valor === 'object' ? valor.nivel : valor);
        if (nivel < 0) {
            adicionarAnomalia(anomalias, 'construcao_negativa', 'alta', `A construção ${nome} possui nível negativo.`, [
                `construcoes.${nome}`
            ]);
        }
    }

    const producao = numero(pais.agricultura) * numero(pais.produtividade || 1);
    const consumo = numero(pais.populacao) * 0.001;
    if (pais.populacao !== undefined && pais.agricultura !== undefined && producao < consumo) {
        adicionarAnomalia(
            anomalias,
            'pressao alimentar',
            'baixa',
            'A produção agrícola estimada está abaixo do consumo populacional básico.',
            ['populacao', 'agricultura', 'produtividade']
        );
    }

    return {
        ok: anomalias.length === 0,
        nomePais: contexto.nome,
        verificadoEm: Date.now(),
        anomalias,
        indicadores: {
            populacao: numero(pais.populacao),
            pib: numero(pais.pib),
            tesouro: numero(pais.tesouro),
            infraestrutura: numero(pais.infraestrutura),
            producaoAgricolaEstimada: producao,
            consumoAlimentarEstimado: consumo,
            energia,
            forca: camposExercito.reduce((total, campo) => total + numero(exercito[campo]), 0)
        }
    };
}

module.exports = { conferirPais };
