const Discord = require("discord.js");
const ms = require("parse-ms");
const db = require('../systems/firestore');


module.exports = {
  name: "cie",
  aliases: ["cientista", "Cientista"],
  description: "Trabalhe como Um Cientista!",
  timeout:  1000,
 run: async (bot, message, args) => {

  let user = message.author;
     let ban = await db.fetch(`banido_${user.id}`);

const embed1 = new Discord.EmbedBuilder()
  .setTitle(`ERRO - BLACKLIST`)
  .setColor('Random')
  .setDescription(`${message.author}, Você foi banido! ¯\_(ツ)_/¯\n\nVocê está na minha Blacklist e não pode usar meus comandos, Será que é tão difícil assim seguir as regras?\n\nCaso você ache que seu banimento foi injusto (Concerteza não foi), você pode entrar em Contato com a Equipe Do OneBot\n\nAo entrar em contato conosco, aguarde que logo iremos resolver seu problema, caso você tenha sido banido(a) injustamente iremos resolver, caso contrário você permanecerá banido(a)\n\nFormas de suporte:\n\n[Servidor, Suporte mais rápido.](https://discord.gg/sVkB8dtKp7)\n[Site(Use para suporte via EMAIL)](https://equipeonebot.wixsite.com/websiteonebot)`)
  if(ban >= 1) return message.channel.send({ embeds: [embed1] })

   
  let timeout = 8640000;

   
  let cie = await db.fetch(`cie_${user.id}`);
if (cie !== null && timeout - (Date.now() - cie) > 0) {

  let time = ms(timeout - (Date.now() - cie));

  const timeEmbed = new Discord.EmbedBuilder()
.setColor('Random')
  .setTitle(`Trabalho`)
.setDescription(`<a:nao:868232161289986128>|${message.author}, Você Já Trabalhou Recentemente! Aguarde \`${time.hours} Horas, ${time.minutes} Minutos, e ${time.seconds} Segundos\`! Para Trabalhar Novamente!`)
  .setFooter({ text: `© Economia - OneBot` })

  message.channel.send({ embeds: [timeEmbed] });

} else {

  let quantidadeDoces = db.fetch(`doces_${user.id}`);

  let capacidade = db.fetch(`capacidade_${user.id}`);

  if(quantidadeDoces >= capacidade) {
    return message.channel.send(`<a:nao:868232161289986128>**|**${message.author}, Você atingiu a capacidade máxima de doces em sua cesta! Se essa era a sua 4° cesta, teste comprar o Vip para desbloquear novas cestas!`) 
  } else {

  let coins = Math.floor(Math.random() * 1500) + 100;

  let candy = Math.floor(Math.random() * 50) + 10;
    
  const jorgeEmbed = new Discord.EmbedBuilder()
  .setColor('Random')
  .setTitle(`Trabalho`)
  .setDescription(`<a:sim:868232093556166756>|Você Trabalhou Como Cientista e ajudou a Desenvolver Uma Cura Para Um Vírus! Você Recebeu ${coins} Coins\n\nVocê também ganhou ${candy} Doces!`)
.setFooter({ text: `© Economia - OneBot` })
  message.channel.send({ embeds: [jorgeEmbed] })

  db.add(`money_${message.guild.id}_${user.id}`, coins);
    db.add(`doces_${user.id}`, candy);
    
  db.set(`cie_${user.id}`, Date.now());
  
 }
}
 }
}