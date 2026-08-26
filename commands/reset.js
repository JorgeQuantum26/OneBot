const Discord = require("discord.js");
const db = require('../systems/firestore');

exports.run = async (client, message, args) => {

  let user = message.author;

 let ban = await db.fetch(`banido_${user.id}`);
  if(ban >= 1) return message.channel.send(`${message.author}, Você foi banido! ¯\_(ツ)_/¯\n\nVocê está na minha Blacklist e não pode usar meus comandos, Será que é tão difícil assim seguir as regras?\n\nCaso você ache que seu banimento foi injusto (Concerteza não foi), você pode entrar em Contato com a Equipe Do OneBot\n\nAo entrar em contato conosco, aguarde que logo iremos resolver seu problema, caso você tenha sido banido(a) injustamente iremos resolver, caso contrário você permanecerá banido(a) `)

const alistado = "Nenhum";
  const patente = "Nenhum";
    const policial = "Não";
        const criminosos = "Meliante";
      const delegacia = "Não";
     const procurado = "Não";
    const medals = "Sem Medalhas por Enquanto"

  let item1 = await db.fetch(`venenof_${user.id}`);
  if(item1 < 1) return message.channel.send(`<a:nao:868232161289986128>**|** Você não possuí O Frasco de veneno!`)

  let item2 = await db.fetch(`rpgcoins_${user.id}`);
  if(item2 < 50000) return message.channel.send(`<a:nao:868232161289986128>**|** Você não possui RPG Coins suficiente! \`${item2}/50000\` `)
  let item3 = await db.fetch(`level_${user.id}`);
  if(item3 < 10) return message.channel.send(`<a:nao:868232161289986128>**|** Você não possuí Nível **10**! 
  para dar Reset!`);
  let item4 = await db.fetch(`reset_${user.id}`)
  if(item4 < 5) return message.channel.send(`<a:nao:868232161289986128>**|** Você não tem **Rebirth Item** o suficiente! \`${item4}/5\` `);
  
  const embed = new Discord.EmbedBuilder()
  .setColor('Random')
  .setTitle(`**Rebirth**`)
  .setDescription(`${message.author}, Você deu Reset, Essa ação é irreversível.\nPorém como recompensa, Você receveu **+1** Rebirth!`)
  .setFooter({ text: `© RPG OneBot` })
  .setTimestamp();

  db.add(`rebirth_${user.id}`, 1);
  db.set(`rpgcoins_${user.id}`, 0);
  db.set(`sujo_${user.id}`, 0);
  db.set(`energia_${user.id}`, 0);
  db.set(`certificado_${user.id}`, 0);
  db.set(`proc_${user.id}`, procurado);
  db.set(`força_${user.id}`, 0);
  db.set(`cargo_${user.id}`, patente);
  db.set(`crimial_${user.id}`, criminosos);
  db.set(`policia_${user.id}`, Policial);
  db.set(`delegado_${user.id}`, delegacia);
  db.set(`medalha_${user.id}`, medals);
  db.set(`venenof_${user.id}`, 0);
  message.channel.send({ embeds: [embed] })
}