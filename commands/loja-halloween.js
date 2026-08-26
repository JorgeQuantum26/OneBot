const Discord = require("discord.js");
const db = require('../systems/firestore');

exports.run = async (client, message, args) => {

  let user = message.author;

  const loja_atual = new Discord.EmbedBuilder()
  .setTitle(`🎃 Loja De Halloween 🎃`)
  .setColor(Math.floor(Math.random() * 0xffffff))
  .setDescription(`Olá ${user}, Veja os itens disponíveis abaixo:\n** 🏷️ Psiu...O que tal comprar o VIP?! Saiba mais em \`\`\`B!sabervip!\`\`\`**`)
  .addFields({ name: 'Cesta 1:', value: 'Capacidade de armazenamento de doces: até 100\n Preço em OneCoins: 500', inline: true })
  .addFields({ name: 'Cesta 2:', value: 'Capacidade de armazenamento de doces: até 450\nPreço em OneCoins: 1.500', inline: true })
  .addFields({ name: 'Cesta 3:', value: 'Capacidade de armazenamento de doces: até 700\nPreço em OneCoins: 2.500', inline: true })
  .addFields({ name: 'Cesta 4:', value: 'Capacidade de armazenamento de doces: até 2500\nPreço em OneCoins: 5.000', inline: true })
  .addFields({ name: 'Cesta 5:', value: 'Capacidade de armazenamento de doces: até 5000\nPreço em OneCoins: 7.500', inline: true })
  .addFields({ name: 'Cesta 6:', value: 'Capacidade de armazenamento de doces: até 7500\nPreço em OneCoins: 10.000', inline: true })
  .addFields({ name: 'Cesta 7:', value: 'Capacidade de armaazenamento de doces: até 12480\nPreço em OneCoins: 15.000 (Requer Vip 3)', inline: true })
  .addFields({ name: 'Cesta 8:', value: 'Capacidade de Armazenamento de Doces: até 15400\nPreço em OneCoins: 20.000', inline: true })
  .addFields({ name: 'Cesta 9:', value: 'Cappacidade de Armazenamento de Doces: até 20.000\nPreço em OneCoins: 25.000', inline: true })
  .addFields({ name: 'Cesta 10:', value: 'Capacidade de armazenamento de doces: até 25000\nPreço em OneCoins: 30.000', inline: true })
        
    .setFooter({ text: `© Use B!comprar <item> | Halloween OneBot` })
    .setTimestamp();  

message.channel.send({ embeds: [loja_atual] })
}