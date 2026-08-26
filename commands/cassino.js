const Discord = require("discord.js");
const db = require('../systems/firestore');
const ms = require("ms");

// Função para calcular a porcentagem de vitória do Blackjack
function calcularPorcentagemVitoriaBlackjack() {
  const cartasPossiveis = 52; // 52 cartas em um baralho
  const cartasBoas = 16; // Cartas boas (10, J, Q, K) no Blackjack
  const porcentagemVitoria = (cartasBoas / cartasPossiveis) * 100;
  return porcentagemVitoria.toFixed(2); // Retornar a porcentagem com duas casas decimais
}

// Função para calcular a porcentagem de vitória do Treasure Bowl
function calcularPorcentagemVitoriaTreasureBowl() {
  const totalSlots = 5; // Número total de slots possíveis
  const numSlots = 3; // Número de slots na roleta
  const numCombinacoes = Math.pow(totalSlots, numSlots);

  const combinacoesVencedoras = [
    ['<:treasurewild:1254206247201280001>', '<:treasurewild:1254206247201280001>', '<:treasurewild:1254206247201280001>'],
['<:treasurewild1:1254220057496780871>', '<:treasurewild1:1254220057496780871>', '<:treasurewild1:1254220057496780871>'],
     ['🍀', '🍀', '🍀'],
  ['<:treasurewild1:1254220057496780871>', '🍀', '🍀'],
        ['<:treasurewild1:1254220057496780871>', '🍋', '🍋'],
 ['<:treasurewild1:1254220057496780871>', '🍒', '🍒'], 
   ['🍀', '<:treasurewild1:1254220057496780871>', '🍀'],
        ['🍋', '🍋', '<:treasurewild1:1254220057496780871>'],
        ['🍒', '🍒', '<:treasurewild1:1254220057496780871>'],
        ['🍒', '🍒', '🍒'],
       ['🍋', '🍋', '🍋']
    ];
    

  const numCombinacoesVencedoras = combinacoesVencedoras.length;
  const porcentagemVitoria = (numCombinacoesVencedoras / numCombinacoes) * 100;
  return porcentagemVitoria.toFixed(2);
}

// Função para calcular a porcentagem de vitória do Fruit Fortune Slots
function calcularPorcentagemVitoriaFruitFortune() {
  const probabilidadeSimboloIgual = 1 / 9;
  const probabilidadeLinhaVencedora = Math.pow(probabilidadeSimboloIgual, 3);
  const probabilidadeLinhaNaoVencedora = 1 - probabilidadeLinhaVencedora;
  const numLinhas = 5;

  const probabilidadeNenhumaVitoria = Math.pow(probabilidadeLinhaNaoVencedora, numLinhas);
  const chanceVitoriaTotal = 1 - probabilidadeNenhumaVitoria;

  return (chanceVitoriaTotal * 100).toFixed(2);
}

