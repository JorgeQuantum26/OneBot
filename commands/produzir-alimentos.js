
const db = require('../systems/rpg-db');

// Função para produzir alimentos em um país
function produzirAlimentos(nomePais, quantidade) {
  const investimentos = db.get(`${pais}.investimentos`);

  // Procura pelo primeiro investimento agrícola e o atualiza com a quantidade especificada
  for (const paisInvestimentos of investimentos) {
    for (const investimento of paisInvestimentos.investimentos) {
      if (investimento.tipoInvestimento === 'Agricultura') {
        investimento.quantidadeProduzida += quantidade;
        db.set(`${pais}.investimentos`, investimentos);
        return true;
      }
    }
  }

  // Se nenhum investimento agrícola for encontrado, retorna falso
  return false;
}

// Função para gastar dinheiro do Tesouro Nacional de um país
function gastarDinheiroDoTesouroNacional(nomePais, valor) {
  let dinheiroPais = db.get(`${nomePais}.tesouro`);
  dinheiroPais -= valor;
  db.set(`${nomePais}.tesouro`, dinheiroPais);
}

// Comando para produzir alimentos em um país
const args = process.argv.slice(2);
const nomePais = args[0];
const quantidade = parseInt(args[1]);

if (isNaN(quantidade)) {
  message.channel.send('Quantidade de alimentos inválida');
  return;
}

const paisDoGovernador = db.get(`governadore s.${process.env.USER_ID}`);

// Verifica se o usuário que executou o script é realmente o governador do país
if (paisDoGovernador !== nomePais) {
  console.log('Você não é o governador deste país');
  return;
}

const investimentos = db.get(`${nomePais}.investimentos`);

if (!investimentos) {
  console.log(`O país ${nomePais} ainda não possui investimentos registrados`);
  return;
}

// Procura pelo primeiro investimento agrícola e o atualiza com a quantidade especificada
for (const paisInvestimentos of investimentos) {
  for (const investimento of paisInvestimentos.investimentos) {
    if (investimento.tipoInvestimento === 'Agricultura') {
      investimento.quantidadeProduzida += quantidade;

      // Calcula o valor de mercado dos alimentos produzidos
      const valorMercado = quantidade * investimento.valorUnitario;

      // Subtrai o valor de mercado dos alimentos produzidos do dinheiro do Tesouro Nacional
      gastarDinheiroDoTesouroNacional(nomePais, valorMercado);

      db.set(`${nomePais}.investimentos`, investimentos);
      message.channel.send(`Produzidos ${quantidade} alimentos no país ${nomePais}`);
      return;
    }
  }
}