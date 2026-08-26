const Discord = require("discord.js");
const db = require('../systems/firestore');
const ms = require("parse-ms");

const cooldowns = new Set();

module.exports = {  
  name: "daily",  
  aliases: ["Daily", "dailY", "premio"],  
  description: "Colete seu Daily Diário!",  
  run: async (bot, message, args) => {     
    if (cooldowns.has(message.author.id)) {
      return message.channel.send(`${message.author}, você precisa esperar um pouco antes de coletar seu Daily novamente.`);
    }

    let premium = await db.fetch(`premiumplan`);
    let ban = await db.fetch(`banido`);  

    if (ban >= 1) {
      return message.channel.send(`${message.author}, você foi banido e não pode usar meus comandos.`);
    }

    let user = message.author;           
    let premiumv1 = await db.fetch(`premium1_${user.id}`);
    let premiumv2 = await db.fetch(`premium2_${user.id}`);
    let premiumv3 = await db.fetch(`premium3_${user.id}`);

    if (premiumv3) {
      // Benefícios premium 3.
      let timeout3 = 0;        
      let daily3 = await db.fetch(`dailyV3_${user.id}`);    
      if (daily3 !== null && timeout3 - (Date.now() - daily3) > 0) {      
        let time3 = ms(timeout3 - (Date.now() - daily3));   
        const jorge_espera3 = new Discord.EmbedBuilder()      
          .setColor('Random')      
          .setTitle(`**Daily Diário Premium V3**`)      
          .setDescription(`<a:nao:868232161289986128>|${message.author}, você já coletou seu Daily Diário recentemente! Aguarde **${time3.hours} Horas, ${time3.minutes} Minutos, e ${time3.seconds} Segundos!** Para coletar seu Daily novamente.`)      
        message.channel.send({ embeds: [jorge_espera3] });    
      } else {
        let coins3 = Math.floor(Math.random() * 8850) + 600;
        const jorge_receber3 = new Discord.EmbedBuilder()
          .setTitle(`**Daily Diário (PREMIUM V3)**`)
          .setColor('#2ecc71')
          .setDescription(`<a:sim:868232093556166756>**|** ${message.author}, você coletou seu Daily Diário **(PREMIUM V3)**! E Recebeu ${coins3} OneCoins!\n\nPor você ser Premium V3, você recebeu **1289** OneCoins de Bônus.`)
          .setFooter({ text: `© Economia - OneBot` })
          .setTimestamp();
        message.channel.send({ embeds: [jorge_receber3] });
        db.add(`money_${message.guild.id}_${user.id}`, coins3);
        db.set(`dailyV3_${user.id}`, Date.now());

        cooldowns.add(message.author.id);
        setTimeout(() => {
    ;      cooldowns.delete(message.author.id);
        }, 21600000); // Tempo de espera em milissegundos (6 horas)
      } 
    } else if (premiumv2) {
      // Benefícios Premium 2.
      let timeout2 = 43200000;        
      let daily2 = await db.fetch(`dailyV2_${user.id}`);    
      if (daily2 !== null && timeout2 - (Date.now() - daily2) > 0) {      
        let time2 = ms(timeout2 - (Date.now() - daily2));   
        const jorge_espera2 = new Discord.EmbedBuilder()      
          .setColor('Random')      
          .setTitle(`Daily Diário Premium V2`)      
          .setDescription(`<a:nao:868232161289986128>|${message.author}, Você Já Coletou Seu Daily Diário Recentemente! Aguarde **${time2.hours} Horas, ${time2.minutes} Minutos, e ${time2.seconds} Segundos!** Para Coletar Seu Daily Novamente!`)      
        message.channel.send({ embeds: [jorge_espera2] });    
      } else {
        let coins2 = Math.floor(Math.random() * 5800) + 400;
        const jorge_receber2 = new Discord.EmbedBuilder()
          .setTitle(`**Daily Diário (PREMIUM V2)**`)
          .setColor('#2ecc71')
          .setDescription(`<a:sim:868232093556166756>**|** ${message.author}, Você coletou seu  Daily Diário **(PREMIUM V2)**! E Recebeu ${coins2} OneCoins!`)
          .setFooter({ text: `© Economia - OneBot` })
          .setTimestamp();
        message.channel.send({ embeds: [jorge_receber2] });
        db.add(`money_${message.guild.id}_${user.id}`, coins2);
        db.set(`dailyV2_${user.id}`, Date.now());

        cooldowns.add(message.author.id);
        setTimeout(() => {
          cooldowns.delete(message.author.id);
        }, 43200000); // Tempo de espera em milissegundos (12 horas)
      } 
    } else if (premiumv1) {
      // Benefícios Premium 1.
      let timeout1 = 57600000;        
      let daily1 = await db.fetch(`dailyV1_${user.id}`);    
      if (daily1 !== null && timeout1 - (Date.now() - daily1) > 0) {      
        let time1 = ms(timeout1 - (Date.now() - daily1));   
        const jorge_espera1 = new Discord.EmbedBuilder()      
          .setColor('Random')      
          .setTitle(`Daily Diário Premium V1`)      
          .setDescription(`<a:nao:868232161289986128>|${message.author}, Você Já Coletou Seu Daily Diário Recentemente! Aguarde **${time1.hours} Horas, ${time1.minutes} Minutos, e ${time1.seconds} Segundos!** Para Coletar Seu Daily Novamente!`)      
        message.channel.send({ embeds: [jorge_espera1] }); 
      } else {
        let coins1 = Math.floor(Math.random() * 3600) + 250;
        const jorge_receber1 = new Discord.EmbedBuilder()
          .setTitle(`**Daily Diário (PREMIUM V1)**`)
          .setColor('#2ecc71')
          .setDescription(`<a:sim:868232093556166756>**|**${message.author}, Você Coletou o Seu Daily Diário **(PREMIUM V1)**! E Recebeu ${coins1} OneCoins!`)
          .setFooter({ text: `© Economia - OneBot` })
          .setTimestamp();
        message.channel.send({ embeds: [jorge_receber1] });
        db.add(`money_${message.guild.id}_${user.id}`, coins1);
        db.set(`dailyV1_${user.id}`, Date.now());

        cooldowns.add(message.author.id);
        setTimeout(() => {
          cooldowns.delete(message.author.id);
        }, 57600000); // Tempo de espera em milissegundos (16 horas)
      }
    } else {
      // Resto do código para usuários sem premium
      let timeout = 86400000;        
      let daily = await db.fetch(`daily_${user.id}`);    
      if (daily !== null && timeout - (Date.now() - daily) > 0) {      
        let time = ms(timeout - (Date.now() - daily));   
        const jorge_espera = new Discord.EmbedBuilder()      
          .setColor('Random')      
          .setTitle(`Daily Diário`)      
          .setDescription(`<a:nao:868232161289986128>|${message.author}, Você Já Coletou Seu Daily Diário Recentemente! Aguarde **${time.hours} Horas, ${time.minutes} Minutos, e ${time.seconds} Segundos!** Para Coletar Seu Daily Novamente!`)      
        message.channel.send({ embeds: [jorge_espera] });    
      } else {      
        let coins = Math.floor(Math.random() * 2950) + 200;
        const jorge_receber = new Discord.EmbedBuilder()    
          .setColor('Random')    
          .setTitle(`Daily Diário`)    
          .setDescription(`<a:sim:868232093556166756>|${message.author}, Você Coletou o Seu Daily Diário! E Recebeu ${coins} Coins!`)
          .setFooter({ text: { text: `© Economia - OneBot`, iconURL: message.author.displayAvatarURL({ format: "png" }) } })      
          .setTimestamp();      
        message.channel.send({ embeds: [jorge_receber] });    
        db.add(`money_${message.guild.id}_${user.id}`, coins);      
        db.set(`daily_${user.id}`, Date.now());    
        
        cooldowns.add(message.author.id);
        setTimeout(() => {
          cooldowns.delete(message.author.id);
        }, 86400000); // Tempo de espera em milissegundos (24 horas)
      }
    }
  }
}
