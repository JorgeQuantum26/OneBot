const { exec } = require("child_process");
const Discord = require("discord.js");

const desenvolvedores = ["758473669658935328", "722554164730789918", "767437457443520522", "814935774515560499"];

exports.run = async (bot, message, args) => {
  if (!desenvolvedores.includes(message.author.id)) {
    return message.reply("Desculpe, este comando é exclusivo para desenvolvedores.");
  }

  const embed = new Discord.EmbedBuilder()
    .setTitle("Iniciando otimização do bot")
    .setDescription("Por favor, aguarde...")
    .setFooter({ text: { text: `Executado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() } });

  const sentEmbed = await message.channel.send({ embeds: [embed] });

  exec("npm run optimize", (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      embed.setDescription("Ocorreu um erro durante a otimização.")
        .setColor('#e74c3c');
      sentEmbed.edit({ embeds: [embed] });
      return;
    }

    setTimeout(() => {
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        embed.setDescription("Ocorreu um erro durante a otimização.")
          .setColor('#e74c3c');
        sentEmbed.edit({ embeds: [embed] });
        return;
      }

      console.log(`stdout: ${stdout}`);
      embed.setTitle("Otimização concluída com sucesso")
        .setDescription(`Otimização executada por ${message.author.tag}`)
        .setColor('#2ecc71')
        .setFooter({ text: { text: bot.user.username, iconURL: bot.user.displayAvatarURL() } });
      sentEmbed.edit({ embeds: [embed] });
    }, 5000);
  });
};

