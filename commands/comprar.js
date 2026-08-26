const Discord = require("discord.js");
const db = require('../systems/firestore');

const itensDisponiveis = ["M4A1", "Computador", "Vip_1", "Vip_2", "Vip_3", "AK-47", "Escudo", "7.62mm", "5.56mm"];
const precos = {
  "Vip_1": 10000,
  "Vip_2": 15830,
  "Vip_3": 20000,
  "M4A1": 50000,
  "AK-47": 56700,
  "Computador": 15000,
  "Escudo": 45000,
  "7.62mm": 30000,
  "5.56mm": 28500
};
const manutencao = {
  "AK-47": true,
  "M4A1": false,
  "Computador": true,
  "Vip_1": true,
  "Vip_2": true,
  "Vip_3": true,
  "Escudo": true,
  "7.62mm": true,
  "5.56mm": false
}
exports.run = async (client, message, args) => {
  let user = message.author;
  let item = args[0];

  if (!item) {
    message.channel.send(`:x:**|** ${user}, você precisa especificar o item que deseja comprar! Verifique os itens disponíveis em: \`\`\`B!loja\`\`\``);
    return;
  }

  if (!itensDisponiveis.includes(item)) {
    message.channel.send(`:x:**|** ${user}, item não encontrado.`);
    return;
  }

  function verificarManutencao(item, user, message) {
    if(manutencao[item]) {
        const erro = new Discord.EmbedBuilder()
      .setTitle(`<a:nao:868232161289986128> **|** ERRO DETECTADO`)
        .setColor('#e74c3c')
        .setDescription(`${user} O Item **${item}** está em manutenção! Por favor, tente novamente mais tarde.`)
      message.channel.send({ embeds: [erro] });
      return true;
    }
    return false;
  }
  
  let preco = precos[item];
  let saldo = db.get(`money_${message.guild.id}_${user.id}`) || 0;

  if (saldo < preco) {
    message.channel.send(`:x:**|** ${user}, você não tem dinheiro suficiente para comprar o item **${item}**!`);
    return;
  }
 
  if(item === "AK-47") {
    if(verificarManutencao(item, user, message)) return;
     
     const embed = new Discord.EmbedBuilder()
    .setTitle(`<a:verificado_icon1:1245042804133072976> COMPRA REALIZADA`)
    .setColor('#2ecc71')
    .setDescription(`${user} Você comprou uma **AK-47** por **${preco} OneCoins**!`)
    .setFooter({ text: `© OneBot 2024 - Todos os Direitos Reservados` })
    .setTimestamp();

    message.channel.send({ embeds: [embed] });
    db.push(`inventory_${message.guild.id}_${user.id}`, { item: "AK-47", tipo: "arma" });
    db.subtract(`money_${message.guild.id}_${user.id}`, preco);
    
  }
  if (item === "M4A1") {
    // Lógica específica para a compra de M4A1
    if(verificarManutencao(item, user, message)) return;
    db.subtract(`money_${message.guild.id}_${user.id}`, preco);
      
     db.push(`inventory_${message.guild.id}_${user.id}`, { item: "M4A1", tipo: "arma" });
    const embed1 = new Discord.EmbedBuilder()
      .setTitle(`<a:verificado_icon1:1245042804133072976>**|** COMPRRA REALIZADA!`)
      .setColor('#2ecc71')
      .setDescription(`<a:verificado_icon1:1245042804133072976>**|** ${user}, você comprou uma **M4A1** por **${preco}** coins!`)
    message.channel.send({ embeds: [embed1] });
  } else if (item === "Computador") {
    
 if(verificarManutencao(item, user, message)) return;
     
    let nivel = args[1];
    if(!nivel) {
      message.channel.send(`<a:nao:868232161289986128>**|** ${user}, Você precisa especificar o nível do computador que deseja comprar! Ex: **B!comprar Computador 1**`);
      return;
    }
    if(nivel === "1") {
    // Lógica específica para a compra de Computador
   db.push(`inventory_${message.guild.id}_${user.id}`, { name: "Computador", nivel: 2, tipo: "eletronico" });

      const computador1 = new Discord.EmbedBuilder()
      .setTitle(`<a:verificado_icon1:1245042804133072976> COMPRA REALIZADA!`)
      .setColor('#2ecc71')
      .setDescription(`${user} Você comprou ${item} por ${preco}`)
      message.channel.send({ embeds: [computador1] });
      
  }
    if(nivel === "2") {
      db.push(`inventory_${message.guild.id}_${user.id}`, { name: "Computador", nivel: 2, tipo: "eletronico" });
db.subtract(`money_${message.guild.id}_${user.id}`, preco);
      const computador2 = new Discord.EmbedBuilder()
      .setTitle(`<a:verificado_icon1:1245042804133072976> COMPRA REALIZADA!`)
      .setColor('#2ecc71')
      .setDescription(`${user} Você comprou ${item} por ${preco}`)
      message.channel.send({ embeds: [computador2] });
      
    }
  } else if (item.startsWith("Vip")) {
    // Lógica específica para a compra de VIP
  if(verificarManutencao(item, user, message)) return;
       db.set(`vip_${message.guild.id}_${user.id}`, item);
    db.subtract(`money_${message.guild.id}_${user.id}`, preco);
    const embed3 = new Discord.EmbedBuilder()
    .setTitle(`<a:verificado_icon1:1245042804133072976> COMPRA REALIZADA!`)
    .setColor('#2ecc71')
    .setDescription(`${user} Você comprou ${item} por ${preço}`)
    message.channel.send({ embeds: [embed3] });
    return;
  } else if(item === "Escudo") {
    if(verificarManutencao(item, user, message)) return;
    
   
    let escudoOn = await db.fetch(`escudo_${message.guild.id}_${user.id}`);
    if(escudoOn) {
      const escudoAtivo = new Discord.EmbedBuilder()
      .setTitle(`<a:nao:868232161289986128>**|** ERRO DETECTADO`)
  .setColor('#e74c3c')
   .setDescription(`${user} Você já tem um escudo ativo!`)
      message.channel.send({ embeds: [escudoAtivo] });
      return;
    }
      
    let nivel = args[1];
    if(!nivel) {
      message.channel.send(`<a:nao:868232161289986128>**|** ${user}, Você precisa especificar o nível do escudo que deseja comprar! Ex: **B!comprar Escudo 1**`);
      return;
    }
   
    db.push(`inventory_${message.guild.id}_${user.id}`, { name: "Escudo", nivel: 1, tipo: "defesa" });
    db.subtract(`money_${message.guild.id}_${user.id}`, preco);
    db.set(`escudo_${message.guild.id}_${user.id}`, true);
    const escudo1 = new Discord.EmbedBuilder()
    .setTitle(`<a:verificado_icon1:1245042804133072976> COMPRA REALIZADA`)
    .setColor('#2ecc71')
    .setDescription(`${user} Você comprou um **Escudo Nível 1** para se defender de assaltos por ${preco}\nVocê tem 24 horas de proteção!`)
    message.channel.send({ embeds: [escudo1] })
    setTimeout(() => {
      let inventory = db.get(`inventory_${message.guild.id}_${user.id}`) || [];

      inventory = inventory.filter(item => item.name !== "Escudo") 
      db.set(`inventory_${message.guild.id}_${user.id}`, inventory);
      db.delete(`escudo_${message.guild.id}_${user.id}`);
      
     message.channel.send(`${user} Seu **Escudo** expirou e foi removido!`);
    }, 24 * 60 * 60 * 1000);
    if(nivel === "2") {
    
    db.push(`inventory_${message.guild.id}_${user.id}`, { name: "Escudo", nivel: 2, tipo: "defesa" });
    db.set(`escudo_${message.guild.id}_${user.id}`, true);
      db.subtract(`money_${message.guild.id}_${user.id}`, preco);
    const escudo2 = new Discord.EmbedBuilder()
    .setTitle(`<a:verificado_icon1:1245042804133072976> COMPRA REALIZADA`)
    .setColor('#2ecc71')
    .setDescription(`${user} Você comprou um **Escudo Nível 2** para se defender de assaltos por ${preco}\nVocê tem 48 horas de proteção!`)
    message.channel.send({ embeds: [escudo2] })

    setTimeout(() => {
      let inventory = db.get(`inventory_${message.guild.id}_${user.id}`) || [];

      inventory = inventory.filter(item => item.name !== "Escudo");
      db.delete(`escudo_${message.guild.id}_${user.id}`);
     message.channel.send(`${user} Seu **Escudo** expirou e foi removido!`)
    }, 48 * 60 * 60 * 1000);
  }

  // Deduz o valor do saldo do usuário
db.subtract(`money_${message.guild.id}_${user.id}`, preco);
} else if (item === "7.62mm") {
    if(verificarManutencao(item, user, message)) return;
    const precoBalasAK = 30.000 //Preço inicial das bala de AK-47
    const quantidadeBalas = args[1]; //Quantidade de balas que o usuário deseja comprar
    const precoTotal = precoBalasAK * quantidadeBalas; // o preço total das balas de acordo com a quantidade desejada
    if (quantidadeBalas < 30) {
      const balaMinima = new Discord.EmbedBuilder()
      .setTitle(`<a:nao:868232161289986128> **|** ERRO DETECTAADO`)
      .setColor('#e74c3c')
      .setDescription(`${user} Você precisa comprar 30 ou mais balas de AK-47. O Mínimo é 30 balas!`)

      message.channel.send(balaMininma);
      return;
    }
    if (!quantidadeBalas) {
       quantidadeBalas = 30;
    }
    const embed = new Discord.EmbedBuilder()
    .setTitle(`<a:verificado_icon1:1245042804133072976> COMPRA REALIZADA`)
    .setColor('#2ecc71')
    .setDescription(`${user} Você comprou ${quantidadeBalas} balas de AK-47 **(7.62mm)** por ${precoTotal} OneCoins!`)

db.subtract(`money_${message.guild.id}_${user.id}`, precoTotal);
  db.add(`municaoAK_${message.guild.id}_${user.id}`, quantidadeBalas);
  
    message.channel.send({ embeds: [embed] });
  
}  else if (item === "5.56mm") {
    if(verificarManutencao(item, user, message)) return;
    const precoBalasM4 = 28500 //Preço inicial das bala de M4A1
    let quantidadeBalas = args[1]; //Quantidade de balas que o Usuário deseja comprar
    let precoTotal = precoBalasM4 * quantidadeBalas; //o preço total das balas de acordo com a quantidade desejada
    if (!quantidadeBalas || quantidadeBalas < 30) {
      const balaMinima = new Discord.EmbedBuilder()
      .setTitle(`<a:nao:868232161289986128> **|** ERRO DETECTADO`)
      .setColor('#e74c3c')
      .setDescription(`${user} Você precisa comprar 30 ou mais balas de M4A1. O Mínimo é 30 balas!`)

      message.channel.send({ embeds: [balaMinima] });
      return;
    }
    if (!quantidadeBalas) {
       quantidadeBalas = 30;
    }
    if(quantidadeBalas = 30) {
     precoTotal = 28500
    }
    const embed = new Discord.EmbedBuilder()
    .setTitle(`<a:verificado_icon1:1245042804133072976> COMPRA REALIZADA`)
    .setColor('#2ecc71')
    .setDescription(`${user} Você comprou ${quantidadeBalas} balas de M4A1 **(5.56mm)** por ${precoTotal} OneCoins!`)

db.subtract(`money_${message.guild.id}_${user.id}`, precoTotal);
  db.add(`municaoM4_${message.guild.id}_${user.id}`, quantidadeBalas);
  
    message.channel.send({ embeds: [embed] });
}
}