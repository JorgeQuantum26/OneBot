const Discord = require("discord.js");
const db = require('../systems/firestore');

module.exports = {
 name: "curar.js",
  description: "Se cure com este comando e fique com sua vida completamente Cheia",
  run: async (client, message, args) => {

    let user = message.author;
     let ban = await db.fetch(`banido_${user.id}`);

const embed1 = new Discord.EmbedBuilder()
  .setTitle(`ERRO - BLACKLIST`)
  .setColor('Random')
  .setDescription(`${message.author}, Você foi banido! ¯\_(ツ)_/¯\n\nVocê está na minha Blacklist e não pode usar meus comandos, Será que é tão difícil assim seguir as regras?\n\nCaso você ache que seu banimento foi injusto (Concerteza não foi), você pode entrar em Contato com a Equipe Do OneBot\n\nAo entrar em contato conosco, aguarde que logo iremos resolver seu problema, caso você tenha sido banido(a) injustamente iremos resolver, caso contrário você permanecerá banido(a)\n\nFormas de suporte:\n\n[Servidor, Suporte mais rápido.](https://discord.gg/sVkB8dtKp7)\n[Site(Use para suporte via EMAIL)](https://equipeonebot.wixsite.com/websiteonebot)`)
  if(ban >= 1) return message.channel.send({ embeds: [embed1] })

    let kit = await db.fetch(`med_${user.id}`)
    if(kit < 1) return message.channel.send(`<a:nao:868232161289986128>|${message.author}, Você não tem pelo menos \`1\` Kit Médicos para se curar.`)
    let vida = await db.fetch(`hp_${user.id}`)
    if(vida >= 2000) return message.channel.send(`<a:nao:868232161289986128>|${message.author}, Você já tem sua vida cheia (2000), Não precisa se curar agora.`);

    let vida2 = await db.fetch(`hp_${user.id}`);
if(vida2 > 15) return message.channel.aend(`<a:nao:868232161289986128>**|**Você só pode usar o Curar com menos de 15 HP.`);
    const embed = new Discord.EmbedBuilder()
    .setTitle(`Curar`)
    .setDescription(`${message.author}, Você se curou e recuperou **2000** HP da sua vida.`)
.setFooter({ text: `© RPG OneBot` })
    . setTimestamp();

    db.add(`hp_${user.id}`, 2000);

    db.subtract(`med_${user.id}`, 1);
    
message.channel.send({ embeds: [embed] });
  }
}