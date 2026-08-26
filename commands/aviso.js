const Discord = require("discord.js");
module.exports = {
  name: "say",
  description: "Faça o Bot Dizer Algo",
  run: async (client, message, args) => {

    message.delete();
    let user = message.author;

    let mensagem = args.slice(" ").join(" ");

    if (!mensagem) return message.channel.send(`<a:nao:868232161289986128>| Você Tem que Escrever Algo! `)

    if (!message.member.hasPermissions("KICK_MEMBERS"));
return message.channel.send(`<a:nao:868232161289986128>| Você Não Tem A Permissão De \`Expulsar_Membros\` para Usar Este Comando! `)

    const jorge1 = new Discord.EmbedBuilder()
    .setTitle(`Aviso`)      .setDescription(`${mensagem}`)
    .setFooter({ text: { text: `Avisado Por: ${message.author.tag}`, iconURL: message.author.displayAvatarURL ({format: png}) } })
    .setTimestamp();

    message.channel.send({ embeds: [jorge1] }); 
 } 
} 