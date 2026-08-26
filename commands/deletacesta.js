const Discord = require("discord.js");
const db = require('../systems/firestore');

exports.run = async (client, message, args) => {
  let user = message.author;

    // Verificar se o usuário tem permissão para usar o comando (opcional)

  if(message.author.id === "758473669658935328") {

    // Percorrer todos os usuários do servidor
    
      // Definir a variável "doces" como 0 para cada usuário
      db.set(`doces_${user.id}`, 0);
    
     db.delete(`cesta_${user.id}`);
     db.delete(`capacidade_${user.id}`);
    message.reply("A variável 'doces' foi definida como 0 para todos os usuários. E A sua cesta foi deletada");
  } else {
    return message.channel.send(`<a:nao:868232161289986128>**|**${message.author}, Somente meu criador pode utilizat este comando!`);
  }
} 
