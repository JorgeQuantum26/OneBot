const { EmbedBuilder } = require("discord.js");

exports.run = async(client, message, args) => {

    const queue = message.client.queue.get(message.guild.id);
    if (!queue) return message.channel.send("<a:nao:868232161289986128>|Não tem nenhuma tocando no momento").catch(console.error);

    let lyrics = null;

    try {
      lyrics = await lyricsFinder(queue.songs[0].title, "");
      if (!lyrics) lyrics = `Não encontrei letras para essa ${queue.songs[0].title} :(`;
    } catch (error) {
      lyrics = `<a:nao:868232161289986128>| Não encontrei letras para essa ${queue.songs[0].title} `;
    }

    let lyricsEmbed = new EmbedBuilder()
      .setTitle(`Letras da **__${queue.songs[0].title}__**`)
      .setDescription(lyrics)
      .setColor('#2ecc71')
      .setTimestamp();

    if (lyricsEmbed.description.length >= 2048)
      lyricsEmbed.description = `${lyricsEmbed.description.substr(0, 2045)}...`;
    return message.channel.send({ embeds: [lyricsEmbed] }).catch(console.error);
}