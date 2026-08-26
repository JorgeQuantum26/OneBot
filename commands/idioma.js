const Discord = require("discord.js");
const db = require('../systems/firestore');

exports.run = async (client, message, args) => {
  
let idiomaDefinido = db.get(`idioma_${message.guild.id}.idioma`);

if (!idiomaDefinido) {
  // O idioma não foi definido ou está definido como português
  // Execute ações em português aqui.

  const  embed_default = new Discord.EmbedBuilder()
     .setTitle(`Teste de Idioma - Não Definido`)
  .setColor('Random')
  .setDescription(`Executando teste no idioma padrão - Português`)
.setFooter({ text: `© OneBot 2023` })
  .setTimestamp();

  message.channel.send({ embeds: [embed_default] })
} else if (idiomaDefinido === "english") {
  // O idioma está definido como inglês
  // Execute ações em inglês aqui 

  
  const  embed_english = new Discord.EmbedBuilder()
     .setTitle(`Language Test - English`)
  .setColor('Random')
  .setDescription(`Running test in the set language - English`) //Executando teste no idioma definido - Inglês 
.setFooter({ text: `© OneBot 2023` })
  .setTimestamp();

  message.channel.send({ embeds: [embed_english] })
} else if (idiomaDefinido === "português") {
  // O idioma está definido como um valor inválido
  // Faça algo aqui para lidar com isso.
  
  const  embed_br = new Discord.EmbedBuilder()
     .setTitle(`Teste de Idioma - Português `)
  .setColor('Random')
  .setDescription(`Executando teste no idioma definido - Português`)
.setFooter({ text: `© OneBot 2023` })
  .setTimestamp();

  message.channel.send({ embeds: [embed_br] })
}
}