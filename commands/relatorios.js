const Discord = require("discord.js");
const db = require('../systems/firestore');

module.exports = {
  name: "relatorios",
  author: "Jorge",
  description: "Exibe os relatórios registrados",
  run: async (client, message, args) => {
    let relatorios = await db.get("relatorio") || [];
    
    if (relatorios.length === 0) {
      const noReports = new Discord.EmbedBuilder()
        .setTitle("📋 Relatórios")
        .setColor('#3498db')
        .setDescription("Nenhum relatório foi registrado até o momento.")
        .setFooter({ text: "© OneBot 2024 | Todos os Direitos Reservados" })
        .setTimestamp();

      return message.channel.send({ embeds: [noReports] });
    }

    const embed = new Discord.EmbedBuilder()
      .setTitle("📋 Relatórios Registrados")
      .setColor('#3498db')
      .setDescription(relatorios.map((rel, index) => `${index + 1}. ${rel}`).join("\n"))
      .setFooter({ text: "© OneBot 2024 | Todos os Direitos Reservados" })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
};