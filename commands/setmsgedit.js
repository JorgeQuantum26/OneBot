const Discord = require("discord.js");

const db = require('../systems/firestore');


module.exports = {
    name: "set msg edit",
    author: "ferinha",

    run: async(client, message, args) => {

        let ferinha_canal = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
        let ferinha_author = message.author;
        let ferinha_err = "Mencione um canal";

        let ferinha_perm = "**Gerenciar Servidor**";
        let ferinha_msg_error_perm = `<a:X_Icon:806588437049638992>| ${ferinha_author} Você não possui de ${ferinha_perm}.`

        if (!message.member.hasPermission("MANAGE_GUILD")) return message.channel.send(`${ferinha_msg_error_perm}`);
        if (!ferinha_canal) return message.channel.send(`<a:X_Icon:806588437049638992>| ${ferinha_author} ${ferinha_err}.`);

        db.set(`ferinha_msg_edit_${message.guild.id}`, ferinha_canal.id);

        let ferinha_confirm_pt1 = "O canal";
        let ferinha_confirm_pt2 = "foi configurado com sucesso.";
        message.channel.send(`<a:VerificadoVerdeIcon:806590288424468520>|${ferinha_author} ${ferinha_confirm_pt1} ${ferinha_canal} ${ferinha_confirm_pt2}`)
        
    }
}
