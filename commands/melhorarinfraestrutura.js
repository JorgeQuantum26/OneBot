const Discord = require("discord.js");
const db = require('../systems/rpg-db');

const recursos = ["ouro", "comida", "madeira", "pedra"];

exports.run = async (client, message, args) => {
  let username = message.author.username;

  let pais = db.get(`${message.author.id}.pais`);
  if (!pais) {
    return message.channel.send(`<:recusado:1031262539272687777>**|** ${username}, você não possui um país registrado!`);
  }

  let governador = db.get(`pais_${pais}.governador`);
  if (message.author.id !== governador) {
    return message.channel.send(`<:recusado:1031262539272687777>**|** ${username}, apenas o governador do país **${pais}** pode aumentar a infraestrutura.`);
  }

  let nivelInfra = db.get(`pais_${pais}.infraestrutura`) || 0;

  // 🔥 impede bug de undefined
  if (nivelInfra >= 5) {
    return message.channel.send(`<:recusado:1031262539272687777>**|** ${username}, o país **${pais}** já atingiu o nível máximo de infraestrutura (5).`);
  }

  // 🔁 recurso agora nunca quebra
  let recursoNecessario = recursos[nivelInfra % recursos.length];

  let tesouro = db.get(`pais_${pais}.tesouro`) || 0;
  let quantidadeRecursos = db.get(`pais_${pais}.${recursoNecessario}`) || 0;

  // 💰 inflação + scaling
  let inflacao = db.get(`pais_${pais}.inflacao`) || 0.1;

  let precoBase = 500;
  let precoNivel = precoBase * (1 + nivelInfra); // escala com nível
  let precoFinal = Math.floor(precoNivel * (1 + inflacao)); // aplica inflação

  if (tesouro < precoFinal || quantidadeRecursos < 50) {
    return message.channel.send(
      `<:recusado:1031262539272687777>**|** ${username}, o país **${pais}** não possui recursos suficientes para aumentar a infraestrutura.\n\n` +
      `Necessário: **${precoFinal}** moedas no tesouro e **50** ${recursoNecessario}.\n` +
      `Atual: **${tesouro}** moedas e **${quantidadeRecursos}** ${recursoNecessario}.`
    );
  }

  // 💸 aplica custo
  db.subtract(`pais_${pais}.tesouro`, precoFinal);
  db.subtract(`pais_${pais}.${recursoNecessario}`, 50);
  db.add(`pais_${pais}.infraestrutura`, 1);

  let embed = new Discord.EmbedBuilder()
    .setColor(Math.floor(Math.random() * 0xffffff))
    .setTitle(`🏗️ Infraestrutura Melhorada!`)
    .setDescription(
      `<:aceitado:1031262771326759002> **${username}**, você melhorou a infraestrutura de **${pais}** para o nível **${nivelInfra + 1}**!`
    )
    .addFields({ name: '💰 Custo', value: `🪙 ${precoFinal} moedas\n📦 ${recursoNecessario}: 50 unidades`, inline: true })
    .addFields({ name: '📊 Inflação atual', value: `${(inflacao * 100).toFixed(1)}%`, inline: true })
    .setFooter({ text: 'Sistema econômico dinâmico' })
    .setTimestamp();

  message.channel.send({ embeds: [embed] });
};