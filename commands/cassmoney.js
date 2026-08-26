const Discord = require("discord.js");
const db = require('../systems/firestore');

exports.run = async (client, message, args) => {

  let vitoria = await db.get(`vitoria1`) || 0;
  let derrota = await db.get(`derrota1`) || 0;
  let dinheiroArrecadado = await db.get(`cassCoins`) || 0;
  let dinheiroPerdido = await db.get(`cassCoinsP`) || 0;
  let cassMoney = await db.get(`cassMoney`) || 0;
  
  let autor = message.author;

  let owner = ["758473669658935328"]

  if(autor.id !== owner[0]) {
    message.channel.send(`Você não pode acessar esse painel `);
     return;
  } else {
    const embed1 = new Discord.EmbedBuilder()
    .setTitle(`PAINEL - CASSINO`)
    .setColor(Math.floor(Math.random() * 0xffffff))
    .setDescription(`**Olá ${message.author}, Bem-vindo ao painel de informações do cassino, abaixo você poderá ver o total de: Vitórias, Derrotas, Dinheiro recebido(Os usuários perdem e o dinheiro do cassino aumenta), Dinheiro perdido(Os usuários ganharam e o dinheiro do Cassino cai). Etc.**`)

    .addFields({ name: '🏆 | Vitórias totais:', value: vitoria, inline: true })
    .addFields({ name: '🏆 | Derrotas totais:', value: derrota, inline: true })
    .addFields({ name: '💰 | Dinheiro recebido total;', value: dinheiroArrecadado.toLocaleString(), inline: true })
    .addFields({ name: '💰 | Dinheiro perdido total:', value: dinheiroPerdido.toLocaleString(), inline: true })
    .addFields({ name: '💰 | Dinheiro do Cassino Atualmente:', value: cassMoney.toLocaleString(), inline: true })
    .setFooter({ text: `© Cassino - OneBot || Todos os Direitos Reservados 2024` })
    .setTimestamp();

    message.channel.send({ embeds: [embed1] });
  }
}