
const Discord = require("discord.js");
const db = require('../systems/rpg-db');

exports.run = async (client, message, args) => {
  const idCidadao = message.author.id;
  
  const pais = `${message.author.id}.pais` // Argumento que representa o país

  // Verifica se o país existe no banco de dados
  const paisExiste = db.get(`pais_${pais}`);
  if(!paisExiste) {
    return message.channel.send(`O País não foi encontrado no meu Banco de Dados`)
  }
  // Obtém a quantidade de dinheiro do Tesouro Nacional
  const tesouro2 = db.get(`pais_${pais}.tesouro`);

  // Verifica se o Tesouro Nacional está definido
  if (tesouro2 === undefined) {
    return message.channel.send("O Tesouro Nacional não está definido para esse país.");
  }

  // Cria a embed
  const embed = new Discord.EmbedBuilder()
    .setColor("#ffcc00")
    .setTitle(`**Tesouro Nacional - ${pais}**`)
    .addFields({ name: "País", value: pais, inline: false })
    .addFields({ name: "Quantidade de dinheiro", value: `${tesouro2} Moedas`, inline: false });

  // Envia a embed
  message.channel.send({ embeds: [embed] });
};