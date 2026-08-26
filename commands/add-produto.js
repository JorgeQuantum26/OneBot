const db = require('../systems/firestore');
exports.run = async (client, message, args) => {
  const nome = args[0];
  if (!nome) return message.channel.send('Informe o nome do produto.');
  const produtos = db.get('produtos') || {};
  produtos[nome] = { nome, preco: Number(args[1]) || 0, criadoPor: message.author.id };
  db.set('produtos', produtos);
  return message.channel.send(`Produto **${nome}** adicionado.`);
};
