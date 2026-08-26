const Discord = require("discord.js");

module.exports = {
  name: "restart",
  run: async (client, message, args) => {
    if(message.auyhot.id === ('758473669658935328')) {
      return message.channel.send(`Você não pode usar esse comando!`);
    }

    await message.channel.send(`Reiniciando...`);

    process.exit();
  }
}