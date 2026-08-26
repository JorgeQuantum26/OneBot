const Discord = require('discord.js');
const db = require('../systems/rpg-db');

module.exports = {
    nome: 'ver-bolsa',
    descricao: 'Mostra as informações da bolsa de valores.',
    run: async (client, message, args) => {
        const valorTotalBolsa = db.get('valor_total_bolsa') || 0;
        const proximaAtualizacao = db.get('proximaAtualizacao') || 0;
        const intervaloAtualizacao = db.get('intervaloAtualizacao') || (30 * 60 * 1000); // Padrão de 30 minutos
        const acoes = db.get('precos_acoes') || {};

        const proximaAtualizacaoFormatada = proximaAtualizacao ? new Date(proximaAtualizacao).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : 'Não definida';

        const embed = new Discord.EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('📈 Informações da Bolsa de Valores')
            .addFields({ name: 'Valor Total da Bolsa', value: `R$${formatarNumero(valorTotalBolsa)}`, inline: true })
            .addFields({ name: 'Próxima Atualização', value: proximaAtualizacaoFormatada, inline: true })
            .addFields({ name: 'Intervalo de Atualização', value: `${(intervaloAtualizacao / (60 * 1000)).toFixed(2)} minutos`, inline: true });

        const precoAcoes = formatarPrecosAcoes(acoes);
        precoAcoes.forEach(acao => {
            embed.addFields({ name: acao.nome, value: `Valor: R$${acao.valor}\nVariação: ${acao.variacao}`, inline: true });
        });

        message.channel.send({ embeds: [embed] });
    },
};

function formatarPrecosAcoes(acoes) {
    const influenciaAcoes = {
        '(TRUF)_TrustFinance_Holdings_Ltd.': 0.1,
        '(ONEB)_OneBank_Corporation': 0.05,
        '(SECB)_SecureBank_Incorporated': -0.05
    }; // Exemplo de influência percentual nas ações

    return Object.entries(acoes).map(([nome, valor]) => {
        const influencia = influenciaAcoes[nome] || 0;
        const variacaoPercentual = influencia * 100;
        const variacaoTexto = variacaoPercentual > 0 ? `+${variacaoPercentual.toFixed(2)}%` : `${variacaoPercentual.toFixed(2)}%`;
        return {
            nome,
            valor: formatarNumero(valor),
            variacao: variacaoTexto
        };
    });
}

function formatarNumero(numero) {
    return numero.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
