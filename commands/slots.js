const Discord = require("discord.js");
const db = require('../systems/firestore');

exports.run = async (client, message, args) => {
  let user = message.author;

  let aposta = args[0];
  if (!aposta) {
    message.channel.send(`:x:**|**${user}, Por favor, insira uma quantidade para apostar.`);
    return;
  }
  if (isNaN(aposta)) {
    message.channel.send(`:x:**|**${user}, Por favor, utilize números válidos.`);
    return;
  }

  // Definir os multiplicadores e suas probabilidades
  const multiplicadores = [
    { multiplicador: 2, chance: 0.5 },
    { multiplicador: 5, chance: 0.3 },
    { multiplicador: 10, chance: 0.15 },
    { multiplicador: 50, chance: 0.05 }
  ];

  // Gerar um número aleatório e determinar o multiplicador
  const random = Math.random();
  let acumulador = 0;
  let multiplicadorEscolhido = 1;

  for (const item of multiplicadores) {
    acumulador += item.chance;
    if (random < acumulador) {
      multiplicadorEscolhido = item.multiplicador;
      break;
    }
  }

  let valorRecompensa = aposta * multiplicadorEscolhido;

  let saldo = db.get(`moneyCass_${message.guild.id}_${user.id}`);
  if (aposta > saldo) {
    message.channel.send(`:x: | ${user}, o seu saldo é insuficiente para realizar essa aposta!`);
    return;
  }
  if (aposta < 5) {
    message.channel.send(`:x: | ${user}, você deve apostar um valor maior que 5!`);
    return;
  }

  const saldoCassino = db.get(`cassMoney`);
  if (saldoCassino < aposta) {
    message.channel.send(`:x: **|** ${user}, o cassino não possui saldo suficiente para prosseguir sua aposta.\n\n**Nenhum dinheiro foi perdido**.`);
    // Vamos inserir um código temporário para adicionar um saldo para o cassino.
    db.add(`cassMoney`, 200000);
    return;
  }

  // Definir os multiplicadores e suas probabilidades
  const multiplicadores2 = [
    { multiplicador: 3, chance: 0.5 },
    { multiplicador: 8, chance: 0.3 },
    { multiplicador: 15, chance: 0.15 },
    { multiplicador: 35, chance: 0.05 }
  ];

  // Gerar um número aleatório e determinar o multiplicador
  const aleatorio = Math.random();
  let acumulador2 = 0;
  let multiplicadorEscolhido2 = 1;

  for (const item of multiplicadores2) {
    acumulador2 += item.chance;
    if (aleatorio < acumulador2) {
      multiplicadorEscolhido2 = item.multiplicador;
      break;
    }
  }

  let valorRecompensa2 = aposta * multiplicadorEscolhido2;
  const simbolos = ['🍒', '🍋', '🍊', '🍉', '🍇', '🍓', '🍌', '<:777:1246663648076763167>', '<:wild:1246664196582670398>'];

  const rolo1 = simbolos[Math.floor(Math.random() * simbolos.length)];
  const rolo2 = simbolos[Math.floor(Math.random() * simbolos.length)];
  const rolo3 = simbolos[Math.floor(Math.random() * simbolos.length)];
  const rolo4 = simbolos[Math.floor(Math.random() * simbolos.length)];
  const rolo5 = simbolos[Math.floor(Math.random() * simbolos.length)];
  const rolo6 = simbolos[Math.floor(Math.random() * simbolos.length)];
  const rolo7 = simbolos[Math.floor(Math.random() * simbolos.length)];
  const rolo8 = simbolos[Math.floor(Math.random() * simbolos.length)];
  const rolo9 = simbolos[Math.floor(Math.random() * simbolos.length)];

  const embed1 = new Discord.EmbedBuilder()
    .setTitle(`🎰 | Cassino - Slots`)
    .setColor("Orange")
    .setDescription(`Girando...`);
  let msg = await message.channel.send({ embeds: [embed1] });
  db.subtract(`moneyCass_${message.guild.id}_${user.id}`, aposta);
  db.add(`cassMoney`, aposta);
   db.add(`jogos_${user.id}`, 1);
  db.add(`apostas_${user.id}`, aposta)
  setTimeout(() => {
    if ((rolo1 === rolo2 && rolo1 === rolo3) || (rolo4 === rolo5 && rolo4 === rolo6) || (rolo7 === rolo8 && rolo7 === rolo9) || (rolo3 === rolo5 && rolo3 === rolo7) || (rolo1 === rolo5 && rolo1 === rolo9)) {
      db.add(`moneyCass_${message.guild.id}_${user.id}`, valorRecompensa);
      db.subtract(`cassMoney`, valorRecompensa);
      db.add(`cassCoinsP`, valorRecompensa);
      db.add(`vitoria1`, 1);

     
      let valorAtual = 0;
      const incremento = Math.ceil(valorRecompensa * 0.2);
      const atualizaValor = () => {
        valorAtual += incremento;
        if (valorAtual >= valorRecompensa) {
          valorAtual = valorRecompensa;

          embed1.setDescription(`Você ganhou R$${valorRecompensa} (Multiplicador: ${multiplicadorEscolhido}), a roleta caiu assim:\n\n${rolo1} | ${rolo2} | ${rolo3}\n${rolo4} | ${rolo5} | ${rolo6}\n${rolo7} | ${rolo8} | ${rolo9}`);
          embed1.setFooter({ text: `© R$${saldo} | R$${aposta} | Ganhos: R$${valorRecompensa}` });
          msg.edit({ embeds: [embed1] });
        } else {
          embed1.setDescription(`Você ganhou R$${valorAtual}, a roleta está girando...`);
          msg.edit({ embeds: [embed1] });
          setTimeout(atualizaValor, 1000); // Atualiza a cada 1000ms
        }
      };
      atualizaValor()
    } else {
      db.add(`cassMoney`, aposta);
      db.add(`cassCoins`, aposta);
      db.add(`derrota1`, 1);
      embed1.setDescription(`Você perdeu R$${aposta}, a roleta caiu assim:\n\n${rolo1} | ${rolo2} | ${rolo3}\n${rolo4} | ${rolo5} | ${rolo6}\n${rolo7} | ${rolo8} | ${rolo9}`);
      embed1.setFooter({ text: `© R$${saldo} | R$${aposta} | Perdas: R$${aposta}` });
      msg.edit({ embeds: [embed1] });
    }

    if((rolo1 === '<:777:1246663648076763167>' && rolo2 === '<:777:1246663648076763167>' && rolo3 === '<:777:1246663648076763167>') || (rolo4 === '<:777:1246663648076763167>' && rolo5 === '<:777:1246663648076763167>' && rolo6 === '<:777:1246663648076763167>') || (rolo7 === '<:777:1246663648076763167>' && rolo8 === '<:777:1246663648076763167>' && rolo9 === '<:777:1246663648076763167>') || (rolo1 === '<:777:1246663648076763167>' && rolo5 === '<:777:1246663648076763167>' && rolo9 === '<:777:1246663648076763167>') || (rolo3 === '<:777:1246663648076763167>' && rolo5 === '<:777:1246663648076763167>' && rolo7 === '<:777:1246663648076763167>')   
) {
      
      db.add(`moneyCass_${message.guild.id}_${user.id}`, valorRecompensa2);
      db.subtract(`cassMoney`, valorRecompensa2);
      db.add(`cassCoinsP`, valorRecompensa2);
      db.add(`vitoria1`, 1);
      embed1.setDescription(`PARABÉNS! Você ganhou R$${valorRecompensa2} (Multiplicador: ${multiplicadorEscolhido2}), a roleta caiu assim:\n\n${rolo1} | ${rolo2} | ${rolo3}\n${rolo4} | ${rolo5} | ${rolo6}\n${rolo7} | ${rolo8} | ${rolo9}`);
      embed1.setFooter({ text: `© R$${saldo} | R$${aposta} | Ganhos: R$${valorRecompensa2}` });
      msg.edit({ embeds: [embed1] });
    }


    if((rolo1 === '<:wild:1246664196582670398>' && rolo2 === '<:wild:1246664196582670398>' && rolo3 === '<:wild:1246664196582670398>') || (rolo4 === '<:wild:1246664196582670398>' && rolo5 === '<:wild:1246664196582670398>' && rolo6 === '<:wild:1246664196582670398>') || (rolo7 === '<:wild:1246664196582670398>' && rolo8 === '<:wild:1246664196582670398>' && rolo9 === '<:wild:1246664196582670398>') || (rolo1 === '<:wild:1246664196582670398>' && rolo5 === '<:wild:1246664196582670398>' && rolo9 === '<:wild:1246664196582670398>') || (rolo3 === '<:wild:1246664196582670398>' && rolo5 === '<:wild:1246664196582670398>' && rolo7 === '<:wild:1246664196582670398>')   
) {
      db.add(`moneyCass_${message.guild.id}_${user.id}`, valorRecompensa2);
      db.subtract(`cassMoney`, valorRecompensa2);
      db.add(`cassCoinsP`, valorRecompensa2);
      db.add(`vitoria1`, 1);
      embed1.setDescription(`PARABÉNS! Você ganhou R$${valorRecompensa2} (Multiplicador: ${multiplicadorEscolhido2}), a roleta caiu assim:\n\n${rolo1} | ${rolo2} | ${rolo3}\n${rolo4} | ${rolo5} | ${rolo6}\n${rolo7} | ${rolo8} | ${rolo9}`);
      embed1.setFooter({ text: `© R$${saldo} | R$${aposta} | Ganhos: R$${valorRecompensa2}` });
      msg.edit({ embeds: [embed1] });
    }
  }, 3000);
};
