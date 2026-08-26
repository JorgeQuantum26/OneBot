
const db = require('../systems/firestore');

exports.run = async (client, message, args) => {
  const saldoAtual = db.get(`${message.author.id}.saldo`);

  if (!saldoAtual) {
    return message.channel.send("Você ainda não tem saldo registrado.");
  }

  const saldoArredondado = saldoAtual.toFixed(2);
  message.channel.send(`Seu saldo atual é: ${saldoArredondado} Moedas.`);
};