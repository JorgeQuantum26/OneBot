const db = require('../systems/firestore');

const Discord = require('discord.js');


exports.run = async (bot, message, args) => {
      let user = bot.users.cache.get(args[0]) || message.mentions.users.first() ||  message.author;

     let ban = await db.fetch(`banido_${user.id}`);

const embed1 = new Discord.EmbedBuilder()
  .setTitle(`ERRO - BLACKLIST`)
  .setColor('Random')
  .setDescription(`${message.author}, Você foi banido! ¯\_(ツ)_/¯\n\nVocê está na minha Blacklist e não pode usar meus comandos, Será que é tão difícil assim seguir as regras?\n\nCaso você ache que seu banimento foi injusto (Concerteza não foi), você pode entrar em Contato com a Equipe Do OneBot\n\nAo entrar em contato conosco, aguarde que logo iremos resolver seu problema, caso você tenha sido banido(a) injustamente iremos resolver, caso contrário você permanecerá banido(a)\n\nFormas de suporte:\n\n[Servidor, Suporte mais rápido.](https://discord.gg/sVkB8dtKp7)\n[Site(Use para suporte via EMAIL)](https://equipeonebot.wixsite.com/websiteonebot)`)
  if(ban >= 1) return message.channel.send({ embeds: [embed1] })
    let money = db.fetch(`money_${message.guild.id}_${user.id}`)
    if(money === null) money = 0;
  
    let bank = db.fetch(`banco_${message.guild.id}_${user.id}.saldo`)
    if(bank === null) bank = 0;
  let banco = db.fetch(`banco_${message.guild.id}_${user.id}.nomeb`);
  if(banco === null) banco = "***___A conta não existe___***";
  
let bau1 = db.fetch(`baum_${user.id}`)
if(bau1 === null); bau1 = 0;
let bau2 = db.fetch(`baup_${user.id}`)
if(bau2 === null); bau2 = 0;
let bau3 = db.fetch(`baudo_${user.id}`)
if(bau3 === null); bau3 = 0;

let bau4 = db.fetch(`baumag_${user.id}`)
if(bau4 === null); bau4 = 0;

let bau5 = db.fetch(`bausm_${user.id}`)
if(bau5 === null); bau5 = 0;

let bau6 = db.fetch(`baug_${user.id}`)
if(bau6 === null); bau6 = 0;

let bau7 = db.fetch(`baulndr_${user.id}`)
if(bau7 === null); bau7 = 0;

let bau8 = db.fetch(`baurld_${user.id}`)
if(bau8 === null); bau8 = 0;
   const embed = new Discord.EmbedBuilder()
    .setColor("#6400b6")
    .setTitle(`Carteira
`)
              
.setDescription(`` +
    `\n\n💵 | **Carteira**: **${money.toLocaleString()}**` +
    `\n🏦 | **Banco Saldo**: **${bank.toLocaleString()}**\n🏦 | **Banco Nome**: **${banco}**\nBaú de madeira: ${bau1}\nBaú de Prata: \`${bau2}\`\nBaú de Ouro: \`${bau3}\`\nBaú mágico : \`${bau4}\`\nBaú Super Mágico: \`${bau5}\`\nBáu Gigante: \`${bau6}\`\nBaú Lendário: \`${bau7}\`\nBaú do Rei Lendário: \`${bau8}\`\n\`Coins de ${user}\`\n`)
   .setFooter({ text: `Carteira` })
   .setTimestamp();
    message.channel.send(`${user}`, embed);

}  