// Função para calcular se o usuário pode receber um bônus
async function sorteParaBonus(client, message) {
  let user = message.author;
  let timeout = 86400000; // 24 horas em milissegundos
  let cooldown = await db.get(`cooldownBonus_${user.id}`);

  if (cooldown !== null && timeout - (Date.now() - cooldown) > 0) {
    let time = ms(timeout - (Date.now() - cooldown));
    let aguarde = new Discord.EmbedBuilder()
      .setTitle(`⏳ Espere um pouco!`)
      .setColor('#e74c3c')
      .setDescription(`**Você precisa esperar ${time} para resgatar um bônus!**`);

    return message.channel.send({ embeds: [aguarde] });
  }

  const jogosTotais = (await db.get(`jogos_${user.id}`)) || 0;
  const apostas = (await db.get(`apostas_${user.id}`)) || 0;
  if (jogosTotais === 0) {
    return message.channel.send("Você ainda não jogou nenhum jogo!");
  }
  const porcentagemParaBonus = (apostas / jogosTotais) * 100;

  if (porcentagemParaBonus >= 40) {
    let result = Math.random();
    let vaiGanharBonus = result < 0.5;

    if (vaiGanharBonus) {
      let valorBonus = Math.floor(Math.random() * (apostas / 0.5)) + 1;
      let bonus = new Discord.EmbedBuilder()
        .setTitle(`🎉 Parabéns!`)
        .setColor('#f1c40f')
        .setDescription(`Você ganhou um bônus de **${valorBonus.toLocaleString()} OneCoins**!`)
        .addFields({ name: 'Para sacar, use:', value: '```B!cassino sacarBonus <valor>```', inline: false })
        .setFooter({ text: { text: 'Boa sorte nos seus jogos!', iconURL: user.displayAvatarURL({ dynamic: true }) } });

      await db.set(`cooldownBonus_${user.id}`, Date.now());
      await db.add(`moneyCass_${message.guild.id}_${user.id}`, valorBonus);

      return message.channel.send({ embeds: [bonus] });
    } else {
      let semBonus = new Discord.EmbedBuilder()
        .setTitle(`😢 Infelizmente`)
        .setColor("GRAY")
        .setDescription("Você não ganhou o bônus desta vez. Tente novamente mais tarde!")
        .setFooter({ text: { text: 'Boa sorte na próxima!', iconURL: user.displayAvatarURL({ dynamic: true }) } });

      return message.channel.send({ embeds: [semBonus] });
    }
  } else {
    let naoAtingido = new Discord.EmbedBuilder()
      .setTitle(`🚫 Sem Bônus`)
      .setColor('#e74c3c')
      .setDescription("Você não atingiu a porcentagem necessária para ganhar um bônus. Continue jogando!")
      .setFooter({ text: { text: 'Continue tentando!', iconURL: user.displayAvatarURL({ dynamic: true }) } });

    return message.channel.send({ embeds: [naoAtingido] });
  }
}

