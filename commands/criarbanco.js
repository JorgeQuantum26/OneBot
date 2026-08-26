const Discord = require("discord.js");
const db = require('../systems/firestore');
const bancoDisponivel = ["OneBank", "TrustFinance", "SecureBank"];

exports.run = async (client, message, args) => {
  let user = message.author;
  let banco_nome = args[0];
  let conta_nome = args[1];
  if(!banco_nome) {
    message.channel.send(`<a:nao:868232161289986128>**|**${user}, Insira um nome válido de um banco para abrir sua conta!\nBancos Disponiveis:\n\`\`\`${bancoDisponivel}\`\`\``);
    return;
  }
  if(!bancoDisponivel.includes(banco_nome)) {
    message.channel.send(`<a:nao:868232161289986128>**|** Banco Inválido!\nLista de Bancos Disponíveis:\n\`\`\`${bancoDisponivel}\`\`\` `)
    return;
  }

  if(!args[1]) {
    message.channel.send(`<a:nao:868232161289986128>**|**${user}, Insira um nome para sua conta!`);
    return;
  }
    
      let bancoID = gerarBANCOUnico();
      
      

function gerarBANCOUnico() {
  let bancoID = '';
  
  // Gera os primeiros nove dígitos aleatórios
  for (let i = 0; i < 9; i++) {
    bancoID += Math.floor(Math.random() * 10);
  }
  
  // Gera o primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 4; i++) {
    sum += parseInt(bancoID[i]) * (5 - i);
  }
  let digit1 = 6 - (sum % 6);
  if (digit1 === 5 || digit1 === 6) {
    digit1 = 0;
  }
  bancoID += digit1;
  
  // Gera o segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 5; i++) {
    sum += parseInt(bancoID[i]) * (6 - i);
  }
  let digit2 = 6 - (sum % 6);
  if (digit2 === 5 || digit2 === 6) {
    digit2 = 0;
  }
  bancoID += digit2;
  
  return bancoID;
}

    if(args[0] === 'OneBank') {
     let banco_existente = db.fetch(`banco_${message.guild.id}_${user.id}.certificado`)
      if(banco_existente === true) {
        message.channel.send(`<a:nao:868232161289986128>**|**${user}, Você já tem um banco registrado atualmente!`)
        return;
      }

      db.set(`banco_${message.guild.id}_${user.id}`, {
        nomeb: banco_nome,
        conta: conta_nome,
        bancoId: bancoID,
        agencia: 100,
        saldo: 0,
        certificado: true
      });


      let agencia = db.fetch(`banco_${message.guild.id}_${user.id}.agencia`);
      let saldo_inicial = db.fetch(`banco_${message.guild.id}_${user.id}.saldo`);
      
      const OneBank_criado = new Discord.EmbedBuilder()
      .setTitle(`CONTA BANCARIA`)
      .setColor('#2ecc71')
      .setDescription(`<a:sim:868232093556166756>**|**${user}, Você criou uma conta no banco! Abaixo terá algunas informações:`)
      .addFields({ name: 'Nome do Banco:', value: `\`${banco_nome}\``, inline: true })
      .addFields({ name: 'Nome da Conta:', value: `\`${conta_nome}\``, inline: true })
      .addFields({ name: 'ID Do Banco:', value: `\`${bancoID}\``, inline: true })
      .addFields({ name: 'Agencia:', value: `\`${agencia}\``, inline: true })
      .addFields({ name: 'Saldo:', value: `\`${saldo_inicial}\``, inline: true })
      .setFooter({ text: `© Sistema Bancário || OneBot Com todos os seus direitos reservados!` })
      .setTimestamp();

      message.channel.send({ embeds: [OneBank_criado] });
    }

    if(args[0] === 'TrustFinance') {
     let banco_existente = db.fetch(`banco_${message.guild.id}_${user.id}.certificado`)
      if(banco_existente === true) {
        message.channel.send(`<a:nao:868232161289986128>**|**${user}, Você já tem um banco registrado atualmente!`)
        return;
      }

      db.set(`banco_${message.guild.id}_${user.id}`, {
        nomeb: banco_nome,
        conta: conta_nome,
        bancoId: bancoID,
        agencia: 100,
        saldo: 0,
        certificado: true
      });


      let agencia = db.fetch(`banco_${message.guild.id}_${user.id}.agencia`);
      let saldo_inicial = db.fetch(`banco_${message.guild.id}_${user.id}.saldo`);
      
      const TrustFinance_criado = new Discord.EmbedBuilder()
      .setTitle(`CONTA BANCARIA`)
      .setColor('#2ecc71')
      .setDescription(`<a:sim:868232093556166756>**|**${user}, Você criou uma conta no banco! Abaixo terá algunas informações:`)
      .addFields({ name: 'Nome do Banco:', value: `\`${banco_nome}\``, inline: true })
      .addFields({ name: 'Nome da Conta:', value: `\`${conta_nome}\``, inline: true })
      .addFields({ name: 'ID Do Banco:', value: `\`${bancoID}\``, inline: true })
      .addFields({ name: 'Agencia:', value: `\`${agencia}\``, inline: true })
      .addFields({ name: 'Saldo:', value: `\`${saldo_inicial}\``, inline: true })
      .setFooter({ text: `© Sistema Bancário || OneBot Com todos os seus direitos reservados!` })
      .setTimestamp();

      message.channel.send({ embeds: [TrustFinance_criado] });
    }
    if(args[0] === 'SecureBank') {
     let banco_existente = db.fetch(`banco_${message.guild.id}_${user.id}.certificado`)
      if(banco_existente === true) {
        message.channel.send(`<a:nao:868232161289986128>**|**${user}, Você já tem um banco registrado atualmente!`)
        return;
      }

      db.set(`banco_${message.guild.id}_${user.id}`, {
        nomeb: banco_nome,
        conta: conta_nome,
        bancoId: bancoID,
        agencia: 100,
        saldo: 0,
        certificado: true
      });


      let agencia = db.fetch(`banco_${message.guild.id}_${user.id}.agencia`);
      let saldo_inicial = db.fetch(`banco_${message.guild.id}_${user.id}.saldo`);
      
      const SecureBank_criado = new Discord.EmbedBuilder()
      .setTitle(`CONTA BANCARIA`)
      .setColor('#2ecc71')
      .setDescription(`<a:sim:868232093556166756>**|**${user}, Você criou uma conta no banco! Abaixo terá algunas informações:`)
      .addFields({ name: 'Nome do Banco:', value: `\`${banco_nome}\``, inline: true })
      .addFields({ name: 'Nome da Conta:', value: `\`${conta_nome}\``, inline: true })
      .addFields({ name: 'ID Do Banco:', value: `\`${bancoID}\``, inline: true })
      .addFields({ name: 'Agencia:', value: `\`${agencia}\``, inline: true })
      .addFields({ name: 'Saldo:', value: `\`${saldo_inicial}\``, inline: true })
      .setFooter({ text: `© Sistema Bancário || OneBot Com todos os seus direitos reservados!` })
      .setTimestamp();

      message.channel.send({ embeds: [SecureBank_criado] });
    }

}