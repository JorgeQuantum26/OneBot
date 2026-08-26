const Discord = require("discord.js");
const ms = require("parse-ms");
const db = require('../systems/firestore');

module.exports = {
  name: "pol",
  aliases: ["policial", "Policial"],
  description: "Trabalhe como Um Policial",
  timeout:  1000,
 run: async (bot, message, args) => {

   
  let user = message.author;


   
  let timeout = 8640000;

   let ban = await db.fetch(`banido_${user.id}`);
  if(ban >= 1) return message.channel.send(`${message.author}, Você foi banido! ¯\_(ツ)_/¯\n\nVocê está na minha Blacklist e não pode usar meus comandos, Será que é tão difícil assim seguir as regras?\n\nCaso você ache que seu banimento foi injusto (Concerteza não foi), você pode entrar em Contato com a Equipe Do OneBot\n\nAo entrar em contato conosco, aguarde que logo iremos resolver seu problema, caso você tenha sido banido(a) injustamente iremos resolver, caso contrário você permanecerá banido(a) `)
 
  let pol = await db.fetch(`pol_${user.id}`);
if (pol !== null && timeout - (Date.now() - pol) > 0) {

  let time = ms(timeout - (Date.now() - pol));

  const timeEmbed = new Discord.EmbedBuilder()
.setColor('Random')
  .setTitle(`Trabalho`)
  .setDescription(`<a:nao:868232161289986128>|${message.author}, Você Já Trabalhou Recentemente! Aguarde \`${time.hours} Horas, ${time.minutes} Minutos, e ${time.seconds} Segundos\`! Para Trabalhar Novamente!`)
  .setFooter({ text: `© Economia - OneBot` })

  message.channel.send({ embeds: [timeEmbed] });

} else {

  let coins = Math.floor(Math.random() * 1500) + 100;

  const jorgeEmbed = new Discord.EmbedBuilder()
  .setColor('Random')
  .setTitle(`Trabalho`)
  .setDescription(`<a:sim:868232093556166756>|Você  Trabalhou Como um Policial E Prendeu Muitos Ladrões! E Você  Recebeu ${coins} Coins  `)
.setFooter({ text: `© Economia - OneBot` })
  message.channel.send({ embeds: [jorgeEmbed] })

  db.add(`money_${message.guild.id}_${user.id}`, coins);
  db.set(`pol_${user.id}`, Date.now());
  
 }
 }
} 