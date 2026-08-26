const Discord = require("discord.js");
const db = require('../systems/firestore')

exports.run = async (bot, message, args) => {
   let user = bot.users.cache.get(args[0]) || message.mentions.users.first() ||  message.author;

  
   let classe = await db.fetch(`mago_${user.id}`);
  if(classe < 1) return message.channel.send(`<a:nao:868232161289986128>**|** ${message.author}, Você não é de nenhuma classe de Magos para ver a lista!`);
  let ban = await db.fetch(`banido_${user.id}`);
  if(ban >= 1) return message.channel.send(`${message.author}, Você foi banido! ¯\_(ツ)_/¯\n\nVocê está na minha Blacklist e não pode usar meus comandos, Será que é tão difícil assim seguir as regras?\n\nCaso você ache que seu banimento foi injusto (Concerteza não foi), você pode entrar em Contato com a Equipe Do OneBot\n\nAo entrar em contato conosco, aguarde que logo iremos resolver seu problema, caso você tenha sido banido(a) injustamente iremos resolver, caso contrário você permanecerá banido(a) `)

  const embed = new Discord.EmbedBuilder()
  .setTitle(`**Lista de Magias**`)
    .addFields(
                { name: '**Druída:**', value: `Sintonizar - Serve para você ajudar aos que querem sintonização, Após a sintonização estiver feita, você pode entregar o Cajado de Cura para esse indivíduo\n\nComando para Sintonizar: 
B!sintonizar\n\nComando para Entregar o Cajado:\nB!give-cajado <@usuario>\n\nApenas faça a sintonização com quem de fato quer!`, inline: true},
      
                { name: '**Curar seres**', value: `Aqui você poderá curar pessoas que você desejar, Porém para usar essa magia é necessário você ter **200** de Energia e nível 25 de Magia.`, inline: true},
  
                { name: '**Causar Medo**', value: `Ao Usar isso em alguém, a pessoa não poderá mais te atacar pois essa magia fará ela ficar com Medo, essa magia funciona em Pessoas com O Nivel de Magia **5**`, inline: true},
      
                { name: '**Desespero**', value: `Essa magia fará com que a pessoa fique desesperada, Não conseguindo te atacar. funcionando quase Igual a Magia de Medo. Mas diferente, esse funciona em qualquer nível de magia`, inline: true},
      
                { name: '**Proteção**', value: `Essa magia irá destruir o efeito das Seguintes Magias: **Medo e Desespero**.\n\nPara você poder usar essa magia requer Nivel de Magia 30.`, inline: true})
.setFooter({ text: `© RPG OneBot` })
.setTimestamp()

message.channel.send({ embeds: [embed] });
}