const { EmbedBuilder } = require("discord.js");

const db = require('../systems/firestore');;



exports.run = async (bot, message, args) => {
 let ban = await db.fetch(`banido_${user.id}`);
  if(ban >= 1) return message.channel.send(`${message.author}, Você foi banido! ¯\_(ツ)_/¯\n\nVocê está na minha Blacklist e não pode usar meus comandos, Será que é tão difícil assim seguir as regras?\n\nCaso você ache que seu banimento foi injusto (Concerteza não foi), você pode entrar em Contato com a Equipe Do OneBot\n\nAo entrar em contato conosco, aguarde que logo iremos resolver seu problema, caso você tenha sido banido(a) injustamente iremos resolver, caso contrário você permanecerá banido(a) `)

        let money = db.all().filter(lb => lb.ID.startsWith(`bank_${message.guild.id}`)).sort((a, b) => b.data- a.data)

        let bankBalance = money.slice(0, 10)

        console.log(bankBalance)

        let content = " ";



        for(let i = 0; i < bankBalance.length; i++) {

            let user = bot.users.cache.get(bankBalance[i].ID.split('_')[2])



            content += `${i+1}. ${user} - \$${bankBalance[i].data} \n`



        }



        const embed = new EmbedBuilder()

        .setColor("#000001")

        .setTitle(`${message.guild.name} LEADERBOARD`)

        .setDescription(`** ${content} **`)

        .setTimestamp()



        message.channel.send({ embeds: [embed] })

}