const Discord = require("discord.js");
const db = require('../systems/firestore');

exports.run = async (client, message, args) => {

  let user = message.mentions.members.first();

  let dev = await db.fetch(`developer2_${user.id}`);
  if(dev < 1) return message.channel.send(`<a:nao:868232161289986128>|Apenas meus Desenvolvedores de Nível 2+ Podem Executar Este Comando!`)

 
const banimento = "Não" 

  let reason = args.join(" ").slice(22);
  if(!reason) return message.channel.send(`<a:nao:868232161289986128>**|**${message.author}, Coloque um motivo!`)

 if (!user) return message.channel.send(`<a:nao:868232161289986128>**|**${message.author}, Mencione um usuário ou insira o ID`);

  const embed = new Discord.EmbedBuilder()
  .setTitle(`**Banimento Do Bot**`)
  .setColor('Random')
  .setDescription(`<:online:806557394779504670> O usuário foi desbanido com sucesso e pode utilizar mais os meus comandos! Para banir utilize \`B!blacklist <usuario>\` `)
  .setFooter({ text: `` })
  .setTimestamp();

  message.channel.send({ embeds: [embed] })
  db.set(`banido_${user.id}`, 0);
  db.set(`cargo_${user.id}`, banimento);
}