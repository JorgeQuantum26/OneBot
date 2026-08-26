const db = require('../systems/firestore');
exports.run = async (client, message, args) => { const porta = args[0]; if (!porta) return message.channel.send('Informe uma porta.'); db.set(`porta_${message.author.id}`, porta); return message.channel.send(`🚪 Porta escolhida: **${porta}**.`); };
