const Discord = require("discord.js");
const db = require('../systems/firestore');

exports.run = async (client, message, args) => {
        if (!aplicativoEstaInstalado('celular', 'Telegram')) { // Verifica se o Telegram está instalado
            message.channel.send(`O aplicativo Telegram não está instalado!`);
            return;
        }

        const contato = message.content.split(' ')[1];

        db.push(`celular.Telegram.contatos`, contato);

        message.channel.send(`Contato ${contato} adicionado no Telegram!`);
    }