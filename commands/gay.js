const Discord = require('discord.js');

module.exports = {

    'name': 'gay',
    'description': 'mostra se vc ou alguem que vc mencionar e um gay ou nao.',
    'author': 'Jorge',


    run: async (client, message, args) => {

    let ban = await db.fetch(`banido_${user.id}`);
  if(ban >= 1) return message.channel.send(`${message.author}, Você foi banido! ¯\_(ツ)_/¯\n\nVocê está na minha Blacklist e não pode usar meus comandos, Será que é tão difícil assim seguir as regras?\n\nCaso você ache que seu banimento foi injusto (Concerteza não foi), você pode entrar em Contato com a Equipe Do OneBot\n\nAo entrar em contato conosco, aguarde que logo iremos resolver seu problema, caso você tenha sido banido(a) injustamente iremos resolver, caso contrário você permanecerá banido(a) `)
   
    let gay = Math.round(Math.random() * 100)
        let pessoinha = message.mentions.users.first() || message.author;
        if(!pessoinha) return message.channel.send(`<a:X_Icon:806588437049638992>|${message.author}, Mencione uma pessoa para ver se é gay ou não`)
        let frase
    if(gay > 80) {
      gay = ("é 80% gay...");
    } else if(gay>= 40) {
      gay = ("é 40% gay"); 
    } else if(gay>= 10){
      gay = ("é 10% gay")
    } else {
      gay = ("É 100% gay"); 
    }
      
    let embedin = new Discord.EmbedBuilder()
    .setTitle('Gay!?')
    .setDescription(`🙀| ${pessoinha} ${gay}`)
    .setColor('RAMDOM')

    message.channel.send(`${message.author}`, embedin)


}}
