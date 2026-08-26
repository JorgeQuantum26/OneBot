const Discord = require("discord.js");
const db = require('../systems/rpg-db');

exports.run = async (client, message, args) => {

  let pais = args.slice(0, -1).join(" ");
  let jogador = args.pop();

  // Verificar se o jogador já está registrado 

  let jogadorExistente = db.get(`${message.author.id}.jogador`);
  if (jogadorExistente) {
    return message.channel.send(`<:recusado:1031262539272687777>**|**${message.author}, Você já está registrado no RPG!`);
  }

  // Verifica se o país existe

  let paisExistente = db.get(`pais_${pais}`);
  if (!paisExistente) {
    return message.channel.send(`<:recusado:1031262539272687777>**|**${message.author}, O País ${pais} não existe.`);
  }
  
  // Cria um registro no Quick.db para o jogador

  db.set(`${message.author.id}.pais`, pais);
  db.set(`${message.author.id}.jogador`, jogador);
 db.set(`${message.author.id}.saldo`, 0);
  message.channel.send(`<:aceitado:1031262771326759002>**|**${message.author}, Seu registro foi criado! Você é o jogador ${jogador} em ${pais}.`);
  
}