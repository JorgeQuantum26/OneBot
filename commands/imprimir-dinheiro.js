const Discord = require("discord.js");
const db = require('../systems/firestore');
// Define o valor máximo de dinheiro que pode ser impresso por vez
const MAXIMO_IMPRESSAO_DINHEIRO = 1000;

// Comando para imprimir dinheiro
exports.run = async (client, message, args) => {
    let governador = db.get(`pais_${pais}.governador`);  if (!pais) {
    return message.channel.send("<:recusado:1031262539272687777> **|** Você não é governador de nenhum país.");
  }

  // Obter a inflação atual do país
  const inflacao = db.get(`pais_${pais}.inflacao`) || 0;

  // Definir o valor do novo dinheiro impresso
  const novoDinheiro = parseInt(args[0]);
  if (!novoDinheiro || novoDinheiro <= 0 || novoDinheiro > MAXIMO_IMPRESSAO_DINHEIRO) {
    return message.channel.send(`<:recusado:1031262539272687777>**|** Valor inválido. Utilize o formato correto: \`${prefix}imprimir-dinheiro <quantidade menor que ${MAXIMO_IMPRESSAO_DINHEIRO}>\``);
  }

  // Somar o novo dinheiro impresso no tesouro nacional do país do governador
  const tesouroNacional = db.get(`pais_${pais}.tesouroNacional`);
  db.set(`pais_${pais}.tesouroNacional`, tesouroNacional + novoDinheiro);

  // Calcular o novo valor da inflação
  const novaInflacao = inflacao + (novoDinheiro / 1000);

  // Atualizar a inflação do país do governador
  db.set(`pais_${pais}.inflacao`, novaInflacao);

  message.channel.send(`<:aceitado:1031262771326759002> **|** A Casa da Moeda Imprimiu ${novoDinheiro} de dinheiro para ${pais}. A inflação aumentou para ${novaInflacao.toFixed(2)}%.`);
};