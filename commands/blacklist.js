const Discord = require("discord.js");
const db = require('../systems/firestore');

exports.run = async (client, message, args) => {

  let user = message.mentions.members.first();


const banimento = "O Usuário está na Minha Blacklist" 
 const desbanimento = "Não"

   let adicionar = args[0]
  
    let reason = args[2];
    if (!adicionar) {
     return message.channel.send(`<a:nao:868232161289986128>**|**${message.author}, Não foi possível executar o comando\n**Exemplo:**\nB!blacklist add @user <motivo> / B!blacklist remove @user <motivo>`);
   } else if (adicionar !== "add" && adicionar !== "remove") {
      return message.channel.send(`<a:nao:868232161289986128>**|**${message.author}, O segundo argumento deve ser "add" ou "remove"!`);
   }
 
     if (!user) return message.channel.send(`<a:nao:868232161289986128>**|**${message.author}, Mencione um usuário ou insira o ID`);
  
     

    if(!reason) return message.channel.send(`<a:nao:868232161289986128>**|**${message.author}, Coloque um motivo!`);
  
       let dev = await db.fetch(`developer2_${user.id}`);
  if(dev < 1) return message.channel.send(`<a:nao:868232161289986128>|Apenas Desenvolvedores Responsáveis pela Blacklist do Bot Podem Executar Este Comando!`)
   

   if(adicionar === "add") {
  const embed = new Discord.EmbedBuilder()
  .setTitle(`**Banimento Do Bot**`)
  .setColor('Random')
  .setDescription(`<:online:806557394779504670> O usuário foi banido com sucesso e não pode utilizar mais os meus comandos! Para desbanir utilize \`B!unblacklist <usuario>\` `)
  .setFooter({ text: `` })
  .setTimestamp();

  message.channel.send({ embeds: [embed] })
  db.add(`banido_${user.id}`, 1);
  db.set(`cargo_${user.id}`, banimento);
   } 
  if(adicionar === "remove") {
    const embed = new Discord.EmbedBuilder()
  .setTitle(`**Desbanimento Do Bot**`)
  .setColor('Random')
  .setDescription(`<:online:806557394779504670> O usuário foi desbanido com sucesso e  pode retornar a utilizar os meus comandos! Para banir utilize \`B!blacklist add <usuario> <motivo>\` `)
  .setFooter({ text: `© OneBot 2023` })
  .setTimestamp();

  message.channel.send({ embeds: [embed] });
  db.sub(`banido_${user.id}`, 1);
  db.set(`banido_${user.id}`, desbanimento);
  
  }
}