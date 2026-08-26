const Discord = require("discord.js");
const db = require('../systems/firestore');

exports.run = async (client, message, args) => {
  let leaderboard = [];
  let users = message.guild.members.cache.filter(member => !member.user.bot);

    users.forEach(user => {
      db.get(`doces_${user.id}`).then(doces => {
        if (doces === null) doces = 0;

        leaderboard.push({ user: user, doces: doces });

        if (leaderboard.length === users.size) {
          leaderboard.sort((a, b) => b.doces - a.doces);

          const embed = new Discord.EmbedBuilder()
            .setTitle("Halloween OneBot **|** Leaderboard")
            .setColor(Math.floor(Math.random() * 0xffffff));

          leaderboard.forEach((entry, index) => {
            embed.addFields({ name: `#${index + 1} - ${entry.user.user.username}`, value: `Doces: ${entry.doces}`, inline: false });
          });

          message.channel.send({ embeds: [embed] });
        }
      });
    });

}
