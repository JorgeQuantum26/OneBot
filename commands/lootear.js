const Discord = require("discord.js");
const db = require('../systems/firestore');

module.exports = {
  name: 'lootear', 
  description: 'Lootear itens',
  run: async (client, message, args) => {
    let user = message.author;

    let partidaAtiva = db.get(`partida_${user.id}`) || false;
    if(partidaAtiva === false) {
      const semPartida = new Discord.EmbedBuilder()
      .setTitle(`:x: | Erro`)
      .setColor('#e74c3c')
      .setDescription(`Você não iniciou uma partida!`)
      .setFooter({ text: `© OneBot 2024 - Todos os Direitos Reservados` })
      .setTimestamp();

      message.channel.send({ embeds: [semPartida] });
      return;
    }
    const map = {
      "Clock Tower": [
        { item: "MP40", type: "arma", dano: 48 },
        { item: "Kit Médico ", type: "item" }
      ],
      "Factory": [
        { item: "AK47", type: "arma", dano: 61},
        { item: "M4A1", type: "arma", dano: 55 },
        { item: "M500", type: "arma", dano: 67 },
        { item: "Kit Medico", type: "item" }
      ],
      "Hangar": [
      { item: "M60", type: "arma", dano: 56 },
     { item: "Kit Médico", type: "item" },
      ]
    }

    let location = db.get(`location_${user.id}`); 
    if(!location) {
      message.channel.send(`Você precisa se mover para um local!`);
      return;
    }

    let loot = map[location];
    let item = loot[Math.floor(Math.random() * loot.length)];

    let inventory = db.get(`inventory_${user.id}`) || [];
    inventory.push(item);

    db.set(`inventory_${user.id}`, inventory);

    if(item === inventory) {
      message.channel.send(`Você encontrou ${item.item}, Porém largou para trás, pois ja possuí um(a) no seu inventário.`);
      return;
    }
    const embed = new Discord.EmbedBuilder()
    .setTitle(`⚒️ | LOOTS`)
    .setColor(Math.floor(Math.random() * 0xffffff))
    .setDescription(`Na cidade ${location} você encontrou um(a) ${item.item}!`)
    .setFooter({ text: `© OneBot 2024 - Todos os Direitos Reservados!` })
    .setTimestamp();

    if(item.type === "arma") {
      embed.addFields({ name: `Dano:`, value: `${item.dano}`, inline: true });
    }
    
    message.channel.send({ embeds: [embed] });

  }
}