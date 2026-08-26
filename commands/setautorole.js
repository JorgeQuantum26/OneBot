const Discord = require('../systems/firestore');
const db = require('../systems/firestore');

module.exports = {
    name: "set autorole",
    author: "ferinha",

    run: async(client, message, args) => {
       let ban = await db.fetch(`banido_${user.id}`);
  if(ban >= 1) return message.channel.send(`${message.author}, Você foi banido! ¯\_(ツ)_/¯\n\nVocê está na minha Blacklist e não pode usar meus comandos, Será que é tão difícil assim seguir as regras?\n\nCaso você ache que seu banimento foi injusto (Concerteza não foi), você pode entrar em Contato com a Equipe Do OneBot\n\nAo entrar em contato conosco, aguarde que logo iremos resolver seu problema, caso você tenha sido banido(a) injustamente iremos resolver, caso contrário você permanecerá banido(a) `)

        let ferinha_user = message.author;
        let msg_ferinha_error = "<a:X_Icon:806588437049638992>|Mencione um cargo";
        let msg_ferinha_completo_error = ` ${ferinha_user} ${msg_ferinha_error}.`;
        if (!args[0]) return message.channel.send(msg_ferinha_completo_error)

        let ferinha_autorole_cargo = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);

        db.set(`ferinha_autorole_${message.guild.id}`, ferinha_autorole_cargo.id);

        let msg_ferinha_confirmação = `<a:VerificadoVerdeIcon:806590288424468520>| ${ferinha_user} O cargo [${ferinha_autorole_cargo}] foi definido como autorole com sucesso!`;

        message.channel.send(msg_ferinha_confirmação)

    }
}
