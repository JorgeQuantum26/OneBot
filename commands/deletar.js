const db = require('../systems/firestore');

exports.run = async (client, message, args) => {
  let pais = args[0];

  // Verifica se o país existe.
  let paisExistente = db.get(`pais_${pais}`);
  if (!paisExistente) {
    return message.channel.send(`:recusado: | ${message.author}, o país ${pais} não existe!`);
  }

  // Deleta o registro do país.
  db.delete(`pais_${pais}`);

  // Restante do código para enviar a mensagem de sucesso...
  message.channel.send(`<:aceitado:1031262771326759002> | ${message.author}, o país ${pais} foi deletado com sucesso!`);
};