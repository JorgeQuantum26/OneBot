const db = require('../systems/firestore');
exports.run = async (client, message) => { const nivel = db.add(`level_${message.author.id}`, 1); return message.channel.send(`⬆️ Você subiu para o nível ${nivel}.`); };
