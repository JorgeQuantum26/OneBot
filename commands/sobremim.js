const Discord = require("discord.js");
const db = require('../systems/firestore');

module.exports = {
run: async (client, message, args) => {
  
const sobremim = args.join(" ");

const user = message.author;

  if (!sobremim) {
    let jorge_sobremim_error = new Discord.EmbedBuilder()
    .setColor('Random')
    .setTitle(`Erro!`) .setDescription(`<a:nao:868232161289986128>|${message.author}, Insira uma Descrição\n\nExemplo: \`B!sobremim OneBot É Legal\``)

return message.channel.send({ embeds: [jorge_sobremim_error] });
  };

   let jorge_sucesso = new Discord.EmbedBuilder()
  .setColor('Random')
  .setTitle(`Descrição Alterada!`) 
.setDescription(`<a:sim:868232093556166756>|${message.author}, Você Trocou Sua Descrição com Sucesso!`)
  .setFooter({ text: { text: `Descrição Alterado com Sucesso!`, iconURL: message.author.displayAvatarURL({ format: "png" }) } });

  message.channel.send({ embeds: [jorge_sucesso] });
  db.set(`sobremim_${user.id}`, sobremim);
 }
}