const Discord = require("discord.js");

const db = require('../systems/firestore');


module.exports = {
name: "warns",
aliases: ["userwarn"],
run: async (client, message, args) => {

let user = message.mentions.members.first() || message.author;
if(!user) {

return message.channel.send("<a:X_Icon:806588437049638992>|Mencione um usuário")
}

let warns = await db.get(`warnsCount_${message.guild.id}-${user.id}`) || 0;

const embed = new Discord.EmbedBuilder()

.setTitle('<:warn_icon:805034777933381672>|Warns')
.setDescription(`**${user} Tem ${warns} Warns**`)
.setColor('#e74c3c')

message.channel.send({ embeds: [embed] });
}
}