const cooldown = new Set();


module.exports = {
    name: "cooldown",
    author: "ferinha",

    run: async (client, message, args) => {

    let tempo_em_milisegundos = 10000; //Coloque o tempo em milisegundos (Obs: 1 segundo = Mil milisegundos)  

      
     let ban = await db.fetch(`banido_${user.id}`);

const embed1 = new Discord.EmbedBuilder()
  .setTitle(`ERRO - BLACKLIST`)
  .setColor('Random')
  .setDescription(`${message.author}, Você foi banido! ¯\_(ツ)_/¯\n\nVocê está na minha Blacklist e não pode usar meus comandos, Será que é tão difícil assim seguir as regras?\n\nCaso você ache que seu banimento foi injusto (Concerteza não foi), você pode entrar em Contato com a Equipe Do OneBot\n\nAo entrar em contato conosco, aguarde que logo iremos resolver seu problema, caso você tenha sido banido(a) injustamente iremos resolver, caso contrário você permanecerá banido(a)\n\nFormas de suporte:\n\n[Servidor, Suporte mais rápido.](https://discord.gg/sVkB8dtKp7)\n[Site(Use para suporte via EMAIL)](https://equipeonebot.wixsite.com/websi""""teonebot)`)
  if(ban >= 1) return message.channel.send({ embeds: [embed1] })
    if(cooldown.has(message.author.id)) {

message.channel.send(`${message.author} | Você precisa aguardar \`${tempo_em_milisegundos} segundos\` para utilizar este comando novamente!`).then(msg=>{msg.delete({timeout:5000})})

    } else {
  

  let fulano = message.mentions.users.first() || client.users.cache.get(args[0]) || message.author;
 
   let Discord = require("discord.js")
   let msg = new Discord.EmbedBuilder()
    .setColor(`FF0000`) 
    .setTitle(fulano.tag) 
    .setImage(fulano.avatarURL({ dynamic: true, format: "png", size: 1024 })) 
    .setFooter({ text: { text: `Comando requisitado por: ${message.author.tag}`, iconURL: message.author.displayAvatarURL({format: "png"}) } });

    message.channel.send({ embeds: [msg] });


  
       
        cooldown.add(message.author.id);
        setTimeout(() => {
            cooldown.delete(message.author.id)
        }, `${tempo_em_milisegundos}`);
    }
}
}