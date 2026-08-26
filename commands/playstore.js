const Discord = require("discord.js");
const PlayStore = require("google-play-scraper");
const EmbedColor = ``;



module.exports = {
  name: "playstore",
  aliases: ["loja ps", "loja de aplicativos do Google", "ps"],
  description: "Mostre as informações do seu nome sobre o aplicativo da Play Store! Autor: Jorge",
  usage: "Loja de jogos <Application Name>",
  category: "Members",
  run: async (client, message, args) => {
    if (!args[0])
      return message.channel.send(
        `<a:X_Icon:806588437049638992>|Por favor, dê algo para pesquisar - ${message.author}   `
      );
 let ban = await db.fetch(`banido_${user.id}`);
  if(ban >= 1) return message.channel.send(`${message.author}, Você foi banido! ¯\_(ツ)_/¯\n\nVocê está na minha Blacklist e não pode usar meus comandos, Será que é tão difícil assim seguir as regras?\n\nCaso você ache que seu banimento foi injusto (Concerteza não foi), você pode entrar em Contato com a Equipe Do OneBot\n\nAo entrar em contato conosco, aguarde que logo iremos resolver seu problema, caso você tenha sido banido(a) injustamente iremos resolver, caso contrário você permanecerá banido(a) `)

    PlayStore.search({
      term: args.join(" "),
      num: 1
    }).then(Data => {
      let App;

      try {
        App = JSON.parse(JSON.stringify(Data[0]));
      } catch (error) {
        return message.channel.send(
          `<a:X_Icon:806588437049638992>|Infelizmente Nenhum aplicativo encontrado  ${message.author.username}!`
        );
      }

      let Embed = new Discord.EmbedBuilder()
        .setColor('#fdfdfd')
        .setThumbnail(App.icon)
        .setURL(App.url)
        .setTitle(`${App.title}`)
        .setDescription(App.summary)
        .addFields({ name: `Preço Do App`, value: App.priceText, inline: true })
        .addFields({ name: `Desenvolvedor(a) do App`, value: App.developer, inline: true })
        .addFields({ name: `Ponto`, value: App.scoreText, inline: true })
        .setFooter({ text: `Comando Executado Por ${message.author.username}` })
        .setTimestamp();

      return message.channel.send({ embeds: [Embed] });
    });
  }
};