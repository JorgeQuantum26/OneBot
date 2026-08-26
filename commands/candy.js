const db = require('../systems/firestore');
exports.run = async (client, message) => { db.add(`doces_${message.author.id}`, 1); return message.channel.send('🍬 Você caçou um doce!'); };
