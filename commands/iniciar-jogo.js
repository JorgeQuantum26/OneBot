const db = require('../systems/firestore');
exports.run = async (client, message) => { db.set(`partida_${message.author.id}`, true); return message.channel.send('🎮 Partida iniciada.'); };
