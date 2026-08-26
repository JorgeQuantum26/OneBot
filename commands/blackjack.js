const Discord = require('discord.js');
const db = require('../systems/firestore');

exports.run = async (client, message, args) => {
  const cartas = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const naipes = ['♠️', '♣️', '♥️', '♦️'];

  let user = message.author;

  let aposta = args[0];
  if (!aposta) {
    message.channel.send(`:x: **|** Insira um valor para apostar!`);
    return;
  }
  if(aposta.toLowerCase().includes('k')) {
    aposta = parseFloat(aposta.toLowerCase().replace('k', '') * 1000);
    
  } else if (aposta.toLowerCase().includes('m')) {
    aposta = parseFloat(aposta.toLowerCase().replace('m', '') * 1000000);
    
  } else if (aposta.toLowerCase().includes('b')) {
    aposta = parseFloat(aposta.toLowerCase().replace('b', '') * 1000000000);
    
  }  else if(aposta.toLowerCase().includes('t')) {
    aposta = parseFloat(aposta.toLowerCase().replace('t', '') * 1000000000000);
    
  } else if(aposta.toLowerCase().includes('qd')) {
            aposta = parseFloat(aposta.toLowerCase().replace('qd', '') * 1000000000000000);
   } else if(aposta.toLowerCase().includes('qi')) {
           aposta = parseFloat(aposta.toLowerCase().replace('qi', '') * 1000000000000000000);
   } else {
    aposta = parseInt(aposta, 10);
    
  }



  let money = await db.fetch(`moneyCass_${message.guild.id}_${user.id}`);
  if (money === null) money = 0;
  if (money < aposta) {
    message.channel.send(`:x: **|** Você não tem dinheiro suficiente para apostar esse valor!\n\`${money.toLocaleString()}/${aposta.toLocaleString()}\``);
    return;
  }

  let cassmoney = await db.fetch(`cassMoney`) || 0;
  if (cassmoney < aposta) {
    message.channel.send(`:x:**|** Ocorreu um erro ao tentar apostar, o saldo do Cassino é de \`\`\`${aposta.toLocaleString()}/${cassmoney.toLocaleString()}\`\`\``);
    return;
  }
  if (isNaN(aposta)) {
    message.channel.send(`:x: **|** Use apenas números válidos`);
    return;
  }

  // Deduzir o dinheiro do jogador imediatamente ao iniciar o jogo
  await db.subtract(`moneyCass_${message.guild.id}_${user.id}`, aposta);
  await db.add(`cassMoney`, aposta);
  
  iniciarBlackjack(message);

  function iniciarBlackjack(message) {
    const jogador = {
      cartas: [],
      pontos: 0
    };
    const bot = {
      cartas: [],
      pontos: 0
    };

    // Distribuir duas cartas para o jogador e o bot
    distribuirCarta(jogador);
    distribuirCarta(jogador);
    distribuirCarta(bot);
    distribuirCarta(bot);

    const embed = new Discord.EmbedBuilder()
      .setTitle('🎲 Blackjack 🎲')
      .setDescription(`**${user.username}**, você apostou **${aposta.toLocaleString()}** coins.\n\n**Suas cartas:** ${jogador.cartas.join(', ')} (**${jogador.pontos} pontos**)\n**Cartas do Bot:** ${bot.cartas[0]} e uma carta virada para baixo.`)
      .setColor('#00ff00')
      .setFooter({ text: 'Reaja com ✅ para pedir mais uma carta ou ❌ para parar.' });

    message.channel.send({ embeds: [embed] }).then(msg => {
      msg.react('✅').then(() => msg.react('❌'));

      const filter = (reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
      const collector = msg.createReactionCollector(filter, { time: 60000 });

      collector.on('collect', reaction => {
        if (reaction.emoji.name === '✅') {
          // O jogador pediu mais uma carta
          distribuirCarta(jogador);
          const jogadorEmbed = new Discord.EmbedBuilder()
            .setTitle('🎲 Blackjack 🎲')
            .setDescription(`**Suas cartas:** ${jogador.cartas.join(', ')} (**${jogador.pontos} pontos**)\n**Cartas do Bot:** ${bot.cartas[0]} e uma carta virada para baixo.`)
            .setColor('#00ff00')
            .setFooter({ text: 'Reaja com ✅ para pedir mais uma carta ou ❌ para parar.' });
          msg.edit({ embeds: [jogadorEmbed] });

          // Verifica se o jogador estourou
          if (jogador.pontos > 21) {
            collector.stop();
            finalizarJogo(message, 'Bot', jogador, bot);
          }
        } else if (reaction.emoji.name === '❌') {
          // O jogador parou de pedir cartas
          collector.stop();
          // Bot joga
          while (bot.pontos < 17) {
            distribuirCarta(bot);
          }
          const resultado = verificarVencedor(jogador, bot);
          finalizarJogo(message, resultado, jogador, bot);
        }
      });

      collector.on('end', collected => {
        if (collected.size === 0) {
          const resultado = verificarVencedor(jogador, bot);
          finalizarJogo(message, resultado, jogador, bot);
        }
      });
    });
  }

  function distribuirCarta(jogador) {
    const carta = getCartaAleatoria();
    jogador.cartas.push(carta.valor + carta.naipe);
    jogador.pontos += carta.pontos;
    // Verifica se há um Ás e ajusta os pontos se necessário
    if (carta.valor === 'A' && jogador.pontos > 21) {
      jogador.pontos -= 10; // Reduz 10 pontos para o Ás
    }
  }

  function getCartaAleatoria() {
    const valor = cartas[Math.floor(Math.random() * cartas.length)];
    const naipe = naipes[Math.floor(Math.random() * naipes.length)];
    let pontos = parseInt(valor);
    if (isNaN(pontos)) {
      pontos = valor === 'A' ? 11 : 10; // Ás vale 11 ou 1 ponto
    }
    return { valor, naipe, pontos };
  }

  function verificarVencedor(jogador, bot) {
    const jogadorPontos = jogador.pontos > 21 ? 0 : jogador.pontos;
    const botPontos = bot.pontos > 21 ? 0 : bot.pontos;

    if (jogadorPontos > botPontos) {
      db.add(`moneyCass_${message.guild.id}_${user.id}`, aposta * 2);
      db.subtract(`cassMoney`, aposta * 2);
      db.add(`cassCoinsP`, aposta * 2);
      db.add(`vitoria1`, 1);
      
      return 'Jogador';
    } else if (botPontos > jogadorPontos) {
      db.add(`derrota1`, 1);
      return 'Bot';
      
    } else {
      // Em caso de empate, devolver o dinheiro ao jogador
      db.add(`moneyCass_${message.guild.id}_${user.id}`, aposta);
      db.subtract(`cassMoney`, aposta);
      db.add(`cassCoinsP`, aposta);
      return 'Empate';
    }
  }

  function finalizarJogo(message, resultado, jogador, bot) {

    let aposta2 = aposta * 2;
    
    const resultadoEmbed = new Discord.EmbedBuilder()
      .setTitle('🏆 Resultado do Blackjack 🏆')
      .setDescription(`${user.username} **Suas cartas:** ${jogador.cartas.join(', ')} (**${jogador.pontos} pontos**)\n**Cartas do Bot:** ${bot.cartas.join(', ')} (**${bot.pontos} pontos**)\n\n**Resultado:** ${resultado === 'Empate' ? 'Empate' : resultado === 'Jogador' ? `Você venceu! (Recebeu ${aposta2.toLocaleString()})` : `Você perdeu! (Perdeu ${aposta.toLocaleString()})`}`)
      .setColor(resultado === 'Jogador' ? '#00ff00' : '#ff0000');
     db.add(`jogos_${user.id}`, 1);
    db.add(`apostas_${user.id}`, aposta);
    message.channel.send({ embeds: [resultadoEmbed] });
  }
};