exports.run = async (client, message, args) => {
  let pagina = args[0];
  let valor = args[1];
  
  // Calcular a porcentagem de vitória no Blackjack
  const winPercentageBlackjack = calcularPorcentagemVitoriaBlackjack();

  // Calcular a porcentagem de vitória no Treasure Bowl
  const winPercentageTreasureBowl = calcularPorcentagemVitoriaTreasureBowl();

  // Calcular a porcentagem de vitória no Fruit Fortune Slots
  const winPercentageFruitFortune = calcularPorcentagemVitoriaFruitFortune();

  let user = message.author;
  let money = await db.fetch(`money_${message.guild.id}_${user.id}`);
  if (money === null) money = 0;

  if (!pagina) {
    const embed = new Discord.EmbedBuilder()
      .setTitle(`🎰 Jogos de Cassino`)
      .setAuthor(`Use B!cassino menu para ver o Painel do Cassino!`)
      .setColor(Math.floor(Math.random() * 0xffffff))
      .setDescription(`${user}, abaixo você verá os jogos de cassino disponíveis para jogar!`)
      .addFields({ name: 'Fruit Fortune Slots', value: `Experimente a emoção do Fruit Fortune Slots! Gire as roletas e combine frutas suculentas para ganhar grandes prêmios. Com símbolos wilds e a chance de multiplicar suas apostas, cada rodada é uma oportunidade de conquistar fortunas. Jogue agora e descubra a sorte que as frutas reservam para você!\nChances de vitória: ${winPercentageFruitFortune}%`, inline: true })
      .addFields({ name: 'Treasure Bowl', value: `Jogue Treasure Bowl e tente a sorte! Gire as roletas e busque as combinações certas de símbolos para ganhar rodadas grátis e prêmios incríveis. Cada rodada traz uma nova chance de vitória!\nChances de vitória: ${winPercentageTreasureBowl}%`, inline: true })
      .addFields({ name: 'Blackjack', value: `Blackjack: Um jogo de cartas clássico onde os jogadores competem contra o dealer para chegar o mais perto possível de 21 sem ultrapassar.\nChances de vitória: ${winPercentageBlackjack}%`, inline: true })
      .addFields({ name: 'Em breve', value: 'Sem descrição', inline: true });

    return message.channel.send({ embeds: [embed] });
  }

  if (pagina === 'bonus') {
    return sorteParaBonus(client, message);
  }
  if(pagina === 'menu') {
  
    const menu = new Discord.EmbedBuilder()
    .setTitle(`MENU DO CASSINO`)
    .setColor(Math.floor(Math.random() * 0xffffff))
    .setDescription(`Abaixo você verá os menus disponíveis neste Cassino.`)
    .addFields({ name: `<:deposito:1259643545107562659> **Depositar dinheiro para jogar**`, value: `\`\`\`B!cassino depositar <valor/all>\`\`\``, inline: true })
    .addFields({ name: `<:sacar:1259641852475347017> **Sacar seu dinheiro do Cassino**`, value: `\`\`\`B!cassino sacar <valor/all>\`\`\``, inline: true })
    .addFields({ name: `<:bonus:1259644293174268004> **Resgate seu bônus**`, value: `\`\`\`B!cassino bonus\`\`\``, inline: true })
      .addFields({ name: `💵 **Veja seu saldo**`, value: `\`\`\`B!cassino saldo\`\`\``, inline: true })
      .addFields({ name: `👤 **Veja seu perfil**`, value: `\`\`\`B!cassino perfil\`\`\``, inline: true })
    .setFooter({ text: `© Cassino OneBot - 2024` })
    .setTimestamp()

    message.channel.send({ embeds: [menu] });
  }

    if (pagina === "depositar") {
  let banco = db.get(`banco_${message.guild.id}_${user.id}`);
  if (banco === false) {
    const erro = new Discord.EmbedBuilder()
      .setTitle(`<a:nao:868232161289986128> **ERRO DETECTADO**`)
      .setColor('#e74c3c')
      .setDescription(`<a:nao:868232161289986128> | **${user}** Identifiquei que você não possui uma conta bancária registrada! Use **B!criarbanco** para criar uma conta bancária.`);
    message.channel.send({ embeds: [erro] });
    return;
  }

  if (!valor && valor !== "all") {
    message.channel.send(`:x: **|** ${user}, Insira um valor para depositar no Cassino! Ou Utilize **all** para depositar todo o seu dinheiro.`);
    return;
  }

  if (valor === "all") {
    if(money === 0) {
      const erro1 = new Discord.EmbedBuilder()
      .setTitle(`<a:nao:868232161289986128> **ERRO DETECTADO**`)
      .setDescription(`<a:nao:868232161289986128> | **${user.username}** Saldo insuficiente.`)
      message.channel.send({ embeds: [erro1] });
    }
    if(money < 10) {
      const erro2 = new Discord.EmbedBuilder()
      .setTitle(`<a:nao:868232161289986128> **ERRO DETECTADO**`)
      .setColor('#e74c3c')
      .setDescription(`<a:nao:868232161289986128> | **${user.username}** Saldo insuficiente. O Valor mínimo para depósito é **10 OneCoins**`)
      message.channel.send({ embeds: [erro2] });
    }
    const embed1 = new Discord.EmbedBuilder()
      .setDescription(`<a:carregando:1246119195901689888> | **${user.username}** Você está depositando **${money.toLocaleString()} OneCoins** no Cassino! Aguarde enquanto analisamos a transação!`);
    let msg = await message.channel.send({ embeds: [embed1] });

    setTimeout(async () => {
      const embed2 = new Discord.EmbedBuilder()
        .setDescription(`<:ativo:1254523429038850070> **|** ${user} Aprovamos a transação, adicionando OneCoins ao seu saldo no Cassino e registrando a transferência.`);
      await db.add(`moneyCass_${message.guild.id}_${user.id}`, money);
      await db.subtract(`money_${message.guild.id}_${user.id}`, money);
db.push(`banco_${message.guild.id}_${user.id}.transacoes`, `[-] Enviou ${money} OneCoins para o Cassino`);
        console.log(`O Usuário ${user.tag} (${user.username} depositou todo seu dinheiro (${money}) no Cassino.`)
  
      await msg.edit({ embeds: [embed2] });
    }, 3000);

    setTimeout(async () => {
      const embed3 = new Discord.EmbedBuilder()
        .setTitle(`<:deposito:1259643545107562659> **Depósito efetuado com sucesso!**`)
        .setColor(Math.floor(Math.random() * 0xffffff))
        .setDescription(`**${user.username} Você depositou ${money.toLocaleString()} OneCoins no Cassino!**`)
        .setFooter({ text: `© Cassino OneBot - 2024` })
        .setTimestamp();
      await msg.edit({ embeds: [embed3] });
    }, 6000);

  } else {
    if (isNaN(valor)) {
      return message.channel.send(`:x: **|** ${user}, Insira valores válidos!`);
    }
    if (valor > money) {
      message.channel.send(`:x: **|** ${user}, Saldo Insuficiente.`);
      return;
    }
    if (valor <= 0) {
     message.channel.send(`:x: **|** ${user}, Use valores acima de **0 (zero)**`);
      return;
    }
    if (valor < 10) {
      message.channel.send(`:x: **|** ${user}, O Depósito mínimo é **10 OneCoins**!`);
      return;
    }

    const embed4 = new Discord.EmbedBuilder()
      .setDescription(`<a:carregando:1246119195901689888> | **${user.username}** Você está depositando **${valor.toLocaleString()} OneCoins** no Cassino! Aguarde enquanto analisamos a transação!`);

    let msg = await message.channel.send({ embeds: [embed4] });

    setTimeout(async () => {
      const embed5 = new Discord.EmbedBuilder()
        .setDescription(`<:ativo:1254523429038850070> **|** ${user} Aprovamos a transação, adicionando OneCoins ao seu saldo no Cassino e registrando a transferência.`);
      await db.add(`moneyCass_${message.guild.id}_${user.id}`, valor);
      await db.subtract(`money_${message.guild.id}_${user.id}`, valor);
db.push(`transacoes_${message.guild.id}_${user.id}`, `[-] Enviou ${valor} OneCoins para o Cassino`);
         console.log(`O Usuário ${user.tag} (${user.username} depositou  (${valor}) ao seu saldo no Cassino.\nSobrou: ${money.toLocaleString() - valor} OneCoins na carteira de ${user.username}`)
  
      await msg.edit({ embeds: [embed5] });
    }, 3000);

    setTimeout(async () => {
      const embed6 = new Discord.EmbedBuilder()
        .setTitle(`<:deposito:1259643545107562659> **Depósito efetuado com sucesso!**`)
        .setColor(Math.floor(Math.random() * 0xffffff))
        .setDescription(`**${user.username} Você depositou ${valor.toLocaleString()} OneCoins no Cassino!**`)
        .setFooter({ text: `© Cassino OneBot - 2024` })
        .setTimestamp();
      await msg.edit({ embeds: [embed6] });
    }, 6000);
  }
}

  
    if (pagina === "sacar") {
  let banco = db.get(`banco_${message.guild.id}_${user.id}`);
      let moneyCass = db.get(`moneyCass_${message.guild.id}_${user.id}`);
      
  if (banco === false) {
    const erro = new Discord.EmbedBuilder()
      .setTitle(`<a:nao:868232161289986128> **ERRO DETECTADO**`)
      .setColor('#e74c3c')
      .setDescription(`<a:nao:868232161289986128> | **${user}** Identifiquei que você não possui uma conta bancária registrada! Use **B!criarbanco** para criar uma conta bancária.`);
    message.channel.send({ embeds: [erro] });
    return;
  }

  if (!valor && valor !== "all") {
    message.channel.send(`:x: **|** ${user}, Insira um valor para sacar do seu saldo no Cassino! Ou Utilize **all** para sacar todo o seu dinheiro.`);
    return;
  }

  if (valor === "all") {
    if(moneyCass === 0) {
      const erro1 = new Discord.EmbedBuilder()
      .setTitle(`<a:nao:868232161289986128> **ERRO DETECTADO**`)
      .setDescription(`<a:nao:868232161289986128> | **${user.username}** Saldo insuficiente.`);
      message.channel.send({ embeds: [erro1] });
      return;
    }
    if(moneyCass < 10) {
      const erro2 = new Discord.EmbedBuilder()
      .setTitle(`<a:nao:868232161289986128> **ERRO DETECTADO**`)
      .setColor('#e74c3c')
      .setDescription(`<a:nao:868232161289986128> | **${user.username}** Saldo insuficiente. O Valor mínimo para saque é **10 OneCoins**`)
      message.channel.send({ embeds: [erro2] });
      return;
    }
    const embed1 = new Discord.EmbedBuilder()
      .setDescription(`<a:carregando:1246119195901689888> | **${user.username}** Você está sacando **${moneyCass.toLocaleString()} OneCoins** do Cassino! Aguarde enquanto analisamos a transação!`);
    let msg = await message.channel.send({ embeds: [embed1] });

    setTimeout(async () => {
      const embed2 = new Discord.EmbedBuilder()
        .setDescription(`<:ativo:1254523429038850070> **|** ${user} Aprovamos a transação, removendo OneCoins do seu Saldo no Cassino, adicionando OneCoins em sua Carteira e registrando a transferência.`);
      await db.subtract(`moneyCass_${message.guild.id}_${user.id}`, moneyCass);
      await db.add(`money_${message.guild.id}_${user.id}`, moneyCass);
    db.push(`banco_${message.guild.id}_${user.id}.transacoes`, `[+] Sacou ${moneyCass} OneCoins do Cassino`);
        console.log(`O Usuário ${user.tag} (${user.username} sacou todo seu dinheiro (${moneyCass}) do Cassino.`)
  
      await msg.edit({ embeds: [embed2] });
    }, 3000);

    setTimeout(async () => {
      const embed3 = new Discord.EmbedBuilder()
        .setTitle(`<:sacar:1259641852475347017> **Saque efetuado com sucesso!**`)
        .setColor('#2ecc71')
        .setDescription(`**${user.username} Você sacou ${moneyCass} OneCoins no Cassino!**`)
        .setFooter({ text: `© Cassino OneBot - 2024` })
        .setTimestamp();
      await msg.edit({ embeds: [embed3] });
    }, 6000);

  } else {
    if (isNaN(valor)) {
      return message.channel.send(`:x: **|** ${user}, Insira valores válidos!`);
    }
    if (valor > moneyCass) {
      return message.channel.send(`:x: **|** ${user}, Saldo Insuficiente.`);
    }
    if (valor <= 0) {
      return message.channel.send(`:x: **|** ${user}, Use valores acima de **0 (zero)**`);
    }
    if (valor < 10) {
      return message.channel.send(`:x: **|** ${user}, O Saque mínimo é **10 OneCoins**!`);
    }

    const embed4 = new Discord.EmbedBuilder()
      .setDescription(`<a:carregando:1246119195901689888> | **${user.username}** Você está sacando **${valor.toLocaleString()} OneCoins** do Cassino! Aguarde enquanto analisamos a transação!`);

    let msg = await message.channel.send({ embeds: [embed4] });

    setTimeout(async () => {
      const embed5 = new Discord.EmbedBuilder()
        .setDescription(`<:ativo:1254523429038850070> **|** ${user} Aprovamos a transação, removendo OneCoins do seu saldo no Cassino, adicionando OneCoins em sua Carteira e registrando a transferência.`);
      await db.subtract(`moneyCass_${message.guild.id}_${user.id}`, valor);
      await db.add(`money_${message.guild.id}_${user.id}`, valor);
  db.push(`banco_${message.guild.id}_${user.id}.transacoes`, `[+] Sacou ${valor} OneCoins do Cassino`);
        console.log(`O Usuário ${user.tag} (${user.username} sacou (${valor}) do seu saldo no Cassino.\nSobrou: ${moneyCass.toLocaleString() - valor} OneCoins no Cassino de ${user.username}`)
  
      await msg.edit({ embeds: [embed5] });
    }, 3000);

    setTimeout(async () => {
      const embed6 = new Discord.EmbedBuilder()
        .setTitle(`<:sacar:1259641852475347017> **Saque efetuado com sucesso!**`)
        .setColor('#2ecc71')
        .setDescription(`**${user.username} Você sacou ${valor} OneCoins do Cassino!**`)
        .setFooter({ text: `© Cassino OneBot - 2024` })
        .setTimestamp();
      await msg.edit({ embeds: [embed6] });
    }, 6000);
  }
}
  if (pagina === "saldo") {
    let moneyCass = db.get(`moneyCass_${message.guild.id}_${user.id}`);
    if(moneyCass === null) moneyCass = 0;
    const saldo = new Discord.EmbedBuilder()
    .setTitle(`<:carteira:1259643545107562659> **Saldo** `)
    .setColor(Math.floor(Math.random() * 0xffffff))
    .setDescription(`**${user.username}** Abaixo você verá suas informações de saldo dentro do cassino!`)
    .addFields({ name: `Saldo:`, value: `\`${moneyCass.toLocaleString()}\``, inline: true })
    .setFooter({ text: `© OneBot 2024 - Todos os Direitos Reservados` })
    .setTimestamp();

    message.channel.send({ embeds: [saldo] });
  }
if (pagina === "perfil") {

    // Função para calcular o XP necessário para o próximo nível
    function xpNecessario(Nivel) {
        return 500 + (Nivel - 1) * 300;
    }

    // Função para criar a barra de progresso
    function createProgressBar(current, max, barSize) {
        const progress = Math.round((current / max) * barSize);
        const emptyProgress = barSize - progress;

        const progressText = '■'.repeat(progress); // Parte preenchida da barra
        const emptyProgressText = '□'.repeat(emptyProgress); // Parte vazia da barra

        return progressText + emptyProgressText; // Combina as partes para criar a barra completa
    }

    // Função para verificar e aplicar o level up
    function levelUp(user) {
        let Nivel = db.get(`level_${message.guild.id}_${user.id}`) || 1;
        let xp = db.get(`exp_${message.guild.id}_${user.id}`) || 0;
        let xpNecessarioAtual = xpNecessario(Nivel);

        if (xp >= xpNecessarioAtual) {
            Nivel++;
            db.set(`level_${message.guild.id}_${user.id}`, Nivel);
            db.set(`exp_${message.guild.id}_${user.id}`, xp - xpNecessarioAtual);

            const level = new Discord.EmbedBuilder()
                .setTitle(`<:level:1259643545107562659> **SUBIU DE NÍVEL**`)
                .setColor('#2ecc71')
                .setDescription(`**${user.username}** Você alcançou **${xp}** de EXP e subiu para o nível **${Nivel}**`)
                .setFooter({ text: `© [SISTEMA] Cassino OneBot - 2024` })
                .setTimestamp();

            message.channel.send({ embeds: [level] });
        }
    }

    // Obtenção dos dados do usuário
    let Nivel = db.get(`level_${message.guild.id}_${user.id}`) || 1;
    let xp = db.get(`exp_${message.guild.id}_${user.id}`) || 0;
    let xpNecessarioAtual = xpNecessario(Nivel);
  let apostas = db.get(`apostas_${user.id}`) || 0;
    // Criação da barra de progresso
    const progressBar = createProgressBar(xp, xpNecessarioAtual, 20);

    // Criação do embed de perfil com design aprimorado
    const perfil = new Discord.EmbedBuilder()
        .setColor("#7289DA")
        .setTitle(`👤 **Perfil de ${message.author.username}**`)
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        .addFields({ name: `**Nível**:`, value: `🏅 **${Nivel}**`, inline: true })
        .addFields({ name: `**EXP**:`, value: `💥 **${xp.toLocaleString()}**`, inline: true })
        .addFields({ name: `**Progresso para o Próximo Nível**:`, value: `${progressBar} ${xp.toLocaleString()}/${xpNecessarioAtual.toLocaleString()}`, inline: false })
      .addFields({ name: `**Quantidade de Aposta total**:`, value: `💰 **${apostas.toLocaleString()}**`, inline: false })
        .setFooter({ text: { text: `© OneBot - 2024`, iconURL: message.guild.iconURL({ dynamic: true }) } })
        .setTimestamp();

    message.channel.send({ embeds: [perfil] });

    // Verificar se o usuário subiu de nível
    levelUp(message.author);
}


  
}