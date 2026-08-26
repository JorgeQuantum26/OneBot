const { PAISES_REAIS, getDadosPais } = require('./real-countries-data');

const CAMPOS_NUMERICOS = [
  'tesouro',
  'tesouroNacional',
  'populacao',
  'agricultura',
  'ouro',
  'comida',
  'madeira',
  'pedra'
];
const CONSTRUCOES = [
  'quartel',
  'base_aerea',
  'porto_militar',
  'industria',
  'fazenda',
  'usina',
  'laboratorio',
  'mina',
  'banco',
  'universidade',
  'hospital',
  'ferrovia',
  'porto',
  'aeroporto',
  'parque_eolico',
  'usina_solar',
  'usina_nuclear',
  'usina_hidreletrica'
];

function nivelConstrucao(construcoes, nome) {
  const valor = construcoes?.[nome];
  return Number(valor?.nivel ?? valor) || 0;
}

function limitar(valor, minimo, maximo) {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return minimo;
  return Math.max(minimo, Math.min(maximo, Math.floor(numero)));
}

function normalizarPais(nomePais, pais, db) {
  const dados = getDadosPais(nomePais);
  if (!dados || !pais) return false;
  const construcoes = pais.construcoes || {};
  let alterado = false;
  const limites = {
    tesouro: Math.max(dados.tesouro * 100, 10000000),
    tesouroNacional: Math.max(dados.tesouro * 100, 10000000),
    populacao: dados.populacao * 2,
    agricultura: Math.max(dados.agricultura * 100, 10000000),
    ouro: Math.max(dados.ouro * 100, 10000000),
    comida: Math.max(dados.comida * 100, 10000000),
    madeira: Math.max(dados.madeira * 100, 10000000),
    pedra: Math.max(dados.pedra * 100, 10000000)
  };

  for (const campo of CAMPOS_NUMERICOS) {
    const atual = Number(pais[campo]);
    if (!Number.isFinite(atual) || atual < 0) {
      pais[campo] = dados[campo] || 0;
      alterado = true;
    } else if (atual > limites[campo]) {
      pais[campo] = campo === 'populacao' ? dados.populacao : dados[campo] || 0;
      alterado = true;
    }
  }

  for (const nome of CONSTRUCOES) {
    const nivel = nivelConstrucao(construcoes, nome);
    if (nivel > 1000 || nivel < 0 || !Number.isFinite(nivel)) {
      construcoes[nome] = Math.min(100, Math.max(0, Number.isFinite(nivel) ? nivel : 0));
      alterado = true;
    }
  }
  pais.construcoes = construcoes;
  for (const campo of ['receita', 'gastos', 'lucroImpostos']) {
    const valorNormalizado = limitar(pais[campo], 0, limites.tesouro);
    if (valorNormalizado !== pais[campo]) alterado = true;
    pais[campo] = valorNormalizado;
  }
  const inflacaoNormalizada = Math.max(-0.05, Math.min(0.5, Number(pais.inflacao) || dados.inflacao));
  if (inflacaoNormalizada !== pais.inflacao) alterado = true;
  pais.inflacao = inflacaoNormalizada;

  if (alterado) db.set(`pais_${nomePais}`, pais);
  return alterado;
}

function balancearPaises(db) {
  const listaPersistida = db.get('lista_paises') || [];
  const nomesReais = PAISES_REAIS.map((pais) => pais.nome);
  const lista = [...new Set([...listaPersistida, ...nomesReais])];
  let corrigidos = 0;
  for (const nomePais of lista) {
    if (normalizarPais(nomePais, db.get(`pais_${nomePais}`), db)) corrigidos++;
  }
  if (corrigidos > 0) console.log(`[PaisBalance] ${corrigidos} país(es) normalizado(s).`);
  return corrigidos;
}

module.exports = { balancearPaises };
