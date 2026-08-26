
const Discord = require("discord.js");
const { ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

exports.run = async (client, message, args) => {
  const labirinto = [
    ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', ' ', ' ', '#', ' ', ' ', ' ', ' ', ' ', '#'],
    ['#', '#', ' ', '#', ' ', '#', '#', '#', ' ', '#'],
    ['#', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
  ];

  if (args[0] === 'mapa') {
    let jogadorPosX = 1; // posição inicial do jogador no eixo X
    let jogadorPosY = 1; // posição inicial do jogador no eixo Y

    const jogador = '👤'; // emoji representando o jogador

    const renderizarLabirinto = () => {
      let labirintoRenderizado = '';
      for (let y = 0; y < labirinto.length; y++) {
        for (let x = 0; x < labirinto[y].length; x++) {
          if (x === jogadorPosX && y === jogadorPosY) {
            labirintoRenderizado += jogador; // renderiza o jogador na posição atual
          } else {
            labirintoRenderizado += labirinto[y][x]; // renderiza o labirinto
          }
        }
        labirintoRenderizado += '\n'; // pula para a próxima linha
      }
      return labirintoRenderizado;
    };

    const botaoEsquerda = new ButtonBuilder()
      .setStyle(ButtonStyle.Success)
      .setLabel("Esquerda")
      .setCustomId("esquerda");

    const botaoDireita = new ButtonBuilder()
      .setStyle(ButtonStyle.Danger)
      .setLabel("Direita")
      .setCustomId("direita");

    const botaoVerMapa = new ButtonBuilder()
      .setStyle(ButtonStyle.Primary)
      .setLabel("Ver Mapa")
      .setCustomId("ver_mapa");

    const botoesRow = new ActionRowBuilder()
      .addComponents(botaoEsquerda, botaoDireita, botaoVerMapa);

    const mensagem = await message.channel.send({
      content: renderizarLabirinto(),
      components: [botoesRow],
    });

    const filtro = (interaction) => interaction.user.id === message.author.id;
    const collector = mensagem.createMessageComponentCollector({ filter: filtro, time: 60000 });

    collector.on("collect", async (interaction) => {
      if (interaction.customId === "esquerda") {
        if (labirinto[jogadorPosY][jogadorPosX - 1] !== '#') {
          labirinto[jogadorPosY][jogadorPosX] = ' '; // remove a posição atual do jogador
          jogadorPosX -= 1; // atualiza a posição do jogador para a esquerda
          labirinto[jogadorPosY][jogadorPosX] = jogador; // atualiza a nova posição do jogador no labirinto
        }
      } else if (interaction.customId === "direita") {
        if (labirinto[jogadorPosY][jogadorPosX + 1] !== '#') {
          labirinto[jogadorPosY][jogadorPosX] = ' '; // remove a posição atual do jogador
          jogadorPosX += 1; // atualiza a posição do jogador para a direita
          labirinto[jogadorPosY][jogadorPosX] = jogador; // atualiza a nova posição do jogador no labirinto
        }
      } else if (interaction.customId === "ver_mapa") {
        // código para mostrar o mapa
      }

      await interaction.update({ content: renderizarLabirinto() });
    });
  }
};