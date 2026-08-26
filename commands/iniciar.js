const Discord = require("discord.js");
const db = require('../systems/firestore');

// Objeto para armazenar os intervalos em memória
const activeIntervals = {};

// Definindo NPCs em várias localizações
const npcs = {
  "Clock Tower": ["BG Assassin", "SniperX"],
  "Factory": ["ProPlayer FF", "TF Blaze"],
  "Hangar": ["Quinn", "AG Gladiator"]
};

module.exports = {
  name: 'iniciar',
  description: 'Inicia sua jornada no mundo de FreeFire no OneBot!',
  run: async (client, message, args) => {
    let user = message.author;

    // Verifica se já há uma partida ativa
    let partidaAtiva = db.get(`partida_${user.id}`);
    if (partidaAtiva) {
      message.channel.send(`🎟️ | ${user}, você já iniciou sua jornada no mundo de FreeFire!`);
      db.set(`partida_${user.id}`, false);
      db.delete(`location_${user.id}`);
      db.delete(`inventory_${user.id}`);
      db.delete(`inimigos_${user.id}`);
      db.set(`kills_${user.id}`, 0);
      db.set(`dano_${user.id}`, 0);
      // Limpa o intervalo se ele existir
      if (activeIntervals[user.id]) {
        clearInterval(activeIntervals[user.id]);
        delete activeIntervals[user.id];
      }
      return;
    }

    // Define a localização inicial
    let location = db.get(`location_${user.id}`);
    if (!location) {
      location = "Clock Tower"; // Local padrão, ajuste conforme necessário
      db.set(`location_${user.id}`, location);
    }

    // Inicializa NPCs vivos para todas as localizações
    Object.keys(npcs).forEach(loc => {
      if (!db.get(`aliveNPCs_${loc}`)) {
        db.set(`aliveNPCs_${loc}`, npcs[loc].slice());
      }
    });

    // Define alivePlayers e aliveNPCs para a localização do usuário
    db.set(`alivePlayers`, [user.username]);
    db.set(`aliveNPCs_${location}`, npcs[location].slice());

    const modos = ["Ranqueada", "Casual"];
    let modo = args[0];
    if (!modo) {
      const error = new Discord.EmbedBuilder()
        .setTitle(`:x: | ERRO`)
        .setColor('#e74c3c')
        .setDescription(`Você precisa escolher um modo de jogo!`)
        .addFields({ name: `Modos Disponíveis:`, value: `${modos.join("\n")}`, inline: true });
      message.channel.send({ embeds: [error] });
      return;
    }

    if (!modos.includes(modo)) {
      const error1 = new Discord.EmbedBuilder()
        .setTitle(`:x: | ERRO`)
        .setColor('#e74c3c')
        .setDescription(`Esse modo de jogo está em manutenção ou não existe!`)
        .addFields({ name: `Modos Disponíveis:`, value: `${modos.join("\n")}`, inline: true })
        .setFooter({ text: `© OneBot 2024 - Todos os Direitos Reservados` })
        .setTimestamp();
      message.channel.send({ embeds: [error1] });
      return;
    }

    db.set(`partidaModo_${user.id}`, modo);
    db.set(`partida_${user.id}`, true);

    // Funções para calcular pontos
    function calcularPontosVitoria(kills, dano, sobrevivencia) {
      const pontoBase = 100;
      const pontosKill = kills * 10;
      const pontosDano = Math.floor(dano / 10);
      const pontoSobrevivencia = Math.floor(sobrevivencia / 5);
      return pontoBase + pontosKill + pontosDano + pontoSobrevivencia;
    }

    function calcularPontosDerrota(kills, dano, sobrevivencia) {
      const pontoBase = 0;
      const pontosKill = kills * 10;
      const pontosDano = Math.floor(dano / 10);
      const pontoSobrevivencia = Math.floor(sobrevivencia / 5);
      return pontoBase + pontosKill + pontosDano + pontoSobrevivencia;
    }

    const embed = new Discord.EmbedBuilder()
      .setTitle(`🎟️| Iniciando`)
      .setDescription(`<a:sim:868232093556166756> | Você iniciou sua jornada! Boa sorte.`)
      .setFooter({ text: `© OneBot 2024 - Todos os Direitos Reservados!` })
      .setTimestamp();
    message.channel.send({ embeds: [embed] });

    // Intervalo de atualização da partida
    const intervalId = setInterval(() => {
      let aliveNPCs = db.get(`aliveNPCs_${location}`) || [];
      let alivePlayers = db.get(`alivePlayers`) || [];

      db.add(`sobrevivencia_${user.id}`, 10);
      console.log('Intervalo disparado. NPCs vivos:', aliveNPCs, 'Jogadores vivos:', alivePlayers);

      // Condição de vitória ou derrota
      if (aliveNPCs.length === 0 && alivePlayers.length === 1) {
        let winner = alivePlayers[0];
        const vitoria = new Discord.EmbedBuilder()
          .setTitle(`🏆 | BOOYAH!`)
          .setColor(Math.floor(Math.random() * 0xffffff))
          .setDescription(`Parabéns **${winner}**! Você ganhou a partida!`)
          .setTimestamp();
        message.channel.send({ embeds: [vitoria] });

        db.set(`partida_${user.id}`, false);
        db.delete(`location_${user.id}`);
        db.delete(`inventory_${user.id}`);
        db.delete(`inimigos_${user.id}`);
        clearInterval(intervalId);
        delete activeIntervals[user.id];

        if (db.get(`partidaModo_${user.id}`) === "Ranqueada") {
          const kills = db.get(`kills_${user.id}`) || 0;
          const dano = db.get(`dano_${user.id}`) || 0;
          const sobrevivencia = db.get(`sobrevivencia_${user.id}`) || 0;
          const pontos = calcularPontosVitoria(kills, dano, sobrevivencia);
          db.add(`pontuacao_${user.id}`, pontos);

          embed.addFields({ name: `🎖️| Pontos:`, value: `Você ganhou no total **${pontos}** pontos!`, inline: true });
          embed.addFields({ name: `☠️| Abates:`, value: `${kills} abates`, inline: true });
          embed.addFields({ name: `🩸| Dano:`, value: `${dano} de dano`, inline: true });
          embed.addFields({ name: `⏰| Sobrevivência:`, value: `${sobrevivencia} segundos`, inline: true });
          message.channel.send({ embeds: [embed] });
        }
        return;
      }

      if (alivePlayers.length === 0) {
        const derrota = new Discord.EmbedBuilder()
          .setTitle(`☠️ | GAME OVER`)
          .setColor('#e74c3c')
          .setDescription(`Infelizmente, todos os jogadores foram mortos!`)
          .setFooter({ text: `© OneBot 2024 - Todos os Direitos Reservados!` })
          .setTimestamp();
        message.channel.send({ embeds: [derrota] });

        db.set(`partida_${user.id}`, false);
        db.delete(`location_${user.id}`);
        db.delete(`inventory_${user.id}`);
        db.delete(`inimigos_${user.id}`);
        clearInterval(intervalId);
        delete activeIntervals[user.id];

        if (db.get(`partidaModo_${user.id}`) === "Ranqueada") {
          const kills = db.get(`kills_${user.id}`) || 0;
          const dano = db.get(`dano_${user.id}`) || 0;
          const sobrevivencia = db.get(`sobrevivencia_${user.id}`) || 0;
          const pontos = calcularPontosDerrota(kills, dano, sobrevivencia);
          db.add(`pontuacao_${user.id}`, pontos);

          embed.addFields({ name: `🎖️| Pontos:`, value: `Você ganhou no total **${pontos}** pontos!`, inline: true });
          embed.addFields({ name: `☠️| Abates:`, value: `${kills} abates`, inline: true });
          embed.addFields({ name: `🩸| Dano:`, value: `${dano} de dano`, inline: true });
          embed.addFields({ name: `⏰| Sobrevivência:`, value: `${sobrevivencia} segundos`, inline: true });
          message.channel.send({ embeds: [embed] });
        }
        return;
      }

      // Adiciona o jogador na lista de NPCs e jogadores, mas exclui o próprio jogador dos alvos
      let targetList = aliveNPCs.concat(alivePlayers.filter(player => player !== user.username));
      if (targetList.length === 0) return;

      let killerIndex = Math.floor(Math.random() * aliveNPCs.length);
      let killer = aliveNPCs[killerIndex];

      let targetIndex = Math.floor(Math.random() * targetList.length);
      let target = targetList[targetIndex];
            let texto = ["Caiu de um lugar alto e morreu", "Morreu com a própria mina terrestre", "Morreu com a explosão do carro"];
      let textoLista = texto[Math.floor(Math.random() * texto.length)];

      // Atualiza a lista de NPCs vivos corretamente
      if (target === killer) {
        aliveNPCs = aliveNPCs.filter(npc => npc !== target);
        db.set(`aliveNPCs_${location}`, aliveNPCs);
        const targetKiller = new Discord.EmbedBuilder()
          .setTitle(`💀 | Morte`)
          .setColor(Math.floor(Math.random() * 0xffffff))
          .setDescription(`${killer} ${textoLista}! Restam ${aliveNPCs.length} NPCs e ${alivePlayers.length} jogadores na partida!`)
          .setFooter({ text: `© OneBot 2024 - Todos os Direitos Reservados!` })
          .setTimestamp();
        message.channel.send({ embeds: [targetKiller] });
      } else if (aliveNPCs.includes(target)) {
        aliveNPCs = aliveNPCs.filter(npc => npc !== target);
        db.set(`aliveNPCs_${location}`, aliveNPCs);
        const killNPC = new Discord.EmbedBuilder()
          .setTitle(`💀 | Morte`)
          .setColor(Math.floor(Math.random() * 0xffffff))
          .setDescription(`${killer} matou ${target}! Restam ${aliveNPCs.length} NPCs e ${alivePlayers.length} jogadores na partida!`)
          .setFooter({ text: `© OneBot 2024 - Todos os Direitos Reservados!` })
          .setTimestamp();
        message.channel.send({ embeds: [killNPC] });
      }
    }, 10000); // Atualiza a cada 10 segundos

    // Armazena o intervalo ativo
    activeIntervals[user.id] = intervalId;
  }
};
