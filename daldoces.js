const Discord = require("discord.js");
const db = require('./systems/firestore');
const ms = require("parse-ms");

module.exports = {
  name: "daily",
  aliases: ["Daily", "dailY", "premio"],
  description: "Colete seu Daily Diário!",
  timeout: 1000,
  run: async (bot, message, args) => {


     let user = message.author;
    
     let ban = await db.fetch(`banido_${user.id}`);
  if(ban >= 1) return message.channel.send(`${message.author}, Você foi banido! ¯\_(ツ)_/¯\n\nVocê está na minha Blacklist e não pode usar meus comandos, Será que é tão difícil assim seguir as regras?\n\nCaso você ache que seu banimento foi injusto (Concerteza não foi), você pode entrar em Contato com a Equipe Do OneBot\n\nAo entrar em contato conosco, aguarde que logo iremos resolver seu problema, caso você tenha sido banido(a) injustamente iremos resolver, caso contrário você permanecerá banido(a) `)

    
     
            let amount = await db.fetch(`cesta_${user.id}`)

            if(amount < 1) return message.channel.send('Você não possui Cesta de Doces para coletar doces diários!');


       let capacidadeMaxima = db.fetch(`capacidade_${user.id}`);
          let doce = await db.fetch(`doces_${user.id}`)
         let cesta_2 = await db.fetch(`cesta_${user.id}`);
    
    let timeout = 86400000;
    
    let dailydoces = await db.fetch(`dailydoces_${user.id}`);
    if (dailydoces !== null && timeout - (Date.now() - dailydoces) > 0) {

      let time = ms(timeout - (Date.now() - dailydoces));

   const jorge_espera = new Discord.MessageEmbed()
      .setColor('Random')
      .setTitle(`Daily Doces`)
      .setDescription(`<a:nao:868232161289986128>|${message.author}, Você Já Coletou Seu Daily Diário Recentemente! Aguarde **${time.hours} Horas, ${time.minutes} Minutos, e ${time.seconds} Segundos!** Para Coletar Seu Daily Novamente!`)

      message.channel.send(jorge_espera);
    } else {
        if(doce >= capacidadeMaxima) {
         return message.channel.send(`<a:nao:868232161289986128>**|**${message.author}, Sua cesta atingiu a capacidade máxima de doces! `);
          return;
        } else {
               let doces = Math.floor(Math.random() * 100) + 10;

      
const jorge_receber = new Discord.MessageEmbed()
    .setColor('Random')
    .setTitle(`Daily Doces`)
    .setDescription(`<a:sim:868232093556166756>|${message.author}, Você Coletou seus Dpces diários! E Recebeu ${doces} Doces!`)
.setFooter(`© Halloween - OneBot`, message.author.displayAvatarURL({ format: "png" }))
      .setTimestamp();
      message.channel.send(jorge_receber);
    db.add(`doces_${user.id}`, doces);
      db.set(`dailydoces_${user.id}`, Date.now());

        
        }
      }
    }
}