const Discord = require('discord.js');
const db = require('../systems/firestore');

module.exports = {
    nome: 'iniciar-bolsa',
    descricao: 'Inicia a bolsa de valores.',
    run: async (client, message, args) => {
        if (db.get('bolsa_ativa')) return message.channel.send("A bolsa de valores já está ativa.");

        const intervaloAtualizacao = 30 * 60 * 1000;  // 30 minutos em milissegundos
        let acoes = {
            '(TRUF)_TrustFinance_Holdings_Ltd.': 1200.0,
            '(ONEB)_OneBank_Corporation': 5400.0,
            '(SECB)_SecureBank_Incorporated': 7800.0
        }; // Exemplo de ações com preços iniciais

        // Calcula o valor total da bolsa
        const valorTotalBolsa = Object.values(acoes).reduce((total, preco) => total + preco, 0);
        db.set('valor_total_bolsa', valorTotalBolsa);

        // Define a hora da próxima atualização e armazena na base de dados
        const proximaAtualizacao = Date.now() + intervaloAtualizacao;
        db.set('proximaAtualizacao', proximaAtualizacao);
        db.set('intervaloAtualizacao', intervaloAtualizacao);
        db.set('bolsa_ativa', true);
        db.set('precos_acoes', acoes); // Armazena os preços das ações inicialmente

        // Mensagem de confirmação
        message.channel.send("A bolsa de valores foi iniciada com sucesso!");

        // Inicia o agendador de atualização de preços
        setInterval(atualizarPrecos, intervaloAtualizacao); // Atualiza a cada 30 minutos
    },
};

function calcularInfluenciaAcoes(acoes, valorTotalBolsa) {
    const influenciaAcoes = {
        '(TRUF)_TrustFinance_Holdings_Ltd.': 0.1,
        '(ONEB)_OneBank_Corporation': 0.05,
        '(SECB)_SecureBank_Incorporated': -0.05
    }; // Exemplo de influência percentual nas ações

    for (let acao in acoes) {
        const influencia = influenciaAcoes[acao] || 0; // 0 se não houver influência definida
        const variacaoPercentual = valorTotalBolsa * influencia;
        const novoPreco = acoes[acao] + variacaoPercentual;
        acoes[acao] = parseFloat(novoPreco.toFixed(2));
    }

    return acoes;
}

function atualizarPrecos() {
    const intervaloAtualizacao = db.get('intervaloAtualizacao') || (30 * 60 * 1000); // Padrão de 30 minutos
    let acoes = db.get('precos_acoes') || {
        '(TRUF)_TrustFinance_Holdings_Ltd.': 1200.0,
        '(ONEB)_OneBank_Corporation': 5400.0,
        '(SECB)_SecureBank_Incorporated': 7800.0
    }; // Exemplo de ações com preços iniciais
    const valorTotalBolsa = db.get('valor_total_bolsa') || 0;

    acoes = calcularInfluenciaAcoes(acoes, valorTotalBolsa);

    // Armazena os preços e as mudanças percentuais na base de dados
    db.set('precos_acoes', acoes);

    // Atualiza a hora da próxima atualização
    const proximaAtualizacao = Date.now() + intervaloAtualizacao;
    db.set('proximaAtualizacao', proximaAtualizacao);

    console.log('Intervalo de atualização:', intervaloAtualizacao);
    console.log('Próxima atualização:', new Date(proximaAtualizacao).toLocaleString()); // Verificar o horário da próxima atualização
}
