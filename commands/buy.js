const db = require('../systems/firestore');
exports.run = async (client, message, args) => { const nome = args.join(' '); if (!nome) return message.channel.send('Informe o item.'); const itens = db.get(`items_${message.author.id}`) || []; itens.push(nome); db.set(`items_${message.author.id}`, itens); return message.channel.send(`✅ Item **${nome}** adquirido.`); };
