const Discord = require("discord.js");
const db = require('./systems/firestore');

exports.run = async(client, message, args) => {

  let user = message.mentions.users.first();
  
    let força = await db.fetch(`vip_${user}`);
    if(força >= 1) return message.channel.send(`<a:nao:868232161289986128>**|** ${message.author}, O usuário ${user} Já possuí Vip!`)

  if(!user) return message.channel.send(`<a:nao:868232161289986128>**|**${message.author}, Mencione alguém para adicionar o **VIP**.`)

  
  let dev = await db.fetch(`developer_${user.id}`);
  if(dev < 1) return message.channel.send(`<a:nao:868232161289986128>**|** ${message.author}, Apenas um desenvolvedor meu pode adicionar VIP's!`);

  const embed = new Discord.MessageEmbed()
  .setTitle(`<:user_vip:1074455285399302154> | **VIP ADICIONADO!**`)
  .setColor('Random')
  .addFields(
                { name: 'Vip Adicionado Para:', value: `${user}`, inline: true},
  
                { name: 'Responsável:', value: `${message.author}`, inline: true})

    .setFooter(`© RPG OneBot`)
    .setTimestamp()

  db.add(`vip_${user.id}`, 1);

  message.channel.send(embed);
}