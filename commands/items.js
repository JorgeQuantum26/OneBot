const Discord = require("discord.js");
const db = require('../systems/firestore');

exports.run = async (client, message, args) => {

   let user = message.author;
 let ban = await db.fetch(`banido_${user.id}`);
  if(ban >= 1) return message.channel.send(`${message.author}, Você foi banido! ¯\_(ツ)_/¯\n\nVocê está na minha Blacklist e não pode usar meus comandos, Será que é tão difícil assim seguir as regras?\n\nCaso você ache que seu banimento foi injusto (Concerteza não foi), você pode entrar em Contato com a Equipe Do OneBot\n\nAo entrar em contato conosco, aguarde que logo iremos resolver seu problema, caso você tenha sido banido(a) injustamente iremos resolver, caso contrário você permanecerá banido(a) `)

   const embed = new Discord.EmbedBuilder()
.setTitle(`Informações dos Itens`)
    .addFields(
                { name: 'Cajado Da Cura', value: `**Cajado, raro (requer sintonização druida)

O cajado tem 5 cargas, Para usar as 5 cargas é preciso estar com Sua Magia Nível 5. Enquanto estiver empunhando-o, você pode usar uma ação para gastar 1 ou mais de suas cargas para conjurar uma das seguintes magias através dele, usando a CD de resistência de suas magias: curar ferimentos (1 carga por nível de magia, até 4°), restauração menor (2 cargas) ou curar ferimentos em massa (5 cargas).

O cajado recupera 1d6 + 4 cargas gastas diariamente. Se você gastar a última carga, O cajado desaparece num lampejo de luz, se perdendo para sempre. Use-o com Sabedoria**`, inline: true},
  
                { name: 'Poção de Energia', value: `**Beber esta Poção concede-lhe +100 de Energia! Mas você só pode beber está poção quando estiver com o HP abaixo de 45!**`, inline: true},
      
                { name: 'Machado de Mão', value: `**Uma pequena arma quando se considera a típica luta de um guerreiro, o machado de mão é realmente incrivelmente útil, e você saberá o porque.

Como uma arma leve, ela se presta bem a lutas com as duas mãos como um ataque improvisado de um guerreiro.

Também pode ser lançado como uma espécie de ataque à distância.

Como uma arma corpo a corpo e de longo alcance, o machado de mão não deve ser ignorada no arsenal de um lutador.

Além disso, Causa 100 de 1000 em dano cortante completa as vantagens de usar este Machado!

Porém você não consegue usar escudo enquanto empunhar este machado!**`, inline: true},
      
                { name: 'Poção da Invulnerabilidade', value: `**Uma poção relativamente simples de entender, mas que vai incomodar seu oponente sem fim se você usá-la corretamente.

Esta maravilhosa poção lhe dará resistência a todos os danos. É uma poção incrível que absolutamente salvará sua vida.


Mas depois do Primero golpe que o Oponente lhe dar e você estiver com a invulnerabilidade ativa, ela será quebrada.**`, inline: true})

  .setFooter({ text: `© RPG OneBot` })
  .setTimestamp();

  message.channel.send({ embeds: [embed] });
}