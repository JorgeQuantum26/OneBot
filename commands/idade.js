const Discord = require("discord.js");
const db = require('../systems/firestore');

module.exports = {
run: async (client, message, args) => {
  
const idade = args.join(" ");

const user = message.author;

   let ban = await db.fetch(`banido_${user.id}`);
  if(ban >= 1) return message.channel.send(`${message.author}, Você foi banido! ¯\_(ツ)_/¯\n\nVocê está na minha Blacklist e não pode usar meus comandos, Será que é tão difícil assim seguir as regras?\n\nCaso você ache que seu banimento foi injusto (Concerteza não foi), você pode entrar em Contato com a Equipe Do OneBot\n\nAo entrar em contato conosco, aguarde que logo iremos resolver seu problema, caso você tenha sido banido(a) injustamente iremos resolver, caso contrário você permanecerá banido(a) `)

if(isNaN(idade[0])){
 let jorge_numeros_error = new Discord.EmbedBuilder()
  .setColor('Random')
  .setTitle(`Erro!`)
  .setDescription(`<a:nao:868232161289986128>|${message.author}, Utilize Apenas Números!`);

return message.channel.send({ embeds: [jorge_numeros_error] })
};

  if (!idade) {
    let jorge_idade_error = new Discord.EmbedBuilder()
    .setColor('Random')
    .setTitle(`Erro!`) .setDescription(`<a:nao:868232161289986128>|${message.author}, Insira uma Idade\n\nExemplo: \`B!idade 15\``)
  };

   let jorge_sucesso = new Discord.EmbedBuilder()
  .setColor('Random')
  .setTitle(`Idade Alterada!`) 
.setDescription(`<a:sim:868232093556166756>|${message.author}, Você Trocou Sua Idade com Sucesso!`)
  .setFooter({ text: { text: `Idade Alterada com Sucesso!`, iconURL: message.author.displayAvatarURL({ format: "png" }) } });

 message.channel.send({ embeds: [jorge_sucesso] });
  db.set(`idade_${user.id}`, idade);
 }
}