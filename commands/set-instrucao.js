const Discord = require("discord.js");
const db = require('../systems/firestore');

exports.run = async (client, message, args) => {
  let user = message.author;
  let bot = client.user;
  let introducao = args.join(" ");
  
  if (!introducao) {
    const erro1 = new Discord.EmbedBuilder()
    .setTitle(`<a:nao:868232161289986128> Erro`)
    .setColor(Math.floor(Math.random() * 0xffffff))
    .setDescription(`Você não inseriu uma instrução para Free Fire!`)
    .setFooter({ text: `© OneBot 2024 - Todos os Direitos Reservados` })
    .setTimestamp();

    message.channel.send({ embeds: [erro1] });
    return;
  }

  if(user.id !== "758473669658935328") {
    const erro2 = new Discord.EmbedBuilder()
    .setTitle(`<a:nao:868232161289986128> Erro`)
    .setColor('#e74c3c')
    .setDescription(`Você não tem permissão para usar este comando!`)
    .setFooter({ text: `© OneBot 2024 - Todos os Direitos Reservados` })
    .setTimestamp();

    message.channel.send({ embeds: [erro2] });
    return;
  }
  if(introducao.length < 50) {
    const erro3 = new Discord.EmbedBuilder()
    .setTitle(`<a:nao:868232161289986128> Erro`)
    .setColor('#e74c3c')
    .setDescription(`A instrução deve ter no mínimo 50 caracteres `)
    .setFooter({ text: `© OneBot 2024 - Todos os Direitos Reservados` })
    .setTimestamp();
    message.channel.send({ embeds: [erro3] });
    return;
  }

  const embed = new Discord.EmbedBuilder()
  .setTitle(`<a:sim:868033150446788629> Sucesso!`)
  .setColor('#2ecc71')
  .setDescription(`${user} A instrução foi definida com sucesso! Use \`\`\`B!instrucao-freefire\`\`\` para ver a instrução!`)
  .addFields({ name: `Instrução:`, value: `${introducao}`, inline: true })
  .setFooter({ text: `© OneBot 2024 - Todos os Direitos Reservados` })
  .setTimestamp();

  message.channel.send({ embeds: [embed] });
  db.set(`introducao`, introducao);
}