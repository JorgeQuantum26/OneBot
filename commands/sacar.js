const Discord = require("discord.js");
const db = require('../systems/firestore');

exports.run = async (client, message, args) => {
  let user = message.author.id;
  let usuario = message.author;

  // Verifica se o usuário está banido
  let ban = await db.fetch(`banido_${user}`);
  if (ban >= 1) {
    const embed1 = new Discord.EmbedBuilder()
      .setTitle(`ERRO - BLACKLIST`)
      .setColor('Random')
      .setDescription(`${message.author}, Você foi banido! ¯\\_(ツ)_/¯\n\nVocê está na minha Blacklist e não pode usar meus comandos...`);
    return message.channel.send({ embeds: [embed1] });
  }

  if (!args[0]) {
    message.channel.send(`<:recusado:1031262539272687777>**|**${usuario} Insira um valor para depositar!`);
    return;
  }

  const firstEditDelay = 5000;
  const secondEditDelay = 10000;

  
      let money = await db.get(`banco_${message.guild.id}_${user}.saldo`);
  if (money === null) money = 0;
  let blocked = await db.fetch(`bancoBloqueado_${user}`);
  if (blocked && blocked.ativo) {
    const embed2 = new Discord.EmbedBuilder()
      .setDescription(`<:recusado:1031262539272687777>**|**${usuario}, Você está banido dos sistemas bancários...`)
      .addFields(
        { name: `Motivo:`, value: `${blocked.motivo}`, inline: true },
        { name: `Tempo:`, value: `${blocked.tempo}`, inline: true },
        { name: `Banido por:`, value: `${blocked.nome}`, inline: true }
      );
    return message.channel.send({ embeds: [embed2] });
  }

  

  if(args[0] === 'all') {
    const embed5 = new Discord.EmbedBuilder()
      .setColor('#e67e22')
      .setDescription(`<a:carregando:1246119195901689888>**|** Removendo OneCoins do seu banco, aguarde...`);
    let msg = await message.channel.send({ embeds: [embed5] });

    setTimeout(async () => {
      const embed3 = new Discord.EmbedBuilder()
        .setTitle(`Ultimas etapas...`)
        .setColor('#e67e22')
        .setDescription(`<a:carregando:1246119195901689888>**|** Adicionando OneCoins em sua carteira...`);
      await msg.edit({ embeds: [embed3] });
    }, firstEditDelay);
  setTimeout(async () => {
      
      await db.add(`money_${message.guild.id}_${user}`, money);
      await db.subtract(`banco_${message.guild.id}_${user}.saldo`, money);

      const embed4 = new Discord.EmbedBuilder()
        .setTitle(`Saque`)
        .setColor('#2ecc71')
        .setDescription(`<a:verificado_icon1:1245042804133072976>**|** ${usuario}, Você realizou um saque de **${money}** OneCoins.`);
      await msg.edit({ embeds: [embed4] });
  }, secondEditDelay);
    } else {
  let withAmount = parseInt(args[0]);
  if (isNaN(withAmount)) {
    message.channel.send(`<:recusado:1031262539272687777>**|**${usuario}, Use apenas números!`);
    return;
  }

  if (money < withAmount) {
    message.channel.send(`<:recusado:1031262539272687777>**|** Você não tem tanto dinheiro para sacar! Saldo Bancário disponível: \`\`\`${money}\`\`\``);
    return;
  }

  if (withAmount <= 0) {
    message.channel.send(`<:recusado:1031262539272687777>**|** Você não pode sacar **0** ou menos!`);
    return;
  }

    const embed7 = new Discord.EmbedBuilder()
    .setColor('#e67e22')
    .setDescription(`<a:carregando:1246119195901689888>**|** Removendo OneCoins do seu banco, aguarde....`)
    let msg = await message.channel.send({ embeds: [embed7] });

    setTimeout(async () => {

      const embed8 = new Discord.EmbedBuilder()
      .setTitle("Ultimas etapas...")
      .setColor('#e67e22')
      .setDescription(`<a:carregando:1246119195901689888>**|** Adicionando OneCoins em sua carteira...`)
   await msg.edit({ embeds: [embed8] });
    }, firstEditDelay);
      setTimeout(async () => {
      await db.add(`money_${message.guild.id}_${user}`, withAmount);
      await db.subtract(`banco_${message.guild.id}_${user}.saldo`, withAmount);

      const embed6 = new Discord.EmbedBuilder()
        .setTitle(`Saque`)
        .setColor('#2ecc71')
        .setDescription(`<a:verificado_icon1:1245042804133072976>**|** ${usuario}, Você realizou um saque de **${withAmount}** OneCoins.`);
      await msg.edit({ embeds: [embed6] });
  }, secondEditDelay);
 }
};