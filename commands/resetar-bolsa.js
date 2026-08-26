const Discord = require('discord.js');
const db = require('../systems/firestore');

module.exports = {
    nome: 'resetar-bolsa',
    descricao: 'Reseta a bolsa de valores, limpando todos os dados relacionados a ela.',
    run: async (client, message, args) => {
        if (!db.get('bolsa_ativa')) {
            return message.channel.send("A bolsa de valores não está ativa no momento.");
        }

        // Limpa todos os dados relacionados à bolsa de valores na base de dados
        db.delete('bolsa_ativa');
        db.delete('valor_total_bolsa');
        db.delete('proximaAtualizacao');
        db.delete('intervaloAtualizacao');
        db.delete('precos_acoes');

        message.channel.send("A bolsa de valores foi resetada com sucesso. Você pode iniciar uma nova bolsa utilizando o comando `iniciar-bolsa`.");
    },
};