const db = require('../systems/firestore');
exports.run = async (client, message, args) => { const codigo = args[0]; if (!codigo) return message.channel.send('Informe um código.'); db.set(`redeem_${message.author.id}`, codigo); return message.channel.send('✅ Código registrado para validação.'); };
