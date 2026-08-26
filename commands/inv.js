
const Discord = require("discord.js");
const db = require('../systems/firestore');

exports.run = async (bot, message, args) => {
    
      let user = bot.users.cache.get(args[0]) || message.mentions.users.first() ||  message.author;

   let ban = await db.fetch(`banido_${user.id}`);
  if(ban >= 1) return message.channel.send(`${message.author}, Você foi banido! ¯\_(ツ)_/¯\n\nVocê está na minha Blacklist e não pode usar meus comandos, Será que é tão difícil assim seguir as regras?\n\nCaso você ache que seu banimento foi injusto (Concerteza não foi), você pode entrar em Contato com a Equipe Do OneBot\n\nAo entrar em contato conosco, aguarde que logo iremos resolver seu problema, caso você tenha sido banido(a) injustamente iremos resolver, caso contrário você permanecerá banido(a) `)

    let item1 = await db.fetch(`machado1_${user.id}`);
    if(item1 === null) item1 = "Nenhum";

    let item2 = await db.fetch(`coraçao_${user.id}`);
    if(item2 === null) item2 = "Nenhum";
  
     let item3 = await db.fetch(`poçao_${user.id}`);
    if(item3 === null) item3 = "Nenhum";
 
   let item4 = await db.fetch(`imortal_${user.id}`);
  if(item4 === null) item4 = "Nenhum";

  let item5 = await db.fetch(`peso_${user.id}`);
  if(item5 === null) item5 = 0;

  let item6 = await db.fetch(`peso1_${user.id}`);
  if(item6 === null) item6 = 0;

let item7 = await db.fetch(`boxe_${user.id}`);
  if(item7 === null) item7 = 0;

  let item8 = await db.fetch(`espada_${user.id}`);
   if(item8 === null) item8 = 0;

  let item9 = await db.fetch(`katana_${user.id}`);
  if(item9 === null) item9 = 0;

  let item10 = await db.fetch(`escudo_${user.id}`);
  if(item10 === null) item10 = 0;

  let item11 = await db.fetch(`arma_${user.id}`);
  if(item11 === null) item11 = "Nenhum";
  
const embed = new Discord.EmbedBuilder()
  .setColor('Random')
  .setTitle(`Inventário de ${user}`)
    .addFields(
                { name: 'Machado de Mão', value: `${item1}`, inline: true},
      
                { name: 'Cajado de Cura', value: `${item2}`, inline: true},

                { name: 'Poção de Energia', value: `${item3}`, inline: true},
      
                { name: 'Poção da Invulnerabilidade', value: `${item4}`, inline: true},
      
               { name: 'Peso 30kg:', value: `${item5}`, inline: true},
      
              { name: 'Peso 50kg:', value: `${item6}`, inline: true},
      
             { name: 'Luva de Boxe', value: `${item7}`, inline: true},
      
             { name: 'Espada Normal:', value: `${item8}`, inline: true}, 
      
             { name: 'Katana:', value: `${item9}`, inline: true},
      
            { name: 'Escudo:', value: `${item10}`, inline: true},
      
            { name: 'Arma:', value: `${item11}`, inline: true})


      .setFooter({ text: `© RPG OneBot` })
  .setTimestamp();
  
  message.channel.send({ embeds: [embed] });
  
}

