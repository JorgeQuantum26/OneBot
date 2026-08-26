const Discord = require('discord.js');

module.exports = {

    'name': 'gay',
    'description': 'mostra se vc ou alguem que vc mencionar e um gay ou nao.',
    'author': 'Jorge',


    run: async (client, message, args) => {

       let ban = await db.fetch(`banido_${user.id}`);
  if(ban >= 1) return message.channel.send(`${message.author}, Você foi banido! ¯\_(ツ)_/¯\n\nVocê está na minha Blacklist e não pode usar meus comandos, Será que é tão difícil assim seguir as regras?\n\nCaso você ache que seu banimento foi injusto (Concerteza não foi), você pode entrar em Contato com a Equipe Do OneBot\n\nAo entrar em contato conosco, aguarde que logo iremos resolver seu problema, caso você tenha sido banido(a) injustamente iremos resolver, caso contrário você permanecerá banido(a) `)

     let corno = Math.round(Math.random() * 100)
        let pessoinha = message.mentions.users.first() || message.author;
        if(!pessoinha) return message.channel.send(`<a:X_Icon:806588437049638992>|${message.author}, Mencione uma pessoa para ver se é gay ou não`)

        let frase
    if(corno > 80) {
      corno = ("é 80% corno...");
    } else if(corno>= 40) {
      corno = ("é 40% corno"); 
    } else if(corno>= 10){
      corno = ("é 10% corno")
    } else {
      corno = ("É 100% corno"); 
    }
    let embedin = new Discord.EmbedBuilder()
    .setTitle('Corno!?')
    .setDescription(`🐂| ${pessoinha} ${corno}`)
    .setColor(Math.floor(Math.random() * 0xffffff))

    message.channel.send(`${message.author}`, embedin)

}
}
