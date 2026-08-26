const Discord = require("discord.js");
const db = require('../systems/firestore');

exports.run = async (client, message, args) => {

    let aplicativoEstaInstalado = db.get(`telegram`);

        if (!aplicativoEstaInstalado) { // Verifica se o Telegram está instalado
            message.channel.send(`O aplicativo Telegram não está instalado!`);
            return;
        }

        const embed = new Discord.EmbedBuilder()
            .setTitle(`Telegram`)
            .setDescription(`Escolha uma das opções abaixo:`)
            .addFields({ name: `1. Mandar mensagem`, value: `B!mandar-mensagem-telegram`, inline: false })
            .addFields({ name: `2. Ler mensagens`, value: `B!ler-mensagens-telegram`, inline: false })
             .addFields({ name: `3. Adicionar Contato`, value: `B!adicionar-contato-telegram`, inline: false })
             .addFields({ name: `4. Ver contatos`, value: `B!ver-contatos-telegram`, inline: false });
        message.channel.send({ embeds: [embed] });
    }