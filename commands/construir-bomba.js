const Discord = require("discord.js");
const db = require('../systems/rpg-db');

exports.run = async (client, message, args) => {

  const recursoNecessario = "Urânio enriquecido"; // recurso necessário para a produção de bombas nucleares
  const quantidadeNecessaria = 100; // quantidade de recurso necessário para a produção de bombas nucleares
  const custo = 5000; // custo em dinheiro para produzir uma bomba nuclear
  const programaNuclear = "Programa Nuclear"; // nome do programa nuclear

  const userId = message.author.id; // id do usuário que executou o comando
  const userData = db.get(`usuarios.${userId}`) || {}; // tabela de dados do usuário
  const pais = userData.pais; // nome do país do jogador que executou o comando
  const governadorId = db.get(`paises.${pais}.governador`);

  // Verifica se o ID do usuário que executou o comando corresponde ao ID do governador do país
  if (userId !== governadorId) {
    return message.channel.send("Você não é o governador deste país, não pode produzir bombas nucleares.");
  }

  // Verifica se o país tem o programa nuclear e se tem os recursos e o dinheiro necessário para produzir bombas nucleares
  const paises = db.get(`paises`) || {};
  const recursos = paises[pais]?.recursos || {};
  const tesouro = paises[pais]?.tesouro || 0;
  const programa = paises[pais]?.areasEspeciais?.some(area => area.nome === programaNuclear);

  if (!programa) {
    return message.channel.send(`${pais} não tem o programa nuclear construído.`);
  }
  if (!recursos[recursoNecessario] || recursos[recursoNecessario] < quantidadeNecessaria) {
    return message.channel.send(`${pais} não tem ${quantidadeNecessaria} unidade(s) de ${recursoNecessario} para produzir bombas nucleares.`);
  }
  if (tesouro < custo) {
    return message.channel.send(`${pais} não tem dinheiro suficiente no tesouro nacional para produzir bombas nucleares.`);
  }

  // Adiciona uma bomba nuclear à tabela de bombas, remove o recurso necessário e o dinheiro do tesouro nacional
  db.add(`bombas_${pais}`, 1);
  db.subtract(`paises.${pais}.recursos.${recursoNecessario}`, quantidadeNecessaria);
  db.subtract(`paises.${pais}.tesouro`, custo);

  // Confirma a produção de bombas nucleares
  const produzido = new Discord.EmbedBuilder()
    .setTitle(`Bomba(s) Nuclear(ais) Produzida(s)`)
    .setDescription(`${pais} produziu 1 bomba nuclear por ${custo} de dinheiro e ${quantidadeNecessaria} unidade(s) de ${recursoNecessario}`)
    .setTimestamp()
    .setFooter({ text: `© RPG Mundi - OneBot` });
  message.channel.send({ embeds: [produzido] });
  }