const Discord = require("discord.js");
const db = require('../systems/firestore');

exports.run = async (bot, message, args) => {

    let user = bot.users.cache.get(args[0]) || message.mentions.users.first() ||  message.author;

   let ban = await db.fetch(`banido_${user.id}`);
  if(ban >= 1) return message.channel.send(`${message.author}, Você foi banido! ¯\_(ツ)_/¯\n\nVocê está na minha Blacklist e não pode usar meus comandos, Será que é tão difícil assim seguir as regras?\n\nCaso você ache que seu banimento foi injusto (Concerteza não foi), você pode entrar em Contato com a Equipe Do OneBot\n\nAo entrar em contato conosco, aguarde que logo iremos resolver seu problema, caso você tenha sido banido(a) injustamente iremos resolver, caso contrário você permanecerá banido(a) `)

    let doces = db.fetch(`doces_${user.id}`)
    if(doces === null) doces = 0;

  let cesta = db.fetch(`cesta_${user.id}`)
    if(cesta === null) cesta = "Você ainda não comprou uma cesta!";
  let capacidade = db.fetch(`capacidade_${user.id}`)
    if(capacidade === null) capacidade = 0;
 const embed = new Discord.EmbedBuilder()
  .setTitle(`Inventario de doces`)
  .setDescription(`Inventario de ${user}\n\nDoces: **__${doces}__**\nCesta de Doces: **__${cesta}__**\nCapacidade da Cesta: **__${capacidade}__** Doces!`)
  .setFooter({ text: `© Halloween - OneBot` })
  .setTimestamp();

  message.channel.send({ embeds: [embed] })
}