const Discord = require("discord.js");
const db = require('../systems/firestore');

module.exports = {
  name: "registro",
  author: "Jorge",
  description: "Registro de antecedentes",
  run: async (client, message, args) => {

    let investigador = message.author;
    
    let suspeito = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!suspeito || suspeito.id === message.author.id) {
      const error_01 = new Discord.EmbedBuilder()
      .setTitle(`<a:nao:868232161289986128> Erro Encontrado`)
      .setColor('#e74c3c')
      .setDescription(`**${message.author}**, durante a checagem de antecedentes, ocorreu um erro desconhecido.`)
      .setFooter({ text: `© OneBot 2024 | Todos os Direitos Reservados` })
      .setTimestamp();

      message.channel.send({ embeds: [error_01] });
      return;
    }

    let profissão = await db.get(`militaria_${investigador.id}`)
    if(profissão < 1) {
      const error_02 = new Discord.EmbedBuilder()

       .setTitle(`<a:nao:868232161289986128> Erro Encontrado`)
      .setColor('#e74c3c')
      .setDescription(`**${investigador}**, durante a tentativa de checagem de antecedentes, o sistema detectou que você não serve de nenhuma função militar do Exército Brasileiro.\nA checagem de antecedentes foi imediatamente cancelada e um relatório foi enviado para o Alto Escalão das Forças Armadas para análise.`)
      .setFooter({ text: `© OneBot 2024 | Todos os Direitos Reservados` })
      .setTimestamp();

      
      message.channel.send({ embeds: [error_02] });
      db.push(`relatorios`, `⚠️ **${investigador}** tentou checar antecedentes de ${suspeito}, porém, o sistema detectou que ele não serve de nenhuma função militar do Exército Brasileiro.`)
      return;
    }

    let antecedentes = await db.get(`registro_${suspeito.id}`) || "📋Nada irregular detectado"
    const checagem = new Discord.EmbedBuilder()
    .setTitle(`📋 Checando Antecedentes de **${suspeito.user.username}**`)
    .setColor('#3498db')
    .addFields({ name: `Histórico de antecedentes:`, value: `${antecedentes}`, inline: true })
    .setFooter({ text: `© OneBot 2024 | Todos os Direitos Reservados` })
    .setTimestamp();

    message.channel.send({ embeds: [checagem] });
    if(antecedentes.lenght > 1) {
      db.push(`relatorios`, `⚠️ **${investigado}** checou antecedentes de **${suspeito}** e obteve os seguintes resultados:\n${antecedentes}`);
    } else {
      db.push(`relatorio`, `📋 **${investigador}** checou os antecedentes de **${suspeito}** e obteve os seguintes resultados:\n\n**${antecedentes}**`)
    }
  }
}
  