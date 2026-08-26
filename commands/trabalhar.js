const Discord = require("discord.js");
const db = require('../systems/firestore');

const cooldowns = new Set();

exports.run = async(client, message, args) => {
  let user = message.author;

  if(cooldowns.has(message.author.id)) {
    message.channel.send(`Você precisa aguardar um pouco para trabalhar novamente.`);
    return;
  }
  let amount = Math.floor(Math.random() * 2500) + 1420;
  let trabalhos =['👨‍💻 Programador', '⛏️ Minerador', '🧪 Cientista', '⚖️ Juiz', '🏗️ Construtor', '⛑️ Bombeiro', '🏥 Médico', '👮 Policial'];

  let profissão = Math.floor(Math.random() * trabalhos.length);

  const embed1 = new Discord.EmbedBuilder()
  .setTitle(`Trabalho`)
  .setColor(Math.floor(Math.random() * 0xffffff))
  .setDescription(`Você trabalhou como **${trabalhos[profissão]}** e ganhou **${amount}** OneCoins!`)
  .setFooter({ text: `© Economia OneBot - Todos os direitos reservados.` })
  .setTimestamp();

  db.add(`money_${message.guild.id}_${user.id}`, amount);

  cooldowns.add(message.author.id);

  setTimeout(() => {
    cooldowns.delete(message.author.id);
  }, 57600000);
  
  message.channel.send({ embeds: [embed1] });
}