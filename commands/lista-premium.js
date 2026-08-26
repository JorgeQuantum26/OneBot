const { EmbedBuilder } = require("discord.js");

const db = require('../systems/firestore');;



exports.run = async (bot, message, args) => {

        let money = db.all().filter(lb => lb.ID.startsWith(`premiumplan_${message.guild.id}`)).sort((a, b) => b.data- a.data)

        let bankBalance = money.slice(0, 20)

        console.log(bankBalance)

        let content = " ";



        for(let i = 0; i < bankBalance.length; i++) {

            let user = bot.users.cache.get(bankBalance[i].ID.split('_')[2])



            content += `${i+1}. ${user} - \ ${bankBalance[i].data}\n`



        }



        const embed = new EmbedBuilder()

        .setColor("#000001")

        .setTitle(`Lista de premium OneBot`)

        .setDescription(`** ${content} **`)

        .setTimestamp()



        message.channel.send({ embeds: [embed] })

}