const Discord = require("discord.js");
const { QuickDB } = require('../systems/firestore');
const db = new QuickDB;
exports.run = async (client, message, args) => {

  db.set(`cassMoney_${message.guild.id}`, 3000);
}