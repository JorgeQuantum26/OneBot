const db = require('../systems/firestore');
exports.run = async (client, message) => { db.add(`doces_${message.author.id}`, 1); return message.channel.send(`🍬 Você encontrou um doce! Total: ${db.get(`doces_${message.author.id}`)}`); };
