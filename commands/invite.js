const Discord = require("discord.js");

exports.run = async (client, message, args) => {

   let ban = await db.fetch(`banido_${user.id}`);
  if(ban >= 1) return message.channel.send(`${message.author}, Você foi banido! ¯\_(ツ)_/¯\n\nVocê está na minha Blacklist e não pode usar meus comandos, Será que é tão difícil assim seguir as regras?\n\nCaso você ache que seu banimento foi injusto (Concerteza não foi), você pode entrar em Contato com a Equipe Do OneBot\n\nAo entrar em contato conosco, aguarde que logo iremos resolver seu problema, caso você tenha sido banido(a) injustamente iremos resolver, caso contrário você permanecerá banido(a) `)

let embed = new Discord.EmbedBuilder()
.setTitle(`Me Adicione!`)
.setDescription(`Olá ${message.author} Obrigado Por Querer Me Adicionar!  
  [Me adicione clicando aqui](https://discordapp.com/oauth2/authorize?client_id=806321120713768991&scope=bot&permissions=2146958847https://discordapp.com/oauth2/authorize?client_id=806321120713768991&scope=bot&permissions=2146958847)`)
.setFooter({ text: `© Convidar - OneBot` })

  message.channel.send({ embeds: [embed] });
}
