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
  let money = await db.get(`money_${message.guild.id}_${user}`);
  if (money === null) money = 0;
  
  if (args[0] === "all") {
    if (money <= 0) {
      message.channel.send(`<:recusado:1031262539272687777>**|** Você não tem dinheiro suficiente para depositar!`);
      return;
    }

    
    const embed5 = new Discord.EmbedBuilder()
      .setColor('#e67e22')
      .setDescription(`<a:carregando:1246119195901689888>**|** Realizando depósito, aguarde...`);
    let msg = await message.channel.send({ embeds: [embed5] });

    setTimeout(async () => {
      const embed3 = new Discord.EmbedBuilder()
        .setTitle(`Ultimas etapas...`)
        .setColor('#e67e22')
        .setDescription(`<a:carregando:1246119195901689888>**|** Armazenando OneCoins no Banco...`);
      await msg.edit({ embeds: [embed3] });
    }, firstEditDelay);

    setTimeout(async () => {
      await db.subtract(`money_${message.guild.id}_${user}`, money);
      await db.add(`banco_${message.guild.id}_${user}.saldo`, money);

      const embed4 = new Discord.EmbedBuilder()
        .setTitle(`Depósito`)
        .setColor('#2ecc71')
        .setDescription(`<a:verificado_icon1:1245042804133072976>**|** ${usuario}, Você realizou um depósito de **${money}** OneCoins.`);
      await msg.edit({ embeds: [embed4] });
    }, secondEditDelay);
  } else {
    let withAmount = parseInt(args[0]);
    if (isNaN(withAmount)) {
      message.channel.send(`<:recusado:1031262539272687777>**|**${usuario}, Use apenas números!`);
      return;
    }

    if (money < withAmount) {
      message.channel.send(`<:recusado:1031262539272687777>**|** Você não tem tanto dinheiro para depósito! Saldo disponível: \`\`\`${money}\`\`\``);
      return;
    }

    if (withAmount <= 0) {
      message.channel.send(`<:recusado:1031262539272687777>**|** Você não pode depósito **0** ou menos!`);
      return;
    }

    const embed6 = new Discord.EmbedBuilder()
      .setColor('#e67e22')
      .setDescription(`<a:carregando:1246119195901689888>**|** Realizando depósito, aguarde...`);
    let msg = await message.channel.send({ embeds: [embed6] });

    setTimeout(async () => {
      const embed7 = new Discord.EmbedBuilder()
        .setTitle(`Ultimas etapas...`)
        .setColor('#e67e22')   .setDescription(`<a:carregando:1246119195901689888>**|** Armazenando OneCoins em seu Banco...`);
      await msg.edit({ embeds: [embed7] });
    }, firstEditDelay);

    setTimeout(async () => {
      await db.subtract(`money_${message.guild.id}_${user}`, withAmount);
      await db.add(`banco_${message.guild.id}_${user}.saldo`, withAmount);

      const embed8 = new Discord.EmbedBuilder()
        .setTitle(`Deposito`)
        .setColor('#2ecc71')
        .setDescription(`<a:verificado_icon1:1245042804133072976>**|** ${usuario}, Você realizou um depósito de **${withAmount}** OneCoins.`);
      await msg.edit({ embeds: [embed8] });
    }, secondEditDelay);
  }
};
