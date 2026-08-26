const Discord = require("discord.js");
const db = require('../systems/firestore');
const ms = require("parse-ms");

module.exports = {
  name: "lavagem",
  description: "Este comando serve para você lavar dinheiro",
  run: async (client, message, args) => {
    
let user = message.author;

 let ban = await db.fetch(`banido_${user.id}`);
  if(ban >= 1) return message.channel.send(`${message.author}, Você foi banido! ¯\_(ツ)_/¯\n\nVocê está na minha Blacklist e não pode usar meus comandos, Será que é tão difícil assim seguir as regras?\n\nCaso você ache que seu banimento foi injusto (Concerteza não foi), você pode entrar em Contato com a Equipe Do OneBot\n\nAo entrar em contato conosco, aguarde que logo iremos resolver seu problema, caso você tenha sido banido(a) injustamente iremos resolver, caso contrário você permanecerá banido(a) `)

let criminal = await db.fetch(`crime_${user.id}`);
if(criminal < 1) return message.channel.send(`<a:nao:868232161289986128>|Você não é criminoso é não pode realizar uma lavagem de dinheiro!`);

   
    let embed2 = new Discord.EmbedBuilder()
    .setColor("#000000")
    .setTitle(`Erro`)
      .setDescription(`<a:nao:868232161289986128>|Insira uma quantia para lavar!`);
  
    if (!args[0]) {
        return message.channel.send(`${message.author}`, embed2);


    }; 
    let dinheiro = await db.fetch(`sujo_${user.id}`);
        let embed4 = new Discord.EmbedBuilder()
    .setColor("#000000")
    .setTitle(`Erro`)
          .setDescription(`<a:nao:868232161289986128>**|**${message.author}, Para fazer uma lavagem de dinheiro você precisa de no mínimo \`100\` Dinheiro sujo! `);

    if (dinheiro < 100) {
        return message.channel.send(`${message.author}`, embed4);
    };


let din = await db.fetch(`lav_${user.id}`);

    if (din !== null && timeout - (Date.now() - din) > 0) {



        let time = ms(timeout - (Date.now() - din));

  

        let timeEmbed = new Discord.EmbedBuilder()

        .setColor("#000001")

        .setDescription(`<a:nao:868232161289986128>|Você já realizou uma lavagem de dinheiro hoje!\n\nTente novamente daqui a **${time.hours}h ${time.minutes}m ${time.seconds}s**`);

        

        message.channel.send({ embeds: [timeEmbed] });

    }else {
let embed5 = new Discord.EmbedBuilder()
     .setTitle(`Erro`)
      .setColor('Random')
      .setDescription(`<a:nao:868232161289986128>|${message.author}, Insira uma quantidade Válida!`)
    
    if (isNaN(args[0])){
        return message.channel.send(`${message.author}`, embed5);
    };
    db.add(`rpgcoins_${user.id}`, args[0]);
db.subtract(`sujo_${user.id}`, args[0]);

     const embed = new Discord.EmbedBuilder()
      .setTitle(`Lavagem de dinheiro`)
      .setColor('Random')
      .setDescription(`${message.author} Você realizou uma lavagem de dinheiro!`)
      .addFields({ name: `Dinheiro sujo lavado:`, value: `${args[0]}`, inline: true })
      .setFooter({ text: `© RPG OneBot` })

      message.channel.send({ embeds: [embed] });
    }
  }
}