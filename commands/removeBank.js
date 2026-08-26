const db = require('../systems/firestore');
exports.run = async (client, message, args) => { const valor = Number(args[1] || args[0]) || 0; const saldo = Math.max(0, (Number(db.get(`banco_${message.author.id}.saldo`)) || 0) - valor); db.set(`banco_${message.author.id}.saldo`, saldo); return message.channel.send(`🏦 Saldo bancário: ${saldo.toLocaleString('pt-BR')}`); };
