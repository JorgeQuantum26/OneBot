const Discord = require('discord.js');

exports.run = async (client, message, args) => {

const embed = new Discord.EmbedBuilder()
.setColor('#e74c3c')
.setTitle(`Status`)
.setDescription(`

**Usuarios:**
${client.users.cache.size}

**Estou em:**
${client.guilds.cache.size} Servidores

Possuo:
67 comandos\n\nSistema:\n\`Estável 
com pequenos lags\`

`)
.setFooter({ text: `Status OneBot` })

message.delete()

message.channel.send({ embeds: [embed] })
}