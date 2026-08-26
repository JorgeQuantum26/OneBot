const db = require('./rpg-db');
const { gerarNoticia } = require('./news-templates');
const { PAISES_REAIS, getDadosPais } = require('./real-countries-data');
const { criarProposta, enviarPropostaComBotao, TIPOS_PROPOSTA } = require('./propostas-engine');
const { TECNOLOGIAS } = require('../commands/pesquisa');
const { balancearPaises } = require('./pais-balance');
const { criarGuerra, registrarBatalha, calcularPontuacao } = require('./guerra-state');
// 🦠 DOENÇAS E EVENTOS DE SAÚDE
const DOENCAS = {
    gripe_comum: {
        nome: 'Gripe Comum',
        emoji: '🤧',
        mortalidade: 0.0001,
        contagio: 0.3,
        duracao: 3,
        gravidade: 'leve'
    },
    dengue: { nome: 'Dengue', emoji: '🦟', mortalidade: 0.001, contagio: 0.15, duracao: 7, gravidade: 'media' },
    colera: {
        nome: 'Cólera',
        emoji: '💧',
        mortalidade: 0.01,
        contagio: 0.2,
        duracao: 5,
        gravidade: 'grave',
        requer: 'saneamento_basico'
    },
    tuberculose: {
        nome: 'Tuberculose',
        emoji: '🫁',
        mortalidade: 0.02,
        contagio: 0.1,
        duracao: 30,
        gravidade: 'grave'
    },
    malaria: { nome: 'Malária', emoji: '🦟', mortalidade: 0.015, contagio: 0.12, duracao: 14, gravidade: 'grave' },
    covid_variante: {
        nome: 'Nova Variante Viral',
        emoji: '🦠',
        mortalidade: 0.005,
        contagio: 0.4,
        duracao: 14,
        gravidade: 'pandemica'
    },
    peste: {
        nome: 'Peste Bubônica',
        emoji: '🐀',
        mortalidade: 0.05,
        contagio: 0.08,
        duracao: 21,
        gravidade: 'catastrofica'
    },
    ebola: {
        nome: 'Febre Hemorrágica',
        emoji: '🩸',
        mortalidade: 0.5,
        contagio: 0.05,
        duracao: 21,
        gravidade: 'catastrofica'
    }
};
const TIPOS_BASES = {
    posto_avancado: { nome: 'Posto Avançado', emoji: '🏕️', capacidade: 10000, bonus: 1.05, custo: 50000 },
    base_operacional: { nome: 'Base Operacional', emoji: '🏗️', capacidade: 50000, bonus: 1.1, custo: 200000 },
    quartel_general: { nome: 'Quartel General', emoji: '🏰', capacidade: 200000, bonus: 1.2, custo: 1000000 },
    centro_suprimentos: { nome: 'Centro de Suprimentos', emoji: '📦', capacidade: 100000, bonus: 1.08, custo: 300000 }
};

const Discord = require('discord.js');

const NPC_ATIVOS = [
    'eua',
    'china',
    'rússia',
    'alemanha',
    'brasil',
    'índia',
    'reino-unido',
    'arábia-saudita',
    'japão',
    'frança',
    'turquia',
    'israel',
    'norte-coreia',
    'irã',
    'austrália',
    'coreia-do-sul',
    'mexico',
    'argentina',
    'indonésia',
    'paquistão',
    'canadá',
    'nigeria',
    'ucrânia',
    'suíça',
    'noruega',
    'venezuela',
    'colômbia',
    'chile',
    'peru',
    'egito',
    'africa-do-sul',
    'cazaquistão',
    'emirados-árabes',
    'polônia',
    'suécia',
    'itália',
    'espanha',
    'portugal',
    'holanda',
    'taiwan',
    'filipinas',
    'malásia',
    'tailândia'
];

const FUNCOES_MINISTERIO = {
    economia: {
        emoji: '💹',
        nome: 'Economia',
        acao: (pais, nomePais) => {
            const min = pais.ministerios?.economia;
            if (!min || !min.ativo) return null;
            const nivel = min.nivel || 1;
            const reducao = 0.002 * nivel;
            db.subtract(`pais_${nomePais}.inflacao`, reducao);
            return `📉 Inflação reduzida (-${(reducao * 100).toFixed(2)}%)`;
        }
    },

    defesa: {
        emoji: '⚔️',
        nome: 'Defesa',
        acao: (pais, nomePais) => {
            const min = pais.ministerios?.defesa;
            if (!min || !min.ativo) return null;
            const nivel = min.nivel || 1;
            const tesouro = pais.tesouro || 0;
            if (tesouro > 2000) {
                const recrutamento = Math.floor(nivel * 50);
                db.add(`pais_${nomePais}.exercito.infantaria`, recrutamento);
                db.subtract(`pais_${nomePais}.tesouro`, recrutamento * 2);
                return `🪖 +${recrutamento} soldados recrutados`;
            }
            return null;
        }
    },

    agricultura: {
        emoji: '🌾',
        nome: 'Agricultura',
        acao: (pais, nomePais) => {
            const min = pais.ministerios?.agricultura;
            if (!min || !min.ativo) return null;
            const nivel = min.nivel || 1;
            const ganho = nivel * 50;
            db.add(`pais_${nomePais}.comida`, ganho);
            return `🌱 +${ganho} comida`;
        }
    },

    comercio: {
        emoji: '🚢',
        nome: 'Comércio',
        acao: (pais, nomePais) => {
            const min = pais.ministerios?.comercio;
            if (!min || !min.ativo) return null;
            const nivel = min.nivel || 1;
            if (Math.random() < 0.2 + nivel * 0.02) {
                const ganho = Math.floor(200 * nivel);
                db.add(`pais_${nomePais}.tesouro`, ganho);
                return `🚢 Comércio gerou +${ganho} moedas`;
            }
            return null;
        }
    },

    exterior: {
        emoji: '🌐',
        nome: 'Relações Exteriores',
        acao: (pais, nomePais) => {
            const min = pais.ministerios?.exterior;
            if (!min || !min.ativo) return null;
            if (Math.random() < 0.1) {
                db.add(`pais_${nomePais}.reputacaoDiplomatica`, 1);
                return `🌍 Relações internacionais melhoraram`;
            }
            return null;
        }
    },

    saude: {
        emoji: '🏥',
        nome: 'Saúde',
        acao: (pais, nomePais) => {
            const min = pais.ministerios?.saude;
            if (!min || !min.ativo) return null;
            const nivel = min.nivel || 1;
            const crescimento = Math.floor((pais.populacao || 0) * (0.001 * nivel));
            db.add(`pais_${nomePais}.populacao`, crescimento);
            return `👶 +${crescimento} habitantes`;
        }
    },

    educacao: {
        emoji: '📚',
        nome: 'Educação',
        acao: (pais, nomePais) => {
            const min = pais.ministerios?.educacao;
            if (!min || !min.ativo) return null;
            const nivel = min.nivel || 1;
            const ganho = 0.005 * nivel;
            db.add(`pais_${nomePais}.produtividade`, ganho);
            return `📖 +${(ganho * 100).toFixed(2)}% produtividade`;
        }
    },

    interior: {
        emoji: '🏙️',
        nome: 'Interior',
        acao: (pais, nomePais) => {
            const min = pais.ministerios?.interior;
            if (!min || !min.ativo) return null;
            const nivel = min.nivel || 1;
            if ((pais.tesouro || 0) > 3000) {
                db.add(`pais_${nomePais}.infraestrutura`, 0.05 * nivel);
                db.subtract(`pais_${nomePais}.tesouro`, 500 * nivel);
                return `🏗️ Infraestrutura melhorada`;
            }
            return null;
        }
    },

    fazenda: {
        emoji: '🏦',
        nome: 'Fazenda',
        acao: (pais, nomePais) => {
            const min = pais.ministerios?.fazenda;
            if (!min || !min.ativo) return null;
            const nivel = min.nivel || 1;
            const ganho = Math.floor(100 * nivel);
            db.add(`pais_${nomePais}.tesouro`, ganho);
            return `🏦 +${ganho} moedas arrecadadas`;
        }
    },

    ciencia: {
        emoji: '🔬',
        nome: 'Ciência',
        acao: (pais, nomePais) => {
            const min = pais.ministerios?.ciencia;
            if (!min || !min.ativo) return null;
            const nivel = min.nivel || 1;
            db.add(`pais_${nomePais}.produtividade`, 0.01 * nivel);
            return `🧬 Avanço científico`;
        }
    },

    energia: {
        emoji: '⚡',
        nome: 'Energia',
        acao: (pais, nomePais) => {
            const min = pais.ministerios?.energia;
            if (!min || !min.ativo) return null;
            const nivel = min.nivel || 1;
            const ganho = 100 * nivel;
            db.add(`pais_${nomePais}.tesouro`, ganho);
            return `⚡ Energia gerou +${ganho}`;
        }
    }
};

const SUGESTOES_GOVERNO = [
    {
        condicao: (p) => (p.inflacao || 0) > 0.15,
        msg: '⚠️ **Ministério das Finanças:** Inflação acima de 15%! Recomendamos reduzir gastos e aumentar a produção agrícola com `B!investir-agricultura`.',
        urgente: true
    },
    {
        condicao: (p) => (p.tesouro || 0) < 1000,
        msg: '🚨 **Ministério da Fazenda:** Tesouro crítico! Use `B!pagarimposto` ou invista via cidadãos com `B!registrar-cidadao`.',
        urgente: true
    },
    {
        condicao: (p) => (p.infraestrutura || 0) < 2,
        msg: '🏗️ **Ministério do Interior:** Infraestrutura precária. Melhore com `B!melhorarinfraestrutura` para reduzir inflação.',
        urgente: false
    },
    {
        condicao: (p) => (p.rotasComerciais || []).length === 0,
        msg: '🚢 **Ministério do Comércio:** Nenhuma rota comercial ativa! Abra com `B!abrir-rota <país>` para gerar receita passiva.',
        urgente: false
    },
    {
        condicao: (p) => (p.agricultura || 0) < 100,
        msg: '🌾 **Ministério da Agricultura:** Produção alimentar crítica. Invista com `B!investir-agricultura`.',
        urgente: true
    },
    {
        condicao: (p) => (p.populacao || 0) > 0 && (p.cidadaos || []).length === 0,
        msg: '👥 **Governo Federal:** Nenhum cidadão registrado! Converse com jogadores para usarem `B!registrar-cidadao`.',
        urgente: false
    },
    {
        condicao: (p) => (p.exercito || {}).infantaria < 100 && (p.bombasNucleares || 0) === 0,
        msg: '⚔️ **Ministério da Defesa:** Exército inexistente! Seu país está vulnerável. Use `B!exercito recrutar`.',
        urgente: false
    },
    {
        condicao: (p) => (p.parlamentoPendente || 0) > 0,
        msg: '📜 **Parlamento Nacional:** Há leis aguardando sua decisão! Use `B!ver-leis` para aprovar ou vetar.',
        urgente: true
    },
    {
        condicao: (p) => (p.valorMoeda || 1) < 0.05,
        msg: '💱 **Banco Central:** Moeda em colapso! Aumente exportações e reduza gastos com urgência.',
        urgente: true
    }
];

class PaisEngine {
    constructor(client) {
        this.client = client;
        this.tickCount = 0;
    }

    start() {
        this.initNPCCountries();
        balancearPaises(db);
        setInterval(() => this.tick(), 60 * 1000);
        console.log('[PaisEngine] Sistema de países iniciado. Tick a cada 60s.');
    }

    initNPCCountries() {
        const oldFakeNPCs = [
            'nação-celestial',
            'império-do-norte',
            'república-sul',
            'sultanato-do-leste',
            'federação-ocidental'
        ];
        let lista = db.get('lista_paises') || [];
        for (const fake of oldFakeNPCs) {
            db.delete(`pais_${fake}`);
            lista = lista.filter((p) => p !== fake);
        }
        db.set('lista_paises', lista);

        for (const nomeNPC of NPC_ATIVOS) {
            const existente = db.get(`pais_${nomeNPC}`);
            const dados = getDadosPais(nomeNPC);
            if (!dados) continue;
            if (existente) {
                this.garantirEstruturaPais(nomeNPC, existente, dados);
                if (!existente.isNPC) continue;
            }
            if (!existente) {
                db.set(`pais_${nomeNPC}`, this._dadosIniciaisNPC(dados));
                if (!lista.includes(nomeNPC)) lista.push(nomeNPC);
                console.log(`[PaisEngine] NPC real "${dados.bandeira} ${nomeNPC}" inicializado.`);
            } else if (!existente.exercito) {
                db.set(`pais_${nomeNPC}.exercito`, this._exercitoInicial(dados.personalidade, dados.bombasNucleares));
            }
        }
        db.set('lista_paises', lista);
    }

    garantirEstruturaPais(nomePais, pais, dados) {
        const defaults = this._dadosIniciaisNPC(dados);
        const paisAtual = { ...pais };
        const camposBase = [
            'nomeFormal',
            'bandeira',
            'moeda',
            'simboloMoeda',
            'personalidade',
            'valorMoeda',
            'tesouro',
            'tesouroNacional',
            'populacao',
            'infraestrutura',
            'agricultura',
            'produtividade',
            'ouro',
            'comida',
            'madeira',
            'pedra',
            'exportacoes',
            'importacoes',
            'bombasNucleares',
            'pib',
            'inflacao',
            'taxaImposto',
            'taxaCrescimentoEconomico',
            'gastos',
            'receita',
            'lucroImpostos',
            'ministerios',
            'funcionarios',
            'funcionariosIA',
            'rotasComerciais',
            'embargos',
            'sancoes',
            'aliancas',
            'leisAprovadas',
            'leisVetadas',
            'mandatoExpiraEm',
            'cidadaos',
            'historicoCambio',
            'exercito',
            'parlamentoPendente',
            'aprovacaoPopular',
            'reputacaoDiplomatica',
            'historicoDiplomatico',
            'mineracao',
            'construcoes'
        ];

        let alterado = false;
        for (const campo of camposBase) {
            if (paisAtual[campo] === undefined || paisAtual[campo] === null) {
                paisAtual[campo] = defaults[campo];
                alterado = true;
            }
        }

        const construcoes = paisAtual.construcoes || {};
        for (const [tipo, nivelBase] of Object.entries(defaults.construcoes)) {
            if (construcoes[tipo] === undefined || construcoes[tipo] === null) {
                construcoes[tipo] = nivelBase;
                alterado = true;
            }
        }
        paisAtual.construcoes = construcoes;

        const exercito = paisAtual.exercito || {};
        for (const [tipo, quantidadeBase] of Object.entries(defaults.exercito)) {
            if (exercito[tipo] === undefined || exercito[tipo] === null) {
                exercito[tipo] = quantidadeBase;
                alterado = true;
            }
        }
        paisAtual.exercito = exercito;

        if (alterado) db.set(`pais_${nomePais}`, paisAtual);
        return paisAtual;
    }

    _dadosIniciaisNPC(dados) {
        return {
            governador: null,
            isNPC: true,
            nomeFormal: dados.nomeFormal,
            bandeira: dados.bandeira,
            moeda: dados.moeda,
            simboloMoeda: dados.simbolo,
            personalidade: dados.personalidade,
            valorMoeda: dados.valorMoeda,
            tesouro: dados.tesouro,
            tesouroNacional: Math.floor(dados.tesouro * 0.5),
            populacao: dados.populacao,
            infraestrutura: dados.infraestrutura,
            agricultura: dados.agricultura,
            produtividade: 1.0,
            ouro: dados.ouro,
            comida: dados.comida,
            madeira: dados.madeira,
            pedra: dados.pedra,
            exportacoes: 0,
            importacoes: 0,
            bombasNucleares: dados.bombasNucleares,
            pib: dados.tesouro * 2,
            inflacao: dados.inflacao,
            taxaImposto: dados.taxaImposto,
            taxaCrescimentoEconomico: 0.02,
            gastos: 0,
            receita: 0,
            lucroImpostos: 0,
            ministerios: {},
            funcionarios: [],
            funcionariosIA: this.gerarFuncionariosIA(dados.personalidade),
            rotasComerciais: [],
            embargos: [],
            sancoes: [],
            aliancas: [],
            leisAprovadas: [],
            leisVetadas: [],
            mandatoExpiraEm: Date.now() + 365 * 24 * 60 * 60 * 1000,
            cidadaos: [],
            historicoCambio: [dados.valorMoeda],
            exercito: this._exercitoInicial(dados.personalidade, dados.bombasNucleares),
            parlamentoPendente: 0,
            aprovacaoPopular: Math.floor(Math.random() * 40) + 50,
            reputacaoDiplomatica: 50,
            historicoDiplomatico: [],
            mineracao: { nivel: 1, eficiencia: 1.0, investimento: 0 },
            construcoes: {
                quartel: 0,
                base_aerea: 0,
                porto_militar: 0,
                industria: 0,
                fazenda: 0,
                usina: 0,
                banco: 0,
                hospital: 0,
                laboratorio: 0,
                centro_pesquisa: 0,
                fabrica_drones: 0,
                parque_eolico: 0,
                usina_solar: 0
            }
        };
    }

    _exercitoInicial(personalidade, bombas = 0) {
        const mult = personalidade === 'militar' ? 5 : personalidade === 'riqueza' ? 3 : 1;
        return {
            infantaria: 10000 * mult,
            tanques: 200 * mult,
            avioes: 50 * mult,
            navios: 20 * mult,
            manutencao: 500 * mult
        };
    }

    gerarFuncionariosIA(personalidade) {
        const base = [
            { cargo: 'Ministro das Finanças', ia: true, funcao: 'economia', nome: 'Min. Econômio' },
            { cargo: 'Ministro da Defesa', ia: true, funcao: 'defesa', nome: 'Min. Defensor' }
        ];
        if (['comercial', 'industrial'].includes(personalidade))
            base.push({ cargo: 'Ministro do Comércio', ia: true, funcao: 'comercio', nome: 'Min. Mercante' });
        if (personalidade === 'militar')
            base.push({ cargo: 'Chefe do Estado-Maior', ia: true, funcao: 'defesa', nome: 'Gen. Fortaleza' });
        if (personalidade === 'agricola')
            base.push({ cargo: 'Ministro da Agricultura', ia: true, funcao: 'agricultura', nome: 'Min. Colheita' });
        if (personalidade === 'riqueza')
            base.push({ cargo: 'Ministro das Finanças (Sênior)', ia: true, funcao: 'fazenda', nome: 'Min. Fortuna' });
        if (personalidade === 'crescimento')
            base.push({ cargo: 'Ministro da Saúde', ia: true, funcao: 'saude', nome: 'Min. Vida' });
        return base;
    }

    async tick() {
        this.tickCount++;
        const listaPaises = db.get('lista_paises') || [];

        for (const nomePais of listaPaises) {
            const pais = db.get(`pais_${nomePais}`);
            if (!pais) continue;

            this.coletarImpostosPoblacion(nomePais, pais);
            this.processarMinisterios(nomePais, pais);
            this.atualizarAgricultura(nomePais, pais);
            this.processarExercito(nomePais, pais);
            this.atualizarInflacao(nomePais, pais);
            this.atualizarCambio(nomePais, pais);
            this.processarRotasComerciais(nomePais, pais);
            this.processarInstituicoesGoverno(nomePais, pais);

            // ⚡ NOVO: Processar tributos de fantoches
            this.processarTributosFantoches(nomePais, pais);

            // ⚡ NOVO: Processar tensão colonial
            this.processarTensaoColonial(nomePais, pais);
            this.processarPesquisas(nomePais, pais);
            this.processarProgramaNuclear(nomePais, pais);
            this.atualizarAprovacaoPopular(nomePais, pais);
            this.consumirEnergia(nomePais, pais);
            this.consumirComida(nomePais, pais);

            // ⚡ Pagar salários nucleares
            this.pagarSalariosNucleares(nomePais, pais);

            // 🏥 Processar saúde pública
            this.processarSaude(nomePais, pais);

            // 🦠 Verificar surtos de doenças
            this.verificarSurtosDoencas(nomePais, pais);
            // ⚡ Processar inflação dos fantoches TAMBÉM
            this.processarInflacaoFantoches(nomePais, pais);

            // Procesar IA militar
            this.processarIA_Militar(nomePais, pais);

            this.processarDrones(nomePais, pais);

            if (pais.isNPC && NPC_ATIVOS.includes(nomePais)) {
                await this.npcIA(nomePais);
            } else if (!pais.isNPC) {
                this.enviarSugestoesGoverno(nomePais, pais);
                this.processarParlamento(nomePais, pais);
            }
        }

        this.processarAnexacoes();

        if (this.tickCount % 2 === 0) await this.processarRespostasNPC();
        this.processarNegociacoesNPC();

        if (this.tickCount % 3 === 0) this.gerarNoticiaGlobal(listaPaises);
        if (this.tickCount % 5 === 0) await this.geopoliticaNPC(listaPaises);
        if (this.tickCount % 10 === 0) this.processarEleicoes(listaPaises);
        // ⚡ NOVO: Notícias sobre fantoches a cada 4 ciclos
        if (this.tickCount % 4 === 0) this.gerarNoticiasFantoches(listaPaises);
    }

    coletarImpostosPoblacion(nomePais, pais) {
        const taxaImposto = Math.max(0.01, Math.min(0.95, pais.taxaImposto || 0.1));
        const produtividade = pais.produtividade || 1.0;

        const cidadaos = pais.cidadaos || [];
        let totalCidadaos = 0;
        for (const id of cidadaos) {
            const saldo = db.get(`${id}.saldo`) || 0;
            if (saldo > 0) {
                const imposto = Math.floor(saldo * taxaImposto);
                if (imposto > 0) {
                    db.subtract(`${id}.saldo`, imposto);
                    totalCidadaos += imposto;
                }
            }
        }

        const receitaPopulacao = Math.floor((pais.populacao || 0) * taxaImposto * produtividade * 0.001);
        const totalPopulacao = Math.floor((pais.populacao || 0) * 0.1);
        const total = totalCidadaos + receitaPopulacao + totalPopulacao;

        if (total > 0) {
            db.add(`pais_${nomePais}.tesouroNacional`, total);
            db.add(`pais_${nomePais}.tesouro`, receitaPopulacao);
            db.add(`pais_${nomePais}.lucroImpostos`, total);
            db.add(`pais_${nomePais}.receita`, total);

            if (!pais.isNPC) {
                const dados = getDadosPais(nomePais);
                const noticia = {
                    titulo: '💰 Ciclo Tributário',
                    descricao: `**${dados ? dados.nomeFormal : nomePais}** arrecadou **${total.toLocaleString('pt-BR')}** ${dados ? dados.moeda : 'moedas'} em impostos (cidadãos: ${totalCidadaos} + população: ${receitaPopulacao}).`,
                    tipo: 'governo',
                    impacto: 'neutro',
                    timestamp: Date.now(),
                    pais: nomePais
                };
                this.adicionarNoticiaNacional(nomePais, noticia);
                this.enviarNoticiaCanal(nomePais, noticia);
            }
        }
    }

    processarMinisterios(nomePais, pais) {
        const ministerios = pais.ministerios || {};
        const funcionariosIA = pais.funcionariosIA || [];
        const relatorio = [];

        for (const [, min] of Object.entries(ministerios)) {
            const custo = (min.orcamento || 500) + (min.funcionarios || []).length * 200;
            const tesouroAtual = db.get(`pais_${nomePais}.tesouro`) || 0;
            if (tesouroAtual < custo) continue;
            db.subtract(`pais_${nomePais}.tesouro`, custo);
            db.add(`pais_${nomePais}.gastos`, custo);

            if (min.funcao && FUNCOES_MINISTERIO[min.funcao]) {
                const paisAtualizado = db.get(`pais_${nomePais}`);
                const resultado = FUNCOES_MINISTERIO[min.funcao].acao(paisAtualizado, nomePais);
                if (resultado) relatorio.push(`${FUNCOES_MINISTERIO[min.funcao].emoji} **${min.nome}**: ${resultado}`);
            }
        }

        for (const func of funcionariosIA) {
            if (func.funcao && FUNCOES_MINISTERIO[func.funcao]) {
                const paisAtualizado = db.get(`pais_${nomePais}`);
                const resultado = FUNCOES_MINISTERIO[func.funcao].acao(paisAtualizado, nomePais);
                if (resultado) relatorio.push(`🤖 **${func.nome}** (${func.cargo}): ${resultado}`);
            }
        }

        if (!pais.isNPC && relatorio.length > 0 && this.tickCount % 3 === 0) {
            const noticia = {
                titulo: '🏛️ Relatório dos Ministérios',
                descricao: relatorio.join('\n'),
                tipo: 'governo',
                impacto: 'neutro',
                timestamp: Date.now(),
                pais: nomePais
            };
            this.adicionarNoticiaNacional(nomePais, noticia);
            this.enviarNoticiaCanal(nomePais, noticia);
        }
    }

    processarInstituicoesGoverno(nomePais, pais) {
        const populacao = pais.populacao || 0;
        const inflacao = pais.inflacao || 0.05;

        const receitaEstados = Math.floor(populacao * 0.1);
        const receitaMunicipios = Math.floor(populacao * 0.5);
        const totalInstituicoes = receitaEstados + receitaMunicipios;

        if (totalInstituicoes > 0) {
            db.add(`pais_${nomePais}.tesouro`, totalInstituicoes);
            db.add(`pais_${nomePais}.receita`, totalInstituicoes);
        }

        const crescPop = Math.floor(populacao * (inflacao < 0.05 ? 0.002 : 0.0005));
        if (crescPop > 0) db.add(`pais_${nomePais}.populacao`, crescPop);
    }

    processarExercito(nomePais, pais) {
        const exercito = pais.exercito;
        if (!exercito) {
            db.set(
                `pais_${nomePais}.exercito`,
                this._exercitoInicial(pais.personalidade || 'equilibrado', pais.bombasNucleares || 0)
            );
            return;
        }

        const nivelDefesa = pais.ministerios?.defesa?.nivel || 0;

        const manutencao =
            (exercito.infantaria || 0) * 2 +
            (exercito.tanques || 0) * 5 +
            (exercito.avioes || 0) * 10 +
            (exercito.navios || 0) * 20;

        db.set(`pais_${nomePais}.exercito.manutencao`, Math.floor(manutencao));

        const tesouro = pais.tesouro || 0;
        const eficienciaMilitar = 1 + nivelDefesa * 0.03;
        const custoFinal = Math.floor(manutencao / eficienciaMilitar);

        if (tesouro >= custoFinal) {
            db.subtract(`pais_${nomePais}.tesouro`, custoFinal);
            db.add(`pais_${nomePais}.gastos`, custoFinal);
        } else {
            const perdaInf = Math.floor((exercito.infantaria || 0) * (0.01 / (1 + nivelDefesa)));
            const perdaTan = Math.floor((exercito.tanques || 0) * (0.005 / (1 + nivelDefesa)));
            db.subtract(`pais_${nomePais}.exercito.infantaria`, perdaInf);
            db.subtract(`pais_${nomePais}.exercito.tanques`, perdaTan);
        }
    }

    atualizarAgricultura(nomePais, pais) {
        const agri = pais.agricultura || 0;
        if (agri <= 0) return;
        const nivel = pais.ministerios?.agricultura?.nivel || 0;
        const bonusMinisterio = 1 + nivel * 0.03;
        const prod = Math.floor(agri * 0.3 * bonusMinisterio);
        if (prod > 0) {
            db.add(`pais_${nomePais}.comida`, prod);
            db.add(`pais_${nomePais}.receita`, prod * 2);
            db.add(`pais_${nomePais}.tesouro`, prod);
        }
    }
    atualizarInflacao(nomePais, pais) {
        let inf = typeof pais.inflacao === 'number' ? pais.inflacao : 0.05;
        const nivelEco = pais.ministerios?.economia?.nivel || 0;
        inf -= nivelEco * 0.001;
        const gastos = pais.gastos || 0;
        const tesouro = pais.tesouro || 1;
        const agricultura = pais.agricultura || 0;
        const pib = pais.pib || 1;
        const imposto = pais.taxaImposto || 0.1;
        const industria = pais.construcoes?.industria?.nivel || pais.construcoes?.industria || 0;
        const fazendas = pais.construcoes?.fazenda?.nivel || pais.construcoes?.fazenda || 0;
        const usinas = pais.construcoes?.usina?.nivel || pais.construcoes?.usina || 0;
        const parqueEolico = pais.construcoes?.parque_eolico?.nivel || pais.construcoes?.parque_eolico || 0;
        const usinaSolar = pais.construcoes?.usina_solar?.nivel || pais.construcoes?.usina_solar || 0;
        const usinaNuclear = pais.construcoes?.usina_nuclear?.nivel || pais.construcoes?.usina_nuclear || 0;
        const usinaHidreletrica =
            pais.construcoes?.usina_hidreletrica?.nivel || pais.construcoes?.usina_hidreletrica || 0;

        const energiaRenovavel = parqueEolico + usinaSolar + usinaNuclear + usinaHidreletrica;

        const inflacaoAnterior = inf;

        const pressaoGastos = gastos / (tesouro + 1);
        inf += pressaoGastos * 0.01;
        if (tesouro > pib * 0.4) inf += 0.003;
        inf += industria * 0.0005;
        inf += imposto * 0.02;
        if (tesouro < 0) inf += 0.01;
        inf -= Math.log10(agricultura + 1) * 0.002;
        inf -= fazendas * 0.001;
        inf -= usinas * 0.001;
        inf -= energiaRenovavel * 0.001;
        if (pib > 100000) inf -= 0.002;
        const alvo = 0.03;
        inf += (alvo - inf) * 0.05;
        if (Math.abs(inf - inflacaoAnterior) > 0.05) inf = (inf + inflacaoAnterior) / 2;
        inf = Math.max(-0.05, Math.min(0.5, inf));
        inf = Number(inf.toFixed(4));
        db.set(`pais_${nomePais}.inflacao`, inf);
        db.set(`pais_${nomePais}.gastos`, 0);

        let ap = pais.aprovacaoPopular || 50;
        if (inf > 0.15) ap -= 3;
        else if (inf > 0.08) ap -= 1;
        else if (inf < 0.01) ap += 1;
        else if (inf < -0.02) ap -= 1;
        db.set(`pais_${nomePais}.aprovacaoPopular`, Math.max(0, Math.min(100, ap)));
    }

    atualizarCambio(nomePais, pais) {
        const tesouro = pais.tesouro || 0;
        const inf = pais.inflacao || 0.05;
        const exp = pais.exportacoes || 0;
        const imp = pais.importacoes || 0;
        const infra = pais.infraestrutura || 0;
        let val = pais.valorMoeda || 1.0;

        val = Math.max(
            0.0001,
            parseFloat(
                (
                    val +
                    (tesouro > 100000 ? 0.005 : tesouro > 10000 ? 0.002 : -0.002) +
                    -(inf * 0.03) +
                    (exp - imp > 0 ? 0.002 : -0.001) +
                    infra * 0.0005
                ).toFixed(6)
            )
        );

        db.set(`pais_${nomePais}.valorMoeda`, val);

        // ⚡ CORRIGIDO: Forçar histórico se estiver vazio
        let hist = pais.historicoCambio || [];
        if (hist.length === 0) {
            hist.push(val); // Adiciona o valor atual como primeiro registro
        }
        hist.push(val);
        if (hist.length > 10) hist.shift();
        db.set(`pais_${nomePais}.historicoCambio`, hist);
    }
    processarRotasComerciais(nomePais, pais) {
        const rotas = pais.rotasComerciais || [];
        for (const rota of rotas) {
            if ((pais.embargos || []).includes(rota.parceiro)) continue;
            const parceiro = db.get(`pais_${rota.parceiro}`);
            if (!parceiro || (parceiro.embargos || []).includes(nomePais)) continue;

            const exp = Math.floor(Math.random() * 400) + 100;
            const imp = Math.floor(Math.random() * 300) + 80;
            db.add(`pais_${nomePais}.tesouro`, exp - imp);
            db.add(`pais_${nomePais}.exportacoes`, exp);
            db.add(`pais_${nomePais}.importacoes`, imp);
            db.add(`pais_${nomePais}.receita`, exp);
            db.add(`pais_${nomePais}.gastos`, imp);
            db.add(`pais_${rota.parceiro}.tesouro`, imp);
            db.add(`pais_${rota.parceiro}.exportacoes`, imp);
        }
    }

    processarParlamento(nomePais, pais) {
        const parlamento = db.get(`parlamento_${nomePais}`) || {
            leisPendentes: [],
            leisAprovadas: [],
            leisVetadas: []
        };
        const pendentes = parlamento.leisPendentes || [];
        if (pendentes.length === 0) return;

        if (
            (pendentes.length > 0 && !pais.ultimoAvisoParlamento) ||
            Date.now() - (pais.ultimoAvisoParlamento || 0) > 5 * 60 * 1000
        ) {
            db.set(`pais_${nomePais}.ultimoAvisoParlamento`, Date.now());
            db.set(`pais_${nomePais}.parlamentoPendente`, pendentes.length);
            const noticia = {
                titulo: `📜 Parlamento Aguarda Decisão`,
                descricao: `**${pendentes.length}** lei(s) aguarda(m) sua votação no parlamento!\nUse \`B!ver-leis\` para revisar e \`B!aprovar-lei <id>\` ou \`B!vetar-lei <id>\` para decidir.`,
                tipo: 'lei',
                impacto: 'neutro',
                timestamp: Date.now(),
                pais: nomePais
            };
            this.adicionarNoticiaNacional(nomePais, noticia);
            this.enviarNoticiaCanal(nomePais, noticia);
        }

        for (const lei of pendentes) {
            if (Date.now() - lei.enviadaEm > 20 * 60 * 1000 && Math.random() < 0.3) {
                const senadores = Math.floor(Math.random() * 5) + 1;
                const noticia = {
                    titulo: `📢 Pressão Parlamentar`,
                    descricao: `**${senadores} senadores** de **${nomePais}** pedem uma decisão urgente sobre a lei **"${lei.titulo}"**.`,
                    tipo: 'lei',
                    impacto: 'neutro',
                    timestamp: Date.now(),
                    pais: nomePais
                };
                this.adicionarNoticiaNacional(nomePais, noticia);
                this.enviarNoticiaCanal(nomePais, noticia);
            }
        }
    }

    enviarSugestoesGoverno(nomePais, pais) {
        if (this.tickCount % 5 !== 0) return;
        const canalId = db.get(`canal_noticias_${nomePais}`);
        if (!canalId) return;
        const canal = this.client.channels.cache.get(canalId);
        if (!canal) return;

        const sugestoesAtivas = SUGESTOES_GOVERNO.filter((s) => s.condicao(pais));
        if (sugestoesAtivas.length === 0) return;

        const sug = sugestoesAtivas[Math.floor(Math.random() * sugestoesAtivas.length)];
        if (!sug || !sug.msg) return;

        const embed = new Discord.EmbedBuilder()
            .setTitle(sug.urgente ? '🚨 Alerta do Governo' : '💡 Sugestão do Governo')
            .setDescription(sug.msg)
            .setColor(sug.urgente ? 0xff0000 : 0xffff00)
            .setFooter({ text: 'Sistema de Assessoria Governamental • OneBot' })
            .setTimestamp();
        canal.send({ embeds: [embed] }).catch(() => {});
    }

    async npcIABasicoLegado(nomePais) {
        const pais = db.get(`pais_${nomePais}`);
        if (!pais) return;
        const { personalidade, tesouro, infraestrutura, agricultura } = pais;
        const exercito = pais.exercito || {};

        switch (personalidade) {
            case 'comercial':
            case 'industrial':
                if (tesouro > 10000 && Math.random() < 0.15) this._npcAbrirRota(nomePais, pais);
                if ((infraestrutura || 0) < 5 && tesouro > 20000 && Math.random() < 0.1) {
                    db.add(`pais_${nomePais}.infraestrutura`, 0.5);
                    db.subtract(`pais_${nomePais}.tesouro`, 5000);
                }
                break;
            case 'militar':
                if (tesouro > 20000 && Math.random() < 0.2) {
                    db.add(`pais_${nomePais}.exercito.tanques`, 5);
                    db.add(`pais_${nomePais}.exercito.avioes`, 2);
                    db.add(`pais_${nomePais}.exercito.manutencao`, 200);
                    db.subtract(`pais_${nomePais}.tesouro`, 8000);
                }
                if (tesouro > 50000 && Math.random() < 0.05) db.add(`pais_${nomePais}.bombasNucleares`, 1);
                break;
            case 'agricola':
                if (tesouro > 1000 && Math.random() < 0.3) {
                    db.add(`pais_${nomePais}.agricultura`, 50);
                    db.subtract(`pais_${nomePais}.tesouro`, 500);
                }
                break;
            case 'riqueza':
                if ((infraestrutura || 0) < 5 && tesouro > 50000 && Math.random() < 0.2) {
                    db.add(`pais_${nomePais}.infraestrutura`, 1);
                    db.subtract(`pais_${nomePais}.tesouro`, 15000);
                }
                break;
            case 'crescimento':
                if (tesouro > 5000 && Math.random() < 0.25) {
                    db.add(`pais_${nomePais}.populacao`, Math.floor((pais.populacao || 0) * 0.002));
                    db.subtract(`pais_${nomePais}.tesouro`, 1000);
                }
                break;
        }

        if ((exercito.infantaria || 0) < 5000 && tesouro > 3000 && Math.random() < 0.2) {
            db.add(`pais_${nomePais}.exercito.infantaria`, 500);
            db.subtract(`pais_${nomePais}.tesouro`, 500);
            db.add(`pais_${nomePais}.exercito.manutencao`, 25);
        }
    }

    async npcIA(nomePais) {
        const pais = db.get(`pais_${nomePais}`);
        if (!pais || !pais.isNPC) return;

        const { personalidade, tesouro, populacao } = pais;
        const exercito = pais.exercito || {};

        // 📊 ANÁLISE DA SITUAÇÃO
        const inflacao = pais.inflacao || 0.05;
        const comidaPorPessoa = (pais.comida || 0) / (populacao || 1);
        const saldoEnergetico = pais.saldoEnergetico || 0;
        const temEpidemia = pais.epidemia_ativa ? true : false;

        // 💰 ORÇAMENTO (10% do tesouro)
        const orcamento = Math.floor((tesouro || 0) * 0.1);
        if (orcamento <= 1000) return;

        // 🚨 PRIORIDADE 1: EPIDEMIA
        if (temEpidemia) {
            const hospitais = Number(pais.construcoes?.hospital?.nivel || pais.construcoes?.hospital || 0);
            if (hospitais < 100) {
                db.add(`pais_${nomePais}.construcoes.hospital.nivel`, 20);
                db.subtract(`pais_${nomePais}.tesouro`, Math.floor(orcamento * 0.7));
            }
            if ((pais.tesouro || 0) > 30000000 && !(pais.programas_saude || []).includes('vacinacao_massiva')) {
                db.subtract(`pais_${nomePais}.tesouro`, 30000000);
                const prog = pais.programas_saude || [];
                prog.push('vacinacao_massiva');
                db.set(`pais_${nomePais}.programas_saude`, prog);
            }
            return;
        }

        // 🚨 PRIORIDADE 2: FOME
        if (comidaPorPessoa < 0.5) {
            db.add(`pais_${nomePais}.agricultura`, 5000);
            db.add(`pais_${nomePais}.comida`, Math.floor(orcamento * 0.5));
            db.subtract(`pais_${nomePais}.tesouro`, Math.floor(orcamento * 0.6));
            return;
        }

        // 🚨 PRIORIDADE 3: ENERGIA
        if (saldoEnergetico < -100000) {
            const qtd = Math.max(5, Math.floor(orcamento / 80000));
            const nivelAtual = Number(pais.construcoes?.usina?.nivel || pais.construcoes?.usina || 0);
            db.set(`pais_${nomePais}.construcoes.usina.nivel`, nivelAtual + qtd);
            db.subtract(`pais_${nomePais}.tesouro`, Math.floor(orcamento * 0.8));
            return;
        }

        // 🚨 PRIORIDADE 4: INFLAÇÃO
        if (inflacao > 0.15) {
            const bancos = Number(pais.construcoes?.banco?.nivel || pais.construcoes?.banco || 0);
            db.set(`pais_${nomePais}.construcoes.banco.nivel`, bancos + 5);
            db.subtract(`pais_${nomePais}.inflacao`, 0.02);
            db.subtract(`pais_${nomePais}.tesouro`, Math.floor(orcamento * 0.5));
            return;
        }

        // 🎯 METAS POR PERSONALIDADE
        switch (personalidade) {
            case 'militar':
                db.add(`pais_${nomePais}.exercito.infantaria`, Math.floor((orcamento * 0.4) / 10));
                db.add(`pais_${nomePais}.exercito.tanques`, Math.floor((orcamento * 0.15) / 500));
                const q = Number(pais.construcoes?.quartel?.nivel || pais.construcoes?.quartel || 0);
                db.set(`pais_${nomePais}.construcoes.quartel.nivel`, q + 3);
                if ((pais.tesouro || 0) > 100000000 && (pais.bombasNucleares || 0) === 0) {
                    const tecs = pais.tecnologias || [];
                    if (!tecs.includes('fisica_nuclear')) {
                        tecs.push('fisica_nuclear');
                        db.set(`pais_${nomePais}.tecnologias`, tecs);
                    }
                }
                db.subtract(`pais_${nomePais}.tesouro`, Math.floor(orcamento * 0.8));
                break;

            case 'comercial':
            case 'industrial':
                const ind = Number(pais.construcoes?.industria?.nivel || pais.construcoes?.industria || 0);
                const usi = Number(pais.construcoes?.usina?.nivel || pais.construcoes?.usina || 0);
                db.set(`pais_${nomePais}.construcoes.industria.nivel`, ind + 5);
                db.set(`pais_${nomePais}.construcoes.usina.nivel`, usi + 3);
                db.add(`pais_${nomePais}.produtividade`, 0.01);
                if ((pais.rotasComerciais || []).length < 5 && Math.random() < 0.3) {
                    this._npcAbrirRota(nomePais, pais);
                }
                db.subtract(`pais_${nomePais}.tesouro`, Math.floor(orcamento * 0.7));
                break;

            case 'agricola':
                db.add(`pais_${nomePais}.agricultura`, Math.floor((orcamento * 0.5) / 2));
                db.add(`pais_${nomePais}.comida`, Math.floor(orcamento * 0.3));
                const faz = Number(pais.construcoes?.fazenda?.nivel || pais.construcoes?.fazenda || 0);
                db.set(`pais_${nomePais}.construcoes.fazenda.nivel`, faz + 10);
                db.subtract(`pais_${nomePais}.tesouro`, Math.floor(orcamento * 0.6));
                break;

            case 'riqueza':
                db.add(`pais_${nomePais}.tesouroNacional`, Math.floor(orcamento * 0.4));
                const ban = Number(pais.construcoes?.banco?.nivel || pais.construcoes?.banco || 0);
                db.set(`pais_${nomePais}.construcoes.banco.nivel`, ban + 10);
                db.subtract(`pais_${nomePais}.inflacao`, 0.01);
                db.subtract(`pais_${nomePais}.tesouro`, Math.floor(orcamento * 0.5));
                break;

            case 'crescimento':
                db.add(`pais_${nomePais}.populacao`, Math.floor((orcamento * 0.4) / 10));
                db.add(`pais_${nomePais}.comida`, Math.floor(orcamento * 0.25));
                const hos = Number(pais.construcoes?.hospital?.nivel || pais.construcoes?.hospital || 0);
                db.set(`pais_${nomePais}.construcoes.hospital.nivel`, hos + 5);
                db.subtract(`pais_${nomePais}.tesouro`, Math.floor(orcamento * 0.7));
                break;

            default:
                db.add(`pais_${nomePais}.exercito.infantaria`, Math.floor((orcamento * 0.25) / 10));
                const ind2 = Number(pais.construcoes?.industria?.nivel || pais.construcoes?.industria || 0);
                db.set(`pais_${nomePais}.construcoes.industria.nivel`, ind2 + 2);
                db.add(`pais_${nomePais}.agricultura`, Math.floor((orcamento * 0.25) / 2));
                db.add(`pais_${nomePais}.comida`, Math.floor(orcamento * 0.25));
                db.subtract(`pais_${nomePais}.tesouro`, Math.floor(orcamento * 0.8));
        }
    }

    _npcAbrirRota(nomePais, pais) {
        const lista = db.get('lista_paises') || [];
        const rotas = pais.rotasComerciais || [];
        const rotasExistentes = rotas.map((r) => r.parceiro);
        const embargos = pais.embargos || [];
        const potenciais = lista.filter((p) => p !== nomePais && !rotasExistentes.includes(p) && !embargos.includes(p));
        if (potenciais.length === 0) return;
        const parceiro = potenciais[Math.floor(Math.random() * potenciais.length)];
        const parceiroDB = db.get(`pais_${parceiro}`);
        if (!parceiroDB || (parceiroDB.embargos || []).includes(nomePais)) return;
        rotas.push({ parceiro, tipo: 'bilateral', abertaEm: Date.now() });
        db.set(`pais_${nomePais}.rotasComerciais`, rotas);
        const rotasParceiro = parceiroDB.rotasComerciais || [];
        if (!rotasParceiro.find((r) => r.parceiro === nomePais)) {
            rotasParceiro.push({ parceiro: nomePais, tipo: 'bilateral', abertaEm: Date.now() });
            db.set(`pais_${parceiro}.rotasComerciais`, rotasParceiro);
        }
    }

    async geopoliticaNPCLegado(listaPaises) {
        const npcs = listaPaises.filter((p) => NPC_ATIVOS.includes(p));
        const jogadores = listaPaises.filter((p) => {
            const pais = db.get(`pais_${p}`);
            return pais && !pais.isNPC;
        });
        if (jogadores.length === 0) return;

        for (const npcNome of npcs) {
            if (Math.random() > 0.25) continue;
            const npc = db.get(`pais_${npcNome}`);
            if (!npc) continue;

            const alvoNome = jogadores[Math.floor(Math.random() * jogadores.length)];

            // ⚡ CORREÇÃO: Não enviar proposta do NPC para ele mesmo
            if (alvoNome === npcNome) continue;

            const alvo = db.get(`pais_${alvoNome}`);
            if (!alvo) continue;

            // ⚡ CORREÇÃO ADICIONAL: Verificar se NPC não está enviando para si mesmo
            if (npcNome === alvoNome) {
                console.log(`[PaisEngine] ERRO: NPC ${npcNome} tentou enviar proposta para si mesmo!`);
                continue;
            }

            const canalAlvo = db.get(`canal_noticias_${alvoNome}`);
            if (!canalAlvo) continue;

            const rotasExistentes = (npc.rotasComerciais || []).map((r) => r.parceiro);
            const embargos = npc.embargos || [];
            if (embargos.includes(alvoNome)) continue;

            let tipoProposta;
            const p = npc.personalidade;
            if (!rotasExistentes.includes(alvoNome) && Math.random() < 0.5) {
                tipoProposta = 'rota_comercial';
            } else if (p === 'militar' && Math.random() < 0.3) {
                tipoProposta = 'alianca_militar';
            } else if (p === 'agricola' && Math.random() < 0.3) {
                tipoProposta = 'acordo_agricola';
            } else if (p === 'riqueza' && (npc.tesouro || 0) > 100000 && Math.random() < 0.2) {
                tipoProposta = 'acordo_financeiro';
            } else if (Math.random() < 0.15) {
                const rep = db.get(`pais_${alvoNome}.reputacaoDiplomatica`) || 50;
                if (rep < 30) continue;
                tipoProposta = 'acordo_cientifico';
            }

            if (!tipoProposta) continue;

            const termos = { descricao: '' };
            if (tipoProposta === 'acordo_financeiro') {
                termos.valorEnviado = Math.floor((npc.tesouro || 0) * 0.05);
                termos.descricao = `Empréstimo de **${termos.valorEnviado.toLocaleString('pt-BR')}** moedas com retorno em colaborações futuras.`;
            } else if (tipoProposta === 'rota_comercial') {
                termos.descricao = `Abertura de rota comercial bilateral, gerando renda passiva a cada ciclo para ambos os países.`;
            } else if (tipoProposta === 'alianca_militar') {
                termos.descricao = `Pacto de defesa mútua: em caso de ataque, o aliado intervirá militarmente.`;
            } else {
                termos.descricao = `Acordo de cooperação em ${TIPOS_PROPOSTA[tipoProposta]?.label || tipoProposta}.`;
            }

            // ⚡ VERIFICAÇÃO FINAL antes de criar proposta
            if (npcNome === alvoNome) {
                console.log(`[PaisEngine] BLOQUEADO: ${npcNome} tentou enviar proposta para si mesmo!`);
                continue;
            }

            const proposta = criarProposta(npcNome, alvoNome, tipoProposta, termos);
            await enviarPropostaComBotao(this.client, proposta);

            const dadosNPC = getDadosPais(npcNome);
            const noticia = {
                titulo: `📬 Proposta Diplomática`,
                descricao: `**${dadosNPC ? dadosNPC.nomeFormal : npcNome}** enviou uma proposta de **${TIPOS_PROPOSTA[tipoProposta]?.label}** para você!`,
                tipo: 'comercio',
                impacto: 'positivo',
                timestamp: Date.now(),
                pais: alvoNome
            };
            this.aplicarContextoDiplomatico(noticia, alvoNome);
            this.adicionarNoticiaNacional(alvoNome, noticia);
        }
    }
    async geopoliticaNPC(listaPaises) {
        const npcs = listaPaises.filter((p) => NPC_ATIVOS.includes(p));
        const jogadores = listaPaises.filter((p) => {
            const pais = db.get(`pais_${p}`);
            return pais && !pais.isNPC;
        });

        // NPCs propõem para JOGADORES e OUTROS NPCs
        for (const npcNome of npcs) {
            if (Math.random() > 0.25) continue;
            const npc = db.get(`pais_${npcNome}`);
            if (!npc) continue;

            const candidatos = [...new Set([...jogadores, ...npcs])].filter((nome) => nome !== npcNome);
            const alvoNome = this._escolherAlvoNPC(npcNome, npc, candidatos);

            if (!alvoNome) continue;

            const alvo = db.get(`pais_${alvoNome}`);
            if (!alvo) continue;

            // ⚡ VERIFICAR SE JÁ TEM PROPOSTA PENDENTE (EVITA REPETIR)
            const propostasAlvo = db.get(`propostas_${alvoNome}`) || [];
            const jaTemProposta = propostasAlvo.some((p) => p.remetente === npcNome && p.status === 'pendente');
            if (jaTemProposta) continue;

            // ⚡ VERIFICAR SE JÁ TEM ALIANÇA OU ROTA (não oferecer o que já existe)
            const temAlianca = (alvo.aliancas || []).includes(npcNome);
            const temRota = (alvo.rotasComerciais || []).some((r) => r.parceiro === npcNome);
            const embargos = npc.embargos || [];
            if (embargos.includes(alvoNome)) continue;

            // Escolher tipo de proposta
            let tipoProposta;
            const p = npc.personalidade;

            if (!temRota && Math.random() < 0.5) {
                tipoProposta = 'rota_comercial';
            } else if (!temAlianca && p === 'militar' && Math.random() < 0.3) {
                tipoProposta = 'alianca_militar';
            } else if (p === 'agricola' && Math.random() < 0.3) {
                tipoProposta = 'acordo_agricola';
            } else if (p === 'riqueza' && (npc.tesouro || 0) > 100000 && Math.random() < 0.2) {
                tipoProposta = 'acordo_financeiro';
            } else if (Math.random() < 0.3) {
                const rep = db.get(`pais_${alvoNome}.reputacaoDiplomatica`) || 50;
                if (rep >= 30) tipoProposta = 'acordo_cientifico';
            }

            if (!tipoProposta) continue;

            const termos = { descricao: '' };
            if (tipoProposta === 'acordo_financeiro') {
                termos.valorEnviado = Math.floor((npc.tesouro || 0) * 0.05);
                termos.descricao = `Empréstimo de **${termos.valorEnviado.toLocaleString('pt-BR')}** moedas.`;
            } else if (tipoProposta === 'rota_comercial') {
                termos.descricao = `Rota comercial bilateral entre ${npcNome} e ${alvoNome}.`;
            } else if (tipoProposta === 'alianca_militar') {
                termos.descricao = `Pacto de defesa mútua.`;
            } else {
                termos.descricao = `Acordo de cooperação em ${TIPOS_PROPOSTA[tipoProposta]?.label || tipoProposta}.`;
            }

            const proposta = criarProposta(npcNome, alvoNome, tipoProposta, termos);
            await enviarPropostaComBotao(this.client, proposta);

            const dadosNPC = getDadosPais(npcNome);
            const dadosAlvo = getDadosPais(alvoNome);
            const noticia = {
                titulo: `📬 Proposta Diplomática`,
                descricao: `**${dadosNPC ? dadosNPC.nomeFormal : npcNome}** enviou uma proposta de **${TIPOS_PROPOSTA[tipoProposta]?.label}** para **${dadosAlvo ? dadosAlvo.nomeFormal : alvoNome}**!`,
                tipo: 'comercio',
                impacto: 'positivo',
                timestamp: Date.now(),
                pais: alvoNome
            };
            this.aplicarContextoDiplomatico(noticia, alvoNome);
            this.adicionarNoticiaNacional(alvoNome, noticia);
        }
    }

    _escolherAlvoNPC(nomeNPC, npc, candidatos) {
        const avaliados = candidatos
            .map((nome) => {
                const alvo = db.get(`pais_${nome}`);
                if (!alvo || (npc.embargos || []).includes(nome)) return null;

                const reputacao = Number(alvo.reputacaoDiplomatica) || 50;
                const poderNPC = this._poderMilitarPais(npc);
                const poderAlvo = this._poderMilitarPais(alvo);
                const razaoMilitar = poderNPC / Math.max(1, poderAlvo);
                const temRota = (npc.rotasComerciais || []).some((rota) => rota.parceiro === nome);
                const temAlianca = (npc.aliancas || []).includes(nome);
                const estaEmGuerra = (db.get('guerras_ativas') || []).some(
                    (guerra) =>
                        (guerra.atacante === nomeNPC && guerra.defensor === nome) ||
                        (guerra.defensor === nomeNPC && guerra.atacante === nome)
                );

                let pontuacao = reputacao / 10;
                if (temRota || temAlianca || estaEmGuerra) pontuacao -= 100;
                if (npc.personalidade === 'militar') pontuacao += Math.min(20, razaoMilitar * 5);
                if (npc.personalidade === 'comercial' || npc.personalidade === 'riqueza') {
                    pontuacao += Math.min(25, Number(alvo.pib || alvo.tesouro || 0) / 100000);
                }
                if (npc.personalidade === 'agricola') {
                    pontuacao += Math.max(0, 10 - Number(alvo.comida || 0) / Math.max(1, Number(alvo.populacao || 1)));
                }

                return { nome, pontuacao };
            })
            .filter(Boolean)
            .sort((a, b) => b.pontuacao - a.pontuacao);

        return avaliados[0]?.nome || null;
    }

    _poderMilitarPais(pais) {
        const exercito = pais.exercito || {};
        return (
            Number(exercito.infantaria || 0) +
            Number(exercito.tanques || 0) * 10 +
            Number(exercito.avioes || 0) * 15 +
            Number(exercito.navios || 0) * 12
        );
    }
    gerarNoticiaGlobal(listaPaises) {
        if (!listaPaises.length) return;

        // ⚡ 40% de chance de evento IMPACTANTE (com efeitos reais)
        if (Math.random() < 0.4) {
            const nomePais = listaPaises[Math.floor(Math.random() * listaPaises.length)];
            const { gerarEventoImpactante } = require('./news-templates');
            const noticia = gerarEventoImpactante(nomePais);
            noticia.pais = nomePais;
            this.aplicarContextoDiplomatico(noticia, nomePais);
            this.adicionarNoticiaGlobal(noticia);
            this.adicionarNoticiaNacional(nomePais, noticia); // ⚡ Adiciona notícia nacional também!
            return;
        }

        // 60% notícia normal (sistema antigo)
        const nomePais = listaPaises[Math.floor(Math.random() * listaPaises.length)];
        const outros = listaPaises.filter((p) => p !== nomePais);
        const pais2 = outros.length ? outros[Math.floor(Math.random() * outros.length)] : null;
        const d1 = getDadosPais(nomePais),
            d2 = pais2 ? getDadosPais(pais2) : null;
        const noticia = gerarNoticia(d1 ? d1.nomeFormal : nomePais, d2 ? d2.nomeFormal : pais2);
        noticia.pais = nomePais;
        this.aplicarContextoDiplomatico(noticia, nomePais);
        this.adicionarNoticiaGlobal(noticia);
        this.adicionarNoticiaNacional(nomePais, noticia); // ⚡ Adiciona notícia nacional também!
    }

    processarEleicoes(listaPaises) {
        for (const nomePais of listaPaises) {
            const pais = db.get(`pais_${nomePais}`);
            if (!pais || pais.isNPC) continue;
            if (pais.mandatoExpiraEm && new Date(pais.mandatoExpiraEm) <= new Date()) {
                const dados = getDadosPais(nomePais);
                db.set(`pais_${nomePais}.isNPC`, true);
                db.set(`pais_${nomePais}.governador`, null);
                const noticia = {
                    titulo: `🗳️ Mandato Expirado`,
                    descricao: `O mandato expirou em **${dados ? dados.nomeFormal : nomePais}**. País retornou ao controle da IA.`,
                    tipo: 'eleicao',
                    impacto: 'neutro',
                    timestamp: Date.now(),
                    pais: nomePais
                };
                this.adicionarNoticiaGlobal(noticia);
                this.adicionarNoticiaNacional(nomePais, noticia);
                this.enviarNoticiaCanal(nomePais, noticia);
            }
        }
    }

    aplicarContextoDiplomatico(noticia, nomePais) {
        const rep = db.get(`pais_${nomePais}.reputacaoDiplomatica`) || 50;
        let prefixo = '';
        let sufixo = '';
        if (rep >= 75) prefixo = '🤝 Clima diplomático favorável: ';
        if (rep <= 30) prefixo = '⚠️ Tensão diplomática crescente: ';
        if ((db.get(`pais_${nomePais}.embargos`) || []).length > 0) sufixo = '\n🚫 Sanções internacionais em vigor.';
        noticia.descricao = prefixo + noticia.descricao + sufixo;
        return noticia;
    }

    adicionarNoticiaGlobal(noticia) {
        let n = db.get('noticias_globais') || [];
        n.unshift(noticia);
        if (n.length > 50) n = n.slice(0, 50);
        db.set('noticias_globais', n);
        const canalId = db.get('canal_noticias_globais');
        if (canalId) {
            const c = this.client.channels.cache.get(canalId);
            if (c) this._enviarEmbed(c, noticia, '🌍 Notícias Internacionais');
        }
    }

    adicionarNoticiaNacional(nomePais, noticia) {
        // 💡 BUSCA O PAÍS DIRETO DO SEU ADAPTADOR ATUAL
        const pais = db.get(`pais_${nomePais}`);

        // 🚫 SE FOR NPC, NÃO GUARDA O HISTÓRICO EM MEMÓRIA/BANCO!
        // Isso poupa o crescimento do cache e evita que o documento estoure o limite do Firestore.
        if (pais && pais.isNPC) {
            return;
        }

        // Se for um país de jogador real (isNPC === false), mantém a lógica original de guardar as 30 últimas
        let n = db.get(`noticias_${nomePais}`) || [];
        n.unshift(noticia);
        if (n.length > 30) n = n.slice(0, 30);
        db.set(`noticias_${nomePais}`, n);
    }

    enviarNoticiaCanal(nomePais, noticia) {
        const canalId = db.get(`canal_noticias_${nomePais}`);
        if (!canalId) return;
        const canal = this.client.channels.cache.get(canalId);
        if (!canal) return;
        const dados = getDadosPais(nomePais);
        this._enviarEmbed(canal, noticia, `${dados ? dados.bandeira + ' ' : ''}${dados ? dados.nomeFormal : nomePais}`);
    }

    _enviarEmbed(canal, noticia, rodape) {
        const E = {
            positivo: '📈',
            negativo: '📉',
            neutro: '📰',
            tenso: '⚠️',
            governo: '🏛️',
            lei: '📜',
            eleicao: '🗳️',
            militar: '⚔️',
            desastre: '🆘',
            comercio: '🚢'
        };
        const C = {
            positivo: 0x00ff00,
            negativo: 0xff0000,
            neutro: 0x0000ff,
            tenso: 0xffd700,
            governo: 0x800080,
            lei: 0xffa500,
            eleicao: 0xffd700,
            militar: 0x8b0000,
            desastre: 0xff8c00,
            comercio: 0x00ffff
        };
        const embed = new Discord.EmbedBuilder()
            .setTitle(`${E[noticia.tipo] || E[noticia.impacto] || '📰'} ${noticia.titulo}`)
            .setDescription(noticia.descricao)
            .setColor(C[noticia.tipo] || C[noticia.impacto] || '')
            .setFooter({ text: `📰 ${rodape} • OneBot` })
            .setTimestamp(noticia.timestamp);
        canal.send({ embeds: [embed] }).catch(() => {});
    }

    publicarNoticiaGlobal(n) {
        this.adicionarNoticiaGlobal(n);
    }

    publicarNoticiaNacional(nomePais, n) {
        this.adicionarNoticiaNacional(nomePais, n);
        this.enviarNoticiaCanal(nomePais, n);
    }

    atualizarReputacao(nomePais, valor, motivo = '') {
        const atual = db.get(`pais_${nomePais}.reputacaoDiplomatica`) || 50;
        const nova = Math.max(0, Math.min(100, atual + valor));
        db.set(`pais_${nomePais}.reputacaoDiplomatica`, nova);
        const hist = db.get(`pais_${nomePais}.historicoDiplomatico`) || [];
        hist.unshift({ valor, motivo, timestamp: Date.now() });
        if (hist.length > 20) hist.pop();
        db.set(`pais_${nomePais}.historicoDiplomatico`, hist);
    }
    async processarRespostasNPC() {
        const listaPaises = db.get('lista_paises') || [];

        for (const npcNome of NPC_ATIVOS) {
            const npc = db.get(`pais_${npcNome}`);
            if (!npc || !npc.isNPC) continue;

            const propostasRecebidas = db.get(`propostas_${npcNome}`) || [];
            const pendentes = propostasRecebidas.filter(
                (p) => p.status === 'pendente' && p.expiraEm > Date.now() && Date.now() - p.criadaEm > 30000 // Espera 30s antes de responder
            );

            for (const proposta of pendentes) {
                const remetente = proposta.remetente || proposta.de;
                if (!remetente) continue;

                const chanceAceitar = this.calcularChanceAceitacao(npc, proposta, remetente);

                if (Math.random() < chanceAceitar) {
                    // ACEITAR
                    proposta.status = 'aceita';
                    db.set(`propostas_${npcNome}`, propostasRecebidas);

                    // Aplicar efeitos
                    this.aplicarEfeitosPropostaNPC(npcNome, remetente, proposta);

                    // Notícia global
                    const dadosNPC = getDadosPais(npcNome);
                    const dadosRem = getDadosPais(remetente);
                    const noticia = {
                        titulo: `🤝 Acordo Internacional`,
                        descricao: `**${dadosNPC ? dadosNPC.nomeFormal : npcNome}** aceitou a proposta de **${TIPOS_PROPOSTA[proposta.tipo]?.label || proposta.tipo}** de **${dadosRem ? dadosRem.nomeFormal : remetente}**!`,
                        tipo: 'comercio',
                        impacto: 'positivo',
                        timestamp: Date.now(),
                        pais: npcNome
                    };
                    this.adicionarNoticiaGlobal(noticia);

                    // Notificar remetente
                    this.publicarNoticiaNacional(remetente, {
                        titulo: `✅ Proposta Aceita!`,
                        descricao: `**${dadosNPC ? dadosNPC.nomeFormal : npcNome}** aceitou sua proposta de **${TIPOS_PROPOSTA[proposta.tipo]?.label || proposta.tipo}**!`,
                        tipo: 'comercio',
                        impacto: 'positivo',
                        timestamp: Date.now(),
                        pais: remetente
                    });
                } else {
                    // RECUSAR
                    proposta.status = 'recusada';
                    db.set(`propostas_${npcNome}`, propostasRecebidas);

                    // Penalidade de reputação
                    this.atualizarReputacao(remetente, -3, `Proposta recusada por ${npcNome}`);

                    const dadosNPC = getDadosPais(npcNome);
                    this.publicarNoticiaNacional(remetente, {
                        titulo: `❌ Proposta Recusada`,
                        descricao: `**${dadosNPC ? dadosNPC.nomeFormal : npcNome}** recusou sua proposta de **${TIPOS_PROPOSTA[proposta.tipo]?.label || proposta.tipo}**.`,
                        tipo: 'comercio',
                        impacto: 'negativo',
                        timestamp: Date.now(),
                        pais: remetente
                    });
                }
            }
        }
    }

    calcularChanceAceitacao(npc, proposta, remetente) {
        let chance = 0.3; // Chance base 30%

        const repRemetente = db.get(`pais_${remetente}.reputacaoDiplomatica`) || 50;
        const repNPC = npc.reputacaoDiplomatica || 50;

        // Reputação do remetente influencia
        chance += (repRemetente - 50) * 0.005; // +25% se rep 100, -25% se rep 0

        // Reputação do NPC influencia
        chance += (repNPC - 50) * 0.003;

        // Tipo de proposta influencia
        switch (proposta.tipo) {
            case 'alianca_militar':
                chance -= 0.15; // Mais difícil
                if (npc.personalidade === 'militar') chance += 0.3;
                break;
            case 'rota_comercial':
                chance += 0.1; // Mais fácil
                if (npc.personalidade === 'comercial' || npc.personalidade === 'industrial') chance += 0.2;
                break;
            case 'acordo_financeiro':
                if (npc.personalidade === 'riqueza') chance += 0.25;
                break;
            case 'tratado_paz':
                chance += 0.2; // Quase sempre aceito
                break;
            case 'alianca_militar':
                chance -= 0.1;
                break;
        }

        // Verificar se já tem aliança/rota
        const aliancas = npc.aliancas || [];
        if (aliancas.includes(remetente)) chance += 0.2; // Já são aliados

        const embargos = npc.embargos || [];
        if (embargos.includes(remetente)) chance -= 0.5; // Quase impossível

        // Verificar personalidade do NPC
        if (npc.personalidade === 'militar' && proposta.tipo === 'alianca_militar') chance += 0.2;
        if (npc.personalidade === 'comercial' && proposta.tipo === 'rota_comercial') chance += 0.15;

        return Math.max(0.05, Math.min(0.95, chance)); // Mínimo 5%, máximo 95%
    }

    aplicarEfeitosPropostaNPC(destinatario, remetente, proposta) {
        const { tipo, termos } = proposta;

        switch (tipo) {
            case 'rota_comercial':
                const rotasRem = db.get(`pais_${remetente}.rotasComerciais`) || [];
                const rotasDest = db.get(`pais_${destinatario}.rotasComerciais`) || [];
                if (!rotasRem.find((r) => r.parceiro === destinatario)) {
                    rotasRem.push({ parceiro: destinatario, tipo: 'bilateral', abertaEm: Date.now() });
                }
                if (!rotasDest.find((r) => r.parceiro === remetente)) {
                    rotasDest.push({ parceiro: remetente, tipo: 'bilateral', abertaEm: Date.now() });
                }
                db.set(`pais_${remetente}.rotasComerciais`, rotasRem);
                db.set(`pais_${destinatario}.rotasComerciais`, rotasDest);
                break;

            case 'alianca_militar':
                let alRem = db.get(`pais_${remetente}.aliancas`) || [];
                let alDest = db.get(`pais_${destinatario}.aliancas`) || [];
                if (!alRem.includes(destinatario)) alRem.push(destinatario);
                if (!alDest.includes(remetente)) alDest.push(remetente);
                db.set(`pais_${remetente}.aliancas`, alRem);
                db.set(`pais_${destinatario}.aliancas`, alDest);
                break;

            case 'acordo_agricola':
                db.add(`pais_${remetente}.agricultura`, 500);
                db.add(`pais_${destinatario}.agricultura`, 500);
                db.add(`pais_${remetente}.comida`, 2000);
                db.add(`pais_${destinatario}.comida`, 2000);
                break;

            case 'acordo_financeiro':
                const valor = termos?.valorEnviado || 1000;
                if ((db.get(`pais_${remetente}.tesouro`) || 0) >= valor) {
                    db.subtract(`pais_${remetente}.tesouro`, valor);
                    db.add(`pais_${destinatario}.tesouro`, valor);
                }
                break;

            case 'tratado_paz':
                let embRem = db.get(`pais_${remetente}.embargos`) || [];
                let embDest = db.get(`pais_${destinatario}.embargos`) || [];
                embRem = embRem.filter((e) => e !== destinatario);
                embDest = embDest.filter((e) => e !== remetente);
                db.set(`pais_${remetente}.embargos`, embRem);
                db.set(`pais_${destinatario}.embargos`, embDest);
                break;

            case 'acordo_cientifico':
                db.add(`pais_${remetente}.infraestrutura`, 0.5);
                db.add(`pais_${destinatario}.infraestrutura`, 0.5);
                break;
        }

        // Melhorar reputação de ambos
        this.atualizarReputacao(remetente, +5, `Acordo firmado com ${destinatario}`);
        this.atualizarReputacao(destinatario, +3, `Acordo firmado com ${remetente}`);
    }

    // ⚡ NOVA FUNÇÃO: Processar tributos de fantoches
    processarTributosFantoches(nomePais, pais) {
        const listaPaises = db.get('lista_paises') || [];

        for (const fantocheNome of listaPaises) {
            const fantoche = db.get(`pais_${fantocheNome}`);
            if (!fantoche) continue;

            // Verificar se é um país anexado
            if (fantoche.anexadoPor || fantoche.status === 'integrado') {
                db.delete(`pais_${fantocheNome}.controladoPor`);
                db.delete(`pais_${fantocheNome}.governoFantoche`);
                db.delete(`pais_${fantocheNome}.tributoPara`);
                db.delete(`pais_${fantocheNome}.tributo`);
                continue;
            }

            // Verificar se é fantoche deste país
            if (fantoche.controladoPor !== nomePais && !(fantoche.governoFantoche && fantoche.tributoPara === nomePais))
                continue;

            const tributo = fantoche.tributo || 0.15;
            const tesouroFantoche = fantoche.tesouro || 0;
            const valorTributo = Math.floor(tesouroFantoche * tributo);

            if (valorTributo > 0) {
                db.subtract(`pais_${fantocheNome}.tesouro`, valorTributo);
                db.add(`pais_${nomePais}.tesouro`, valorTributo);

                // Notícia a cada ciclo

                const dadosFantoche = getDadosPais(fantocheNome);
                const nomeFantoche = dadosFantoche ? dadosFantoche.nomeFormal : fantocheNome;

                const noticia = {
                    titulo: `💸 Tributo Colonial Recebido`,
                    descricao: `**${pais.nomeFormal || nomePais}** recebeu **${valorTributo.toLocaleString('pt-BR')}** moedas em tributos de **${nomeFantoche}**.`,
                    tipo: 'governo',
                    impacto: 'positivo',
                    timestamp: Date.now(),
                    pais: nomePais
                };
                this.adicionarNoticiaNacional(nomePais, noticia);
            }
        }
    }

    // ⚡ NOVA FUNÇÃO: Processar tensão colonial
    processarTensaoColonial(nomePais, pais) {
        if (pais.isNPC) return;
        if (!pais.governoFantoche && !pais.controladoPor) return;

        const tensao = pais.tensaoColonial || 0;
        const tributo = (pais.tributo || 0.15) * 100;

        // Tensão aumenta naturalmente se tributo é alto
        if (tributo > 20) {
            db.add(`pais_${nomePais}.tensaoColonial`, 0.5);
        } else if (tributo > 10) {
            db.add(`pais_${nomePais}.tensaoColonial`, 0.2);
        }

        // Se tensão > 80%, chance de revolta
        if (tensao > 80 && Math.random() < 0.1) {
            this.iniciarRevoltaFantoche(nomePais, pais);
        }
        const tensaoAtual = db.get(`pais_${nomePais}.tensaoColonial`) || 0;
        if (tensaoAtual > 100) {
            db.set(`pais_${nomePais}.tensaoColonial`, 100);
        }

        // Se tensão > 50%, sabotagem econômica
        if (tensao > 50 && Math.random() < 0.05) {
            const perda = Math.floor((pais.tesouro || 0) * 0.05);
            db.subtract(`pais_${nomePais}.tesouro`, perda);

            const noticia = {
                titulo: `⚠️ Sabotagem em Território!`,
                descricao: `Grupos de resistência em **${pais.nomeFormal || nomePais}** realizaram sabotagem! Perda de ${perda.toLocaleString('pt-BR')} moedas. Tensão: ${tensao.toFixed(1)}%`,
                tipo: 'militar',
                impacto: 'negativo',
                timestamp: Date.now(),
                pais: nomePais
            };
            this.adicionarNoticiaGlobal(noticia);
        }
    }

    // ⚡ NOVA FUNÇÃO: Revolta no fantoche
    iniciarRevoltaFantoche(nomePais, pais) {
        const controlador = pais.controladoPor || pais.tributoPara;
        if (!controlador) return;

        const dadosFantoche = getDadosPais(nomePais);
        const nomeFantoche = dadosFantoche ? dadosFantoche.nomeFormal : nomePais;
        const dadosControlador = getDadosPais(controlador);
        const nomeControlador = dadosControlador ? dadosControlador.nomeFormal : controlador;

        // Chance de sucesso da revolta baseada no exército do fantoche vs controlador
        const exercitoFantoche = pais.exercito || {};
        const poderFantoche = (exercitoFantoche.infantaria || 0) * 1 + (exercitoFantoche.tanques || 0) * 10;

        const controladorData = db.get(`pais_${controlador}`);
        const exercitoControlador = controladorData?.exercito || {};
        const poderControlador = (exercitoControlador.infantaria || 0) * 1 + (exercitoControlador.tanques || 0) * 10;

        const revoltaSucesso = poderFantoche > poderControlador * 0.3; // 30% do poder já tem chance

        if (revoltaSucesso) {
            // Independência!
            db.delete(`pais_${nomePais}.governoFantoche`);
            db.delete(`pais_${nomePais}.controladoPor`);
            db.delete(`pais_${nomePais}.nomeFantoche`);
            db.delete(`pais_${nomePais}.tributo`);
            db.delete(`pais_${nomePais}.tributoPara`);
            db.delete(`pais_${nomePais}.tensaoColonial`);
            db.delete(`pais_${nomePais}.ultimatoAceito`);
            db.set(`pais_${nomePais}.status`, 'independente');
            db.set(`pais_${nomePais}.isNPC`, true);

            // Penalidade para o controlador
            db.subtract(`pais_${controlador}.reputacaoDiplomatica`, 20);

            const noticia = {
                titulo: `🏴 Revolta Vitoriosa!`,
                descricao: `**${nomeFantoche}** declarou independência de **${nomeControlador}** após revolta popular! A comunidade internacional reconhece o novo governo.`,
                tipo: 'militar',
                impacto: 'negativo',
                timestamp: Date.now(),
                pais: nomePais
            };
            this.adicionarNoticiaGlobal(noticia);
            this.adicionarNoticiaNacional(controlador, noticia);
            this.adicionarNoticiaNacional(nomePais, noticia);
        } else {
            // Revolta suprimida
            db.set(`pais_${nomePais}.tensaoColonial`, Math.max(0, (pais.tensaoColonial || 80) - 40));
            db.subtract(`pais_${nomePais}.populacao`, Math.floor((pais.populacao || 0) * 0.03));
            db.subtract(`pais_${nomePais}.exercito.infantaria`, Math.floor((exercitoFantoche.infantaria || 0) * 0.3));

            const noticia = {
                titulo: `⚔️ Revolta Suprimida!`,
                descricao: `**${nomeControlador}** suprimiu uma revolta em **${nomeFantoche}**. A resistência foi contida com força militar.`,
                tipo: 'militar',
                impacto: 'neutro',
                timestamp: Date.now(),
                pais: controlador
            };
            this.adicionarNoticiaGlobal(noticia);
            this.adicionarNoticiaNacional(controlador, noticia);
        }
    }

    // ⚡ NOVA FUNÇÃO: Gerar notícias sobre fantoches
    gerarNoticiasFantoches(listaPaises) {
        const imperios = [];

        // Encontrar todos os países que têm fantoches
        for (const nome of listaPaises) {
            const pais = db.get(`pais_${nome}`);
            if (!pais || pais.isNPC) continue;

            const fantoches = [];
            for (const fnome of listaPaises) {
                const f = db.get(`pais_${fnome}`);
                if (f && (f.controladoPor === nome || (f.governoFantoche && f.tributoPara === nome))) {
                    fantoches.push({ nome: fnome, dados: f });
                }
            }

            if (fantoches.length > 0) {
                imperios.push({ nome, pais, fantoches });
            }
        }

        if (imperios.length === 0) return;

        // Escolher um império aleatório para noticiar
        const imperio = imperios[Math.floor(Math.random() * imperios.length)];
        const fantoche = imperio.fantoches[Math.floor(Math.random() * imperio.fantoches.length)];

        const dadosImperio = getDadosPais(imperio.nome);
        const nomeImperio = dadosImperio ? dadosImperio.nomeFormal : imperio.nome;
        const dadosFantoche = getDadosPais(fantoche.nome);
        const nomeFantoche = dadosFantoche ? dadosFantoche.nomeFormal : fantoche.nome;

        const tipoNoticia = Math.random();
        let noticia = {};

        if (tipoNoticia < 0.3 && (fantoche.dados.tensaoColonial || 0) > 40) {
            // Tensão/protestos
            noticia = {
                titulo: `⚠️ Tensão em Território Dominado`,
                descricao: `Protestos eclodiram em **${nomeFantoche}** contra o domínio de **${nomeImperio}**. A população local exige melhores condições. Tensão: ${(fantoche.dados.tensaoColonial || 0).toFixed(1)}%`,
                tipo: 'social',
                impacto: 'negativo',
                timestamp: Date.now(),
                pais: imperio.nome
            };
        } else if (tipoNoticia < 0.5) {
            // Sucesso econômico
            const tributo = (fantoche.dados.tributo || 0.15) * 100;
            const valorEstimado = Math.floor((fantoche.dados.tesouro || 0) * (fantoche.dados.tributo || 0.15));

            noticia = {
                titulo: `💰 Sucesso Econômico Imperial`,
                descricao: `**${nomeImperio}** continua se beneficiando economicamente de **${nomeFantoche}**. O tributo de ${tributo}% gerou aproximadamente ${valorEstimado.toLocaleString('pt-BR')} moedas neste ciclo.`,
                tipo: 'economia',
                impacto: 'positivo',
                timestamp: Date.now(),
                pais: imperio.nome
            };
        } else if (tipoNoticia < 0.7) {
            // Discurso internacional
            const tensao = fantoche.dados.tensaoColonial || 0;
            const opiniao = tensao > 50 ? 'condenam' : tensao > 30 ? 'questionam' : 'observam com cautela';

            noticia = {
                titulo: `🌍 Comunidade Internacional ${opiniao}`,
                descricao: `Líderes mundiais ${opiniao} a administração de **${nomeImperio}** sobre **${nomeFantoche}**. Organizações de direitos humanos pedem relatórios sobre as condições da população.`,
                tipo: 'comercio',
                impacto: tensao > 50 ? 'negativo' : 'neutro',
                timestamp: Date.now(),
                pais: imperio.nome
            };
        } else {
            // Desenvolvimento
            noticia = {
                titulo: `🏗️ Desenvolvimento em Território`,
                descricao: `Indicadores econômicos mostram que **${nomeFantoche}**, sob administração de **${nomeImperio}**, apresenta sinais de desenvolvimento em infraestrutura e comércio.`,
                tipo: 'economia',
                impacto: 'positivo',
                timestamp: Date.now(),
                pais: imperio.nome
            };
        }

        this.adicionarNoticiaGlobal(noticia);
        this.adicionarNoticiaNacional(imperio.nome, noticia);
        this.adicionarNoticiaNacional(fantoche.nome, noticia);
    }

    // ⚡ NOVA FUNÇÃO: Processar pesquisas tecnológicas
    processarPesquisas(nomePais, pais) {
        const pesquisaAtual = pais.pesquisaAtual;
        if (!pesquisaAtual) return;

        const tec = TECNOLOGIAS[pesquisaAtual.tecnologia];
        if (!tec) {
            db.delete(`pais_${nomePais}.pesquisaAtual`);
            return;
        }

        // ⚡ CORREÇÃO: Ler DIRETO do banco de dados!
        const laboratorios = Number(
            db.get(`pais_${nomePais}.construcoes.laboratorio.nivel`) ||
                db.get(`pais_${nomePais}.construcoes.laboratorio`) ||
                0
        );

        const centrosPesquisa = Number(
            db.get(`pais_${nomePais}.construcoes.centro_pesquisa.nivel`) ||
                db.get(`pais_${nomePais}.construcoes.centro_pesquisa`) ||
                0
        );

        // Velocidade com CAP de 20x
        const velocidade = Math.min(20, 1 + laboratorios * 0.1 + centrosPesquisa * 0.2);

        pesquisaAtual.progresso = (pesquisaAtual.progresso || 0) + velocidade;
        db.set(`pais_${nomePais}.pesquisaAtual`, pesquisaAtual);

        console.log(
            `[Pesquisa] ${nomePais}: ${pesquisaAtual.progresso}/${pesquisaAtual.total} | Labs: ${laboratorios} | Velocidade: ${velocidade}x`
        );

        if (pesquisaAtual.progresso >= pesquisaAtual.total) {
            // Concluída!
            const tecnologias = pais.tecnologias || [];

            if (!tecnologias.includes(pesquisaAtual.tecnologia)) {
                tecnologias.push(pesquisaAtual.tecnologia);
                db.set(`pais_${nomePais}.tecnologias`, tecnologias);
            }

            db.delete(`pais_${nomePais}.pesquisaAtual`);

            if (tec.bonus) {
                for (const [key, value] of Object.entries(tec.bonus)) {
                    const atual = db.get(`pais_${nomePais}.bonus_${key}`) || 1;
                    db.set(`pais_${nomePais}.bonus_${key}`, atual * value);
                }
            }

            const dados = getDadosPais(nomePais);
            const noticia = {
                titulo: `${tec.emoji} Pesquisa Concluída!`,
                descricao: `**${dados ? dados.nomeFormal : nomePais}** concluiu a pesquisa: **${tec.nome}**!\n📋 ${tec.descricao}`,
                tipo: 'governo',
                impacto: 'positivo',
                timestamp: Date.now(),
                pais: nomePais
            };
            this.adicionarNoticiaNacional(nomePais, noticia);
            this.adicionarNoticiaGlobal(noticia);

            console.log(`[Pesquisa] ✅ ${nomePais} concluiu: ${tec.nome}`);
        }
    }

    processarProgramaNuclear(nomePais, pais) {
        // Processar enriquecimento de urânio
        const enriquecendo = pais.enriquecendo_uranio;
        if (enriquecendo) {
            enriquecendo.progresso = (enriquecendo.progresso || 0) + 1;

            if (enriquecendo.progresso >= enriquecendo.total) {
                db.add(`pais_${nomePais}.uranio_enriquecido`, enriquecendo.quantidade);
                db.delete(`pais_${nomePais}.enriquecendo_uranio`);

                // ⚡ SUBSTITUA a notícia de enriquecimento por:
                const noticia = {
                    titulo: '⚛️ Enriquecimento de Urânio Concluído!',
                    descricao:
                        `**${pais.nomeFormal || nomePais}** concluiu o processo de enriquecimento nuclear!\n\n` +
                        `📦 **${enriquecendo.quantidade.toLocaleString('pt-BR')}** unidades de urânio enriquecido prontas para uso.\n` +
                        `🔬 Disponível para produção de ogivas ou usinas nucleares.\n\n` +
                        `⚠️ *Autoridades reforçam protocolos de segurança.*`,
                    tipo: 'governo',
                    impacto: 'neutro',
                    timestamp: Date.now(),
                    pais: nomePais
                };
                this.adicionarNoticiaNacional(nomePais, noticia);
            } else {
                db.set(`pais_${nomePais}.enriquecendo_uranio`, enriquecendo);
            }
        }

        // Processar produção de ogivas
        const produzindo = pais.produzindo_ogiva;
        if (produzindo) {
            produzindo.progresso = (produzindo.progresso || 0) + 1;

            if (produzindo.progresso >= produzindo.total) {
                // ⚡ Dentro de processarProgramaNuclear, onde produzindo.progresso >= produzindo.total:
                db.add(`pais_${nomePais}.arsenal_nuclear.${produzindo.tipo}`, 1);
                db.add(`pais_${nomePais}.bombasNucleares`, 1);
                db.delete(`pais_${nomePais}.produzindo_ogiva`);

                const ogivasTotal = (pais.bombasNucleares || 0) + 1;
                const noticia = {
                    titulo: '💣 Nova Ogiva Nuclear!',
                    descricao: `**${pais.nomeFormal || nomePais}** concluiu a produção de uma ogiva nuclear. Arsenal atual: **${ogivasTotal} ogivas**.`,
                    tipo: 'militar',
                    impacto: 'negativo',
                    timestamp: Date.now(),
                    pais: nomePais
                };
                this.adicionarNoticiaNacional(nomePais, noticia);
                this.adicionarNoticiaGlobal(noticia);
            } else {
                db.set(`pais_${nomePais}.produzindo_ogiva`, produzindo);
            }
        }

        // Verificar acidentes em usinas nucleares
        const usinas = Number(pais.construcoes?.usina_nuclear?.nivel || pais.construcoes?.usina_nuclear || 0);
        if (usinas > 0 && Math.random() < usinas * 0.001) {
            const populacaoAfetada = Math.floor((pais.populacao || 0) * 0.05);
            const mortes = Math.floor(populacaoAfetada * 0.3);
            const feridos = populacaoAfetada - mortes;

            db.subtract(`pais_${nomePais}.populacao`, mortes);
            db.subtract(`pais_${nomePais}.reputacaoDiplomatica`, 30);
            db.subtract(`pais_${nomePais}.construcoes.usina_nuclear.nivel`, 1);
            db.subtract(`pais_${nomePais}.aprovacaoPopular`, 20);
            db.add(`pais_${nomePais}.inflacao`, 0.05);

            const noticia = {
                titulo: '☢️ ACIDENTE NUCLEAR GRAVE!',
                descricao:
                    `**${pais.nomeFormal || nomePais}** sofreu um grave acidente nuclear!\n\n` +
                    `💀 **Mortos:** ${mortes.toLocaleString('pt-BR')}\n` +
                    `🤕 **Feridos/Expulsos:** ${feridos.toLocaleString('pt-BR')}\n` +
                    `👥 **Total Afetados:** ${populacaoAfetada.toLocaleString('pt-BR')}\n` +
                    `🏭 **Usina danificada:** -1 nível\n` +
                    `🌍 **Reputação:** -30\n` +
                    `😊 **Aprovação:** -20%\n` +
                    `📈 **Inflação:** +5%\n\n` +
                    `A área ao redor da usina foi evacuada. Comunidade internacional oferece ajuda humanitária.`,
                tipo: 'desastre',
                impacto: 'negativo',
                timestamp: Date.now(),
                pais: nomePais
            };

            this.aplicarConsequenciasReais(nomePais, pais, 'grave', mortes, feridos, populacaoAfetada);
            this.adicionarNoticiaGlobal(noticia);
            this.adicionarNoticiaNacional(nomePais, noticia);
        }
    }

    atualizarAprovacaoPopular(nomePais, pais) {
        const populacao = pais.populacao || 1;
        const comida = pais.comida || 0;
        const tesouro = pais.tesouro || 0;
        const inflacao = pais.inflacao || 0.05;
        const infraestrutura = pais.infraestrutura || 0;
        const exercito = pais.exercito?.infantaria || 0;
        const saldoEnergetico = pais.saldoEnergetico || 0;
        const consumoEnergetico = pais.consumoEnergetico || 1;
        const bombas =
            (pais.arsenal_nuclear?.ogiva_base || 0) +
            (pais.arsenal_nuclear?.ogiva_avancada || 0) +
            (pais.arsenal_nuclear?.ogiva_hidrogenio || 0);
        const tensao = pais.tensaoColonial || 0;
        const emGuerra = (db.get('guerras_ativas') || []).some(
            (g) => g.atacante === nomePais || g.defensor === nomePais
        );

        // ⚡ PARTE DO VALOR ATUAL (memória da gestão)
        let aprovacao = pais.aprovacaoPopular || 50;

        // 📊 FATORES DE MUDANÇA (ajustes pequenos por ciclo)
        let ajuste = 0;

        // 🍞 ALIMENTAÇÃO
        const comidaPorPessoa = comida / populacao;
        if (comidaPorPessoa < 0.1)
            ajuste -= 3; // Fome severa = perda rápida
        else if (comidaPorPessoa < 0.5)
            ajuste -= 1; // Escassez = perda lenta
        else if (comidaPorPessoa > 2) ajuste += 0.5; // Abundância = ganho lento

        // ⚡ ENERGIA
        const porcentagemDeficit = saldoEnergetico < 0 ? Math.abs(saldoEnergetico) / consumoEnergetico : 0;
        if (porcentagemDeficit > 0.5)
            ajuste -= 2; // Apagão severo
        else if (porcentagemDeficit > 0.1)
            ajuste -= 0.5; // Apagão leve
        else if (saldoEnergetico > 0) ajuste += 0.3; // Energia estável

        // 💰 ECONOMIA
        if (inflacao > 0.15)
            ajuste -= 2; // Hiperinflação
        else if (inflacao > 0.08)
            ajuste -= 0.5; // Inflação alta
        else if (inflacao < 0.02) ajuste += 0.3; // Estável

        // 🏗️ INFRAESTRUTURA (efeito gradual)
        if (infraestrutura > 5) ajuste += 0.3;
        else if (infraestrutura < 2) ajuste -= 0.3;

        // ⚔️ GUERRA (impacto IMEDIATO e FORTE)
        if (emGuerra && !pais.emGuerra) {
            ajuste -= 10; // Primeira notícia da guerra
            db.set(`pais_${nomePais}.emGuerra`, true);
        } else if (emGuerra) {
            ajuste -= 1; // Desgaste contínuo
        } else if (pais.emGuerra) {
            ajuste += 5; // Paz = alívio
            db.set(`pais_${nomePais}.emGuerra`, false);
        }

        // 🪖 SEGURANÇA
        const soldadosPorHabitante = exercito / populacao;
        if (soldadosPorHabitante < 0.001) ajuste -= 0.3;
        else if (soldadosPorHabitante > 0.05) ajuste += 0.2;

        // ☢️ NUCLEAR
        if (bombas > 100) ajuste -= 0.5;
        else if (bombas > 0 && bombas <= 10) ajuste += 0.3;

        // EVENTOS PONTUAIS (impacto forte, uma vez)
        if (pais.ultimoAcidenteNuclear && Date.now() - pais.ultimoAcidenteNuclear < 5 * 60 * 1000) {
            if (!pais.penalizouAcidente) {
                ajuste -= 20;
                db.set(`pais_${nomePais}.penalizouAcidente`, true);
            }
        }

        // 🏆 CONQUISTAS (impacto positivo forte)
        if (pais.ultimaVitoria && Date.now() - pais.ultimaVitoria < 5 * 60 * 1000) {
            if (!pais.bonusVitoria) {
                ajuste += 8;
                db.set(`pais_${nomePais}.bonusVitoria`, true);
            }
        }

        // Limpar flags após 5 minutos
        if (
            pais.penalizouAcidente &&
            (!pais.ultimoAcidenteNuclear || Date.now() - pais.ultimoAcidenteNuclear > 5 * 60 * 1000)
        ) {
            db.set(`pais_${nomePais}.penalizouAcidente`, false);
        }
        if (pais.bonusVitoria && (!pais.ultimaVitoria || Date.now() - pais.ultimaVitoria > 5 * 60 * 1000)) {
            db.set(`pais_${nomePais}.bonusVitoria`, false);
        }

        // ⚡ APLICAR AJUSTE (limitado a +-5 por ciclo para evitar disparos)
        ajuste = Math.max(-5, Math.min(5, ajuste));
        aprovacao += ajuste;

        // 🔒 Limites finais
        aprovacao = Math.max(5, Math.min(95, Math.floor(aprovacao)));

        db.set(`pais_${nomePais}.aprovacaoPopular`, aprovacao);

        // 📰 NOTÍCIAS
        if (Math.abs(ajuste) >= 3) {
            const dados = getDadosPais(nomePais);
            const noticia = {
                titulo: ajuste > 0 ? '📈 Aprovação Popular em Alta' : '📉 Aprovação em Queda',
                descricao: `O governo de **${dados ? dados.nomeFormal : nomePais}** ${ajuste > 0 ? 'ganhou' : 'perdeu'} **${Math.abs(ajuste)}%** de aprovação.\n📊 Aprovação atual: **${aprovacao}%**`,
                tipo: 'social',
                impacto: ajuste > 0 ? 'positivo' : 'negativo',
                timestamp: Date.now(),
                pais: nomePais
            };
            this.adicionarNoticiaNacional(nomePais, noticia);
        }

        // 🚨 CRISES
        if (aprovacao <= 20 && (pais.aprovacaoPopular || 50) > 20) {
            const dados = getDadosPais(nomePais);
            const noticia = {
                titulo: '🚨 Crise de Governo!',
                descricao: `**${dados ? dados.nomeFormal : nomePais}** atinge apenas **${aprovacao}%** de aprovação! Risco de instabilidade política.`,
                tipo: 'social',
                impacto: 'negativo',
                timestamp: Date.now(),
                pais: nomePais
            };
            this.adicionarNoticiaNacional(nomePais, noticia);
            this.adicionarNoticiaGlobal(noticia);
        }
    }

    // ⚡ FUNÇÃO: Verificar acidentes nucleares
    verificarAcidenteNuclear(nomePais, pais) {
        const arsenal = pais.arsenal_nuclear || {};
        const usinas = Number(pais.construcoes?.usina_nuclear?.nivel || pais.construcoes?.usina_nuclear || 0);
        const enriquecendo = pais.enriquecendo_uranio || null;
        const produzindo = pais.produzindo_ogiva || null;
        const uranioEnriquecido = Number(pais.uranio_enriquecido) || 0;

        let riscoBase = 0;
        riscoBase += usinas * 0.001;
        riscoBase += (uranioEnriquecido / 100000) * 0.01;
        if (enriquecendo) riscoBase += 0.005;
        if (produzindo) riscoBase += 0.003;
        const ogivasH = arsenal.ogiva_hidrogenio || 0;
        riscoBase += ogivasH * 0.005;

        // ⚡ Risco por falta de funcionários
        if (usinas > 0) {
            const funcionarios = pais.funcionarios_nucleares || 0;
            const funcionariosNecessarios = usinas * 500;
            const defict = Math.max(0, funcionariosNecessarios - funcionarios);
            if (defict > 0) {
                riscoBase += (defict / funcionariosNecessarios) * 0.01;
            }
        }

        // ⚡ Redução por protocolos e treinamento
        const protocolos = pais.protocolos_seguranca || 0;
        const treinamento = pais.treinamento_nuclear || 0;
        const fatorReducao = Math.max(0.1, 1 - protocolos * 0.05 - treinamento * 0.02);
        riscoBase *= fatorReducao;
        if (Math.random() < riscoBase) {
            const gravidade = Math.random();
            let tipoAcidente;
            if (gravidade < 0.05) tipoAcidente = 'catastrofico';
            else if (gravidade < 0.25) tipoAcidente = 'grave';
            else tipoAcidente = 'incidente';

            this.aplicarAcidenteNuclear(nomePais, pais, tipoAcidente);
            // ⚡ ADICIONE ESTA LINHA:
            const mortos = Math.floor(
                (pais.populacao || 0) *
                    (tipoAcidente === 'catastrofico' ? 0.03 : tipoAcidente === 'grave' ? 0.015 : 0.0001)
            );
            const feridos = Math.floor(
                (pais.populacao || 0) *
                    (tipoAcidente === 'catastrofico' ? 0.08 : tipoAcidente === 'grave' ? 0.04 : 0.002)
            );
            const evacuados = Math.floor(
                (pais.populacao || 0) *
                    (tipoAcidente === 'catastrofico' ? 0.15 : tipoAcidente === 'grave' ? 0.05 : 0.005)
            );
            this.aplicarConsequenciasReais(nomePais, pais, tipoAcidente, mortos, feridos, evacuados);
        }
    }

    // ⚡ FUNÇÃO: Aplicar consequências do acidente nuclear
    aplicarAcidenteNuclear(nomePais, pais, tipoAcidente) {
        const populacao = pais.populacao || 1;
        let mortos, feridos, evacuados, custoLimpeza, danoReputacao, danoInfra, aumentaInflacao;
        let gravidadeNome, areaAfetada, hospitaisSobrecarregados;

        if (tipoAcidente === 'catastrofico') {
            gravidadeNome = '☢️☢️☢️ CATASTRÓFICO (Nível 7 - INES)';
            mortos = Math.floor(populacao * 0.03);
            feridos = Math.floor(populacao * 0.08);
            evacuados = Math.floor(populacao * 0.15);
            custoLimpeza = Math.floor((pais.tesouro || 0) * 0.2);
            danoReputacao = 50;
            danoInfra = 3;
            aumentaInflacao = 0.15;
            areaAfetada = '500 km² - Zona de Exclusão';
            hospitaisSobrecarregados = true;
        } else if (tipoAcidente === 'grave') {
            gravidadeNome = '☢️☢️ GRAVE (Nível 5-6 - INES)';
            mortos = Math.floor(populacao * 0.005);
            feridos = Math.floor(populacao * 0.02);
            evacuados = Math.floor(populacao * 0.05);
            custoLimpeza = Math.floor((pais.tesouro || 0) * 0.05);
            danoReputacao = 25;
            danoInfra = 1;
            aumentaInflacao = 0.08;
            areaAfetada = '50 km² - Evacuação';
            hospitaisSobrecarregados = true;
        } else {
            gravidadeNome = '☢️ INCIDENTE (Nível 3-4 - INES)';
            mortos = Math.floor(populacao * 0.0001);
            feridos = Math.floor(populacao * 0.002);
            evacuados = Math.floor(populacao * 0.005);
            custoLimpeza = Math.floor((pais.tesouro || 0) * 0.01);
            danoReputacao = 10;
            danoInfra = 0.3;
            aumentaInflacao = 0.03;
            areaAfetada = '5 km² - Monitoramento';
            hospitaisSobrecarregados = false;
        }

        db.subtract(`pais_${nomePais}.populacao`, mortos + evacuados);
        db.subtract(`pais_${nomePais}.tesouro`, custoLimpeza);
        db.subtract(`pais_${nomePais}.reputacaoDiplomatica`, danoReputacao);
        db.subtract(`pais_${nomePais}.infraestrutura`, danoInfra);
        db.add(`pais_${nomePais}.inflacao`, aumentaInflacao);
        db.subtract(`pais_${nomePais}.aprovacaoPopular`, danoReputacao * 0.5);

        if (tipoAcidente === 'catastrofico' || tipoAcidente === 'grave') {
            const usinasAtual = Number(pais.construcoes?.usina_nuclear?.nivel || pais.construcoes?.usina_nuclear || 0);
            if (usinasAtual > 0) {
                db.subtract(`pais_${nomePais}.construcoes.usina_nuclear.nivel`, 1);
            }
        }

        const dados = getDadosPais(nomePais);
        const noticia = {
            titulo: `☢️ ACIDENTE NUCLEAR ${tipoAcidente.toUpperCase()}!`,
            descricao:
                `**${dados ? dados.nomeFormal : nomePais}** sofreu um acidente nuclear **${gravidadeNome}**!\n\n` +
                `💀 Mortos: ${mortos.toLocaleString('pt-BR')}\n` +
                `🤕 Feridos: ${feridos.toLocaleString('pt-BR')}\n` +
                `🚶 Evacuados: ${evacuados.toLocaleString('pt-BR')}\n` +
                `🏥 Hospitais: ${hospitaisSobrecarregados ? '🔴 SOBRECARREGADOS!' : '🟡 Alerta'}\n` +
                `📐 Área: ${areaAfetada}\n` +
                `💰 Limpeza: ${custoLimpeza.toLocaleString('pt-BR')} moedas\n` +
                `🌍 Reputação: -${danoReputacao}\n` +
                `${hospitaisSobrecarregados ? '🚨 EMERGÊNCIA NACIONAL! Hospitais lotados!\n' : ''}`,
            tipo: 'desastre',
            impacto: 'negativo',
            timestamp: Date.now(),
            pais: nomePais
        };
        this.adicionarNoticiaGlobal(noticia);
        this.adicionarNoticiaNacional(nomePais, noticia);
        // ⚡ CONSEQUÊNCIAS REAIS DO ACIDENTE
        this.aplicarConsequenciasReais(nomePais, pais, tipoAcidente, mortos, feridos, evacuados);
    }

    // ⚡ SISTEMA ENERGÉTICO REALISTA
    consumirEnergia(nomePais, pais) {
        const construcoes = pais.construcoes || {};
        const infraestrutura = pais.infraestrutura || 0;
        const populacao = pais.populacao || 0;
        const exercito = pais.exercito || {};

        // Função auxiliar para ler nível de construção
        function getNivel(key) {
            const val = construcoes[key];
            if (typeof val === 'object' && val !== null) return Number(val.nivel) || 0;
            return Number(val) || 0;
        }

        // ================= PRODUÇÃO DE ENERGIA =================
        const usinasNucleares = getNivel('usina_nuclear');
        const usinasTermicas = getNivel('usina');
        const hidreletricas = getNivel('hidreletrica');
        const eolicas = getNivel('parque_eolico');
        const solares = getNivel('solar');

        // Fatores climáticos (variam por ciclo)
        const fatorVento = 0.4 + Math.random() * 1.2;
        const fatorSol = 0.3 + Math.random() * 1.4;
        const fatorHidro = 0.6 + Math.random() * 0.8;

        const producaoNuclear = usinasNucleares * 5000;
        const producaoTermica = usinasTermicas * 500;
        const producaoHidro = Math.floor(hidreletricas * 800 * fatorHidro);
        const producaoEolica = Math.floor(eolicas * 300 * fatorVento);
        const producaoSolar = Math.floor(solares * 400 * fatorSol);

        const producaoTotal = producaoNuclear + producaoTermica + producaoHidro + producaoEolica + producaoSolar;

        // ================= CONSUMO DE ENERGIA (VALORES REALISTAS) =================
        let consumoTotal = 0;

        // 🏠 CONSUMO RESIDENCIAL (1 MW por 1000 habitantes)
        const consumoResidencial = Math.floor(populacao * (0.001 + infraestrutura * 0.0005));
        consumoTotal += consumoResidencial;

        // 🌃 ILUMINAÇÃO PÚBLICA
        const consumoIluminacao = Math.floor(populacao * (0.0005 + infraestrutura * 0.0002));
        consumoTotal += consumoIluminacao;

        // 📡 COMUNICAÇÕES
        const consumoComunicacoes = Math.floor(populacao * infraestrutura * 0.0001);
        consumoTotal += consumoComunicacoes;

        // 🏗️ MANUTENÇÃO DA INFRAESTRUTURA
        const consumoInfra = Math.floor(infraestrutura * 100);
        consumoTotal += consumoInfra;

        // 🏭 CONSUMO INDUSTRIAL (CADA CONSTRUÇÃO CONSOME)
        const construcoesConsumo = {
            industria: 50,
            laboratorio: 10,
            centro_pesquisa: 20,
            mineradora: 40,
            refinaria: 60,
            siderurgica: 80,
            banco: 10,
            hospital: 15,
            universidade: 15,
            escola: 5,
            centro_espacial: 200,
            satelite: 30,
            quartel: 20,
            base_aerea: 40,
            porto_militar: 35,
            fazenda: 5,
            hidreletrica: 5,
            parque_eolico: 3,
            solar: 2,
            usina_nuclear: 10,
            usina: 8,
            fabrica_drones: 50
        };

        let consumoIndustrial = 0;
        for (const [key, consumoBase] of Object.entries(construcoesConsumo)) {
            const nivel = getNivel(key);
            consumoIndustrial += nivel * consumoBase;
        }
        consumoTotal += consumoIndustrial;

        // 🪖 CONSUMO MILITAR
        const tropasTotal =
            (exercito.infantaria || 0) +
            (exercito.tanques || 0) * 3 +
            (exercito.avioes || 0) * 8 +
            (exercito.navios || 0) * 12;

        const consumoMilitar = Math.floor(
            tropasTotal * 0.0005 +
                getNivel('quartel') * 50 +
                getNivel('base_aerea') * 80 +
                getNivel('porto_militar') * 60
        );
        consumoTotal += consumoMilitar;

        // ================= BALANÇO ENERGÉTICO =================
        const saldo = producaoTotal - consumoTotal;
        const saldoAnterior = pais.saldoEnergetico || 0;

        db.set(`pais_${nomePais}.producaoEnergetica`, producaoTotal);
        db.set(`pais_${nomePais}.consumoEnergetico`, consumoTotal);
        db.set(`pais_${nomePais}.saldoEnergetico`, saldo);

        // ================= EFEITOS =================
        if (saldo < 0) {
            const deficit = Math.abs(saldo);
            const porcentagemDeficit = Math.min(1, deficit / (consumoTotal || 1));

            const perdaProdutividade = porcentagemDeficit * 0.02;
            const perdaAprovacao = Math.floor(porcentagemDeficit * 15);
            const aumentoInflacao = porcentagemDeficit * 0.03;

            db.subtract(`pais_${nomePais}.produtividade`, perdaProdutividade);
            db.subtract(`pais_${nomePais}.aprovacaoPopular`, perdaAprovacao);
            db.add(`pais_${nomePais}.inflacao`, aumentoInflacao);

            if (porcentagemDeficit > 0.3 && saldoAnterior >= 0) {
                const dados = getDadosPais(nomePais);
                const noticia = {
                    titulo: '⚡ Apagão Nacional!',
                    descricao:
                        `**${dados ? dados.nomeFormal : nomePais}** sofreu um apagão nacional!\n\n` +
                        `🔌 Déficit: **${deficit.toLocaleString('pt-BR')} MW** (${(porcentagemDeficit * 100).toFixed(0)}%)\n` +
                        `🏭 Indústrias paradas: -${(perdaProdutividade * 100).toFixed(1)}% produtividade\n` +
                        `😡 População: -${perdaAprovacao}% aprovação\n` +
                        `📈 Inflação: +${(aumentoInflacao * 100).toFixed(1)}%\n\n` +
                        `*Hospitais em geradores, semáforos apagados, caos no trânsito.*`,
                    tipo: 'desastre',
                    impacto: 'negativo',
                    timestamp: Date.now(),
                    pais: nomePais
                };
                this.adicionarNoticiaNacional(nomePais, noticia);
                if (porcentagemDeficit > 0.5) this.adicionarNoticiaGlobal(noticia);
            }
        } else if (saldo > consumoTotal * 0.2) {
            db.add(`pais_${nomePais}.produtividade`, 0.002);
            if (saldo > consumoTotal * 0.5) {
                db.add(`pais_${nomePais}.aprovacaoPopular`, 2);
            }
        }
    }

    // 🍞 CONSUMIR COMIDA POR CICLO
    consumirComida(nomePais, pais) {
        const populacao = pais.populacao || 0;
        const exercito = pais.exercito || {};
        const tropasTotal =
            (exercito.infantaria || 0) +
            (exercito.tanques || 0) * 2 +
            (exercito.avioes || 0) * 3 +
            (exercito.navios || 0) * 5;

        const consumoTotal = Math.floor(populacao * 0.01 + tropasTotal * 0.5);
        const comidaAtual = pais.comida || 0;

        if (comidaAtual >= consumoTotal) {
            db.subtract(`pais_${nomePais}.comida`, consumoTotal);
        } else {
            const falta = consumoTotal - comidaAtual;
            db.set(`pais_${nomePais}.comida`, 0);

            const mortos = Math.floor(falta * 0.1);
            if (mortos > 0) {
                db.subtract(`pais_${nomePais}.populacao`, mortos);
                db.subtract(`pais_${nomePais}.aprovacaoPopular`, 5);

                if (mortos > populacao * 0.001) {
                    const dados = getDadosPais(nomePais);
                    const noticia = {
                        titulo: '🍞 Crise de Fome!',
                        descricao: `**${dados ? dados.nomeFormal : nomePais}** enfrenta escassez de alimentos! ${mortos.toLocaleString('pt-BR')} mortos por fome neste ciclo.`,
                        tipo: 'desastre',
                        impacto: 'negativo',
                        timestamp: Date.now(),
                        pais: nomePais
                    };
                    this.adicionarNoticiaNacional(nomePais, noticia);
                }
            }
        }
    }
    // ⚡ PAGAR SALÁRIOS DOS FUNCIONÁRIOS NUCLEARES
    pagarSalariosNucleares(nomePais, pais) {
        const funcionarios = pais.funcionarios_nucleares || 0;
        if (funcionarios <= 0) return;

        const inflacao = pais.inflacao || 0.05;
        const fatorInflacao = 1 + inflacao * 5;
        const salarios = Math.floor(funcionarios * 15000 * fatorInflacao);
        const tesouro = pais.tesouro || 0;

        if (tesouro >= salarios) {
            // Paga normalmente
            db.subtract(`pais_${nomePais}.tesouro`, salarios);
            db.add(`pais_${nomePais}.gastos`, salarios);
        } else {
            // Não consegue pagar = demissões em massa!
            const demissoes = Math.floor(funcionarios * 0.15); // 15% pedem demissão
            if (demissoes > 0) {
                db.subtract(`pais_${nomePais}.funcionarios_nucleares`, demissoes);
                db.subtract(`pais_${nomePais}.aprovacaoPopular`, 3);

                const dados = getDadosPais(nomePais);
                const noticia = {
                    titulo: '👋 Crise no Setor Nuclear!',
                    descricao: `**${dados ? dados.nomeFormal : nomePais}** não conseguiu pagar os salários de **${funcionarios.toLocaleString('pt-BR')}** funcionários nucleares. **${demissoes.toLocaleString('pt-BR')}** pediram demissão!`,
                    tipo: 'social',
                    impacto: 'negativo',
                    timestamp: Date.now(),
                    pais: nomePais
                };
                this.adicionarNoticiaNacional(nomePais, noticia);
            }
        }
    }

    // ⚡ CONSEQUÊNCIAS REAIS DO ACIDENTE NUCLEAR
    aplicarConsequenciasReais(nomePais, pais, tipoAcidente, mortos, feridos, evacuados) {
        const dados = getDadosPais(nomePais);
        const nome = dados ? dados.nomeFormal : nomePais;

        // 🏥 HOSPITAIS LOTADOS
        const hospitais = Number(pais.construcoes?.hospital?.nivel || pais.construcoes?.hospital || 0);
        const capacidadeHospitais = hospitais * 1000; // Cada hospital atende 1000 pessoas
        const deficitLeitos = Math.max(0, feridos - capacidadeHospitais);

        if (deficitLeitos > 0) {
            // Mortes por falta de atendimento
            const mortesAdicionais = Math.floor(deficitLeitos * 0.3); // 30% dos sem leito morrem
            db.subtract(`pais_${nomePais}.populacao`, mortesAdicionais);
            db.subtract(`pais_${nomePais}.aprovacaoPopular`, 10);

            const noticiaHospital = {
                titulo: '🏥 Colapso Hospitalar!',
                descricao:
                    `Hospitais de **${nome}** estão LOTADOS após o acidente nuclear!\n\n` +
                    `🏥 Capacidade: **${capacidadeHospitais.toLocaleString('pt-BR')}** leitos\n` +
                    `🤕 Feridos: **${feridos.toLocaleString('pt-BR')}**\n` +
                    `❌ Déficit: **${deficitLeitos.toLocaleString('pt-BR')}** leitos\n` +
                    `💀 Mortes por falta de atendimento: **${mortesAdicionais.toLocaleString('pt-BR')}**\n\n` +
                    `*"Pessoas morrendo nos corredores, falta de médicos, caos total!"*`,
                tipo: 'desastre',
                impacto: 'negativo',
                timestamp: Date.now(),
                pais: nomePais
            };
            this.adicionarNoticiaNacional(nomePais, noticiaHospital);
            this.adicionarNoticiaGlobal(noticiaHospital);
        }

        // 🚑 EVACUAÇÃO EM MASSA
        if (evacuados > 1000000) {
            const noticiaEvacuacao = {
                titulo: '🚨 Evacuação em Massa!',
                descricao:
                    `**${evacuados.toLocaleString('pt-BR')}** pessoas foram evacuadas às pressas da área do acidente nuclear em **${nome}**.\n\n` +
                    `🏚️ Cidades inteiras abandonadas\n` +
                    `🛣️ Estradas congestionadas por quilômetros\n` +
                    `🏕️ Acampamentos improvisados\n\n` +
                    `*"Cenas de guerra. Pessoas deixando tudo para trás."*`,
                tipo: 'desastre',
                impacto: 'negativo',
                timestamp: Date.now(),
                pais: nomePais
            };
            this.adicionarNoticiaNacional(nomePais, noticiaEvacuacao);
            this.adicionarNoticiaGlobal(noticiaEvacuacao);
        }

        // 🌍 REAÇÃO INTERNACIONAL
        const reputacaoAtual = db.get(`pais_${nomePais}.reputacaoDiplomatica`) || 0;

        // Ajuda internacional (países oferecem ajuda)
        const ajudaInternacional = Math.floor(Math.random() * 50000000) + 10000000;
        db.add(`pais_${nomePais}.comida`, ajudaInternacional);

        const noticiaAjuda = {
            titulo: '🌍 Ajuda Humanitária Internacional',
            descricao:
                `A comunidade internacional enviou **${ajudaInternacional.toLocaleString('pt-BR')}** toneladas de suprimentos para **${nome}**.\n\n` +
                `🏥 Equipes médicas estrangeiras chegam ao país\n` +
                `🍞 Alimentos e água potável\n` +
                `🛡️ AIEA envia especialistas\n\n` +
                `*"O mundo se une para ajudar na maior tragédia nuclear da década."*`,
            tipo: 'comercio',
            impacto: 'positivo',
            timestamp: Date.now(),
            pais: nomePais
        };
        this.adicionarNoticiaNacional(nomePais, noticiaAjuda);
        this.adicionarNoticiaGlobal(noticiaAjuda);

        // 🏚️ ZONA DE EXCLUSÃO
        db.set(`pais_${nomePais}.zona_exclusao`, {
            criadaEm: Date.now(),
            area: tipoAcidente === 'catastrofico' ? '500 km²' : tipoAcidente === 'grave' ? '50 km²' : '5 km²',
            populacaoPerdida: evacuados
        });

        // 📉 CRISE ECONÔMICA
        db.add(`pais_${nomePais}.inflacao`, 0.03);
        db.subtract(`pais_${nomePais}.pib`, Math.floor((pais.pib || 0) * 0.05));

        // 🏭 INDÚSTRIAS PARAM NA ÁREA
        const perdaProdutividade = tipoAcidente === 'catastrofico' ? 0.15 : tipoAcidente === 'grave' ? 0.08 : 0.03;
        db.subtract(`pais_${nomePais}.produtividade`, perdaProdutividade);

        const noticiaEconomia = {
            titulo: '📉 Crise Econômica Pós-Acidente',
            descricao:
                `A economia de **${nome}** sofre um duro golpe após o acidente nuclear.\n\n` +
                `🏭 Produtividade: **-${(perdaProdutividade * 100).toFixed(0)}%**\n` +
                `📊 PIB: **-5%**\n` +
                `📈 Inflação: **+3%**\n` +
                `💼 Empresas fecham na área afetada\n\n` +
                `*"O impacto econômico será sentido por décadas."*`,
            tipo: 'economia',
            impacto: 'negativo',
            timestamp: Date.now(),
            pais: nomePais
        };
        this.adicionarNoticiaNacional(nomePais, noticiaEconomia);

        // ⚠️ SE FOR CATASTRÓFICO, CONSEQUÊNCIAS GLOBAIS
        if (tipoAcidente === 'catastrofico') {
            // Nuvem radioativa afeta países vizinhos
            const listaPaises = db.get('lista_paises') || [];
            const paisesAfetados = listaPaises.filter((p) => p !== nomePais).slice(0, 3);

            for (const paisVizinho of paisesAfetados) {
                db.subtract(
                    `pais_${paisVizinho}.populacao`,
                    Math.floor((db.get(`pais_${paisVizinho}.populacao`) || 0) * 0.005)
                );
                db.subtract(`pais_${paisVizinho}.reputacaoDiplomatica`, 5);
            }

            const noticiaGlobal = {
                titulo: '🌍 Nuvem Radioativa Atravessa Fronteiras!',
                descricao:
                    `A nuvem radioativa de **${nome}** atingiu países vizinhos!\n\n` +
                    `☢️ ${paisesAfetados.join(', ')} relatam aumento de radiação\n` +
                    `🚧 Fronteiras fechadas\n` +
                    `🛬 Voos cancelados na região\n\n` +
                    `*"O mundo entra em alerta máximo nuclear."*`,
                tipo: 'desastre',
                impacto: 'negativo',
                timestamp: Date.now(),
                pais: nomePais
            };
            this.adicionarNoticiaGlobal(noticiaGlobal);
        }
    }

    // 🏥 PROCESSAR SAÚDE PÚBLICA
    processarSaude(nomePais, pais) {
        const hospitais = Number(pais.construcoes?.hospital?.nivel || pais.construcoes?.hospital || 0);
        const populacao = pais.populacao || 1;
        const infraestrutura = pais.infraestrutura || 0;
        const programas = pais.programas_saude || [];

        // 💀 MORTALIDADE NATURAL (base + idade)
        const expectativaVida = 55 + infraestrutura * 5 + (hospitais > 0 ? 10 : 0);
        const taxaMortalidadeBase = 1 / (expectativaVida * 365); // Mortes por dia
        const obitosNaturais = Math.floor(populacao * taxaMortalidadeBase);

        // 🏥 HOSPITAIS REDUZEM MORTALIDADE
        const reducaoHospitais = Math.min(0.5, hospitais * 0.01); // Máximo 50% redução
        const obitosFinais = Math.floor(obitosNaturais * (1 - reducaoHospitais));

        if (obitosFinais > 0) {
            db.subtract(`pais_${nomePais}.populacao`, obitosFinais);
            db.set(`pais_${nomePais}.obitos_ciclo`, obitosFinais);
        }

        // 👶 NASCIMENTOS
        const taxaNatalidade = 0.0001; // 0.01% por ciclo
        const nascimentos = Math.floor(populacao * taxaNatalidade);
        if (nascimentos > 0) {
            db.add(`pais_${nomePais}.populacao`, nascimentos);
        }

        // 🏥 TRATAR DOENTES (se houver epidemia)
        const doentesAtivos = pais.doentes_ativos || 0;
        if (doentesAtivos > 0 && hospitais > 0) {
            const capacidadeTratamento = hospitais * 300;
            const tratados = Math.min(doentesAtivos, capacidadeTratamento);
            const recuperados = Math.floor(tratados * 0.85);

            db.subtract(`pais_${nomePais}.doentes_ativos`, tratados);
            db.add(`pais_${nomePais}.populacao`, recuperados);
        }

        // 📊 OCUPAÇÃO HOSPITALAR
        const totalPacientes = (pais.feridos_acidente || 0) + doentesAtivos;
        const capacidadeTotal = hospitais * 1000;
        const ocupacao = capacidadeTotal > 0 ? Math.min(100, (totalPacientes / capacidadeTotal) * 100) : 0;
        db.set(`pais_${nomePais}.ocupacao_hospitalar`, ocupacao);

        // 💰 CUSTO DE MANUTENÇÃO
        if (hospitais > 0) {
            const custo = hospitais * 50000;
            if ((pais.tesouro || 0) >= custo) {
                db.subtract(`pais_${nomePais}.tesouro`, custo);
                db.add(`pais_${nomePais}.gastos`, custo);
            }
        }
    }

    // 🦠 VERIFICAR SURTOS DE DOENÇAS
    verificarSurtosDoencas(nomePais, pais) {
        const epidemiaAtiva = pais.epidemia_ativa;
        const programas = pais.programas_saude || [];
        const hospitais = Number(pais.construcoes?.hospital?.nivel || pais.construcoes?.hospital || 0);
        const populacao = pais.populacao || 1;

        // Se já tem epidemia ativa, processar
        if (epidemiaAtiva) {
            const doenca = DOENCAS[epidemiaAtiva.doenca];
            if (!doenca) {
                db.delete(`pais_${nomePais}.epidemia_ativa`);
                return;
            }

            // Aplicar quarentena se ativa
            let fatorContagio = doenca.contagio;
            if (programas.includes('quarentena_obrigatoria')) {
                fatorContagio *= 0.5;
            }

            // Novos infectados
            const novosInfectados = Math.floor(populacao * fatorContagio * 0.01);
            db.add(`pais_${nomePais}.doentes_ativos`, novosInfectados);

            // Mortes pela doença
            const mortesDoenca = Math.floor(novosInfectados * doenca.mortalidade);
            if (mortesDoenca > 0) {
                db.subtract(`pais_${nomePais}.populacao`, mortesDoenca);
                db.subtract(`pais_${nomePais}.doentes_ativos`, mortesDoenca);
            }

            // Duração da epidemia
            epidemiaAtiva.ciclosRestantes--;
            if (epidemiaAtiva.ciclosRestantes <= 0) {
                db.delete(`pais_${nomePais}.epidemia_ativa`);

                const dados = getDadosPais(nomePais);
                const noticia = {
                    titulo: '🎉 Fim da Epidemia!',
                    descricao: `**${dados ? dados.nomeFormal : nomePais}** superou a epidemia de **${doenca.nome}**!`,
                    tipo: 'social',
                    impacto: 'positivo',
                    timestamp: Date.now(),
                    pais: nomePais
                };
                this.adicionarNoticiaNacional(nomePais, noticia);
                this.adicionarNoticiaGlobal(noticia);
                db.add(`pais_${nomePais}.aprovacaoPopular`, 10);
            } else {
                db.set(`pais_${nomePais}.epidemia_ativa`, epidemiaAtiva);
            }

            return;
        }

        // CHANCE DE NOVO SURTO (baseado em condições)
        let chanceSurto = 0.02; // 2% base

        // Sem saneamento = +10%
        if (!programas.includes('saneamento_basico')) chanceSurto += 0.1;
        // Sem vacinação = +8%
        if (!programas.includes('vacinacao_massiva')) chanceSurto += 0.08;

        // Hospitais precários = +5%
        if (hospitais < 10) chanceSurto += 0.05;

        // Infraestrutura baixa = +5%
        if ((pais.infraestrutura || 0) < 2) chanceSurto += 0.05;

        if (Math.random() < chanceSurto) {
            // Escolher doença baseado em condições
            let doencasPossiveis = Object.entries(DOENCAS).filter(([key, d]) => {
                if (d.requer && !programas.includes(d.requer)) return true;
                return !d.requer;
            });

            const [doencaKey, doenca] = doencasPossiveis[Math.floor(Math.random() * doencasPossiveis.length)];

            const infectadosIniciais = Math.floor(populacao * 0.01);

            db.set(`pais_${nomePais}.epidemia_ativa`, {
                doenca: doencaKey,
                inicio: Date.now(),
                ciclosRestantes: doenca.duracao,
                infectados: infectadosIniciais
            });
            db.add(`pais_${nomePais}.doentes_ativos`, infectadosIniciais);

            const dados = getDadosPais(nomePais);
            const noticia = {
                titulo: `🦠 Surto de ${doenca.nome}!`,
                descricao:
                    `**${dados ? dados.nomeFormal : nomePais}** enfrenta um surto de **${doenca.nome}**!\n\n` +
                    `🤒 Infectados iniciais: **${infectadosIniciais.toLocaleString('pt-BR')}**\n` +
                    `💀 Mortalidade: **${(doenca.mortalidade * 100).toFixed(1)}%**\n` +
                    `⏱️ Duração estimada: **${doenca.duracao} ciclos**\n\n` +
                    `Use \`B!saude\` para gerenciar a crise!`,
                tipo: 'desastre',
                impacto: 'negativo',
                timestamp: Date.now(),
                pais: nomePais
            };
            this.adicionarNoticiaNacional(nomePais, noticia);
            this.adicionarNoticiaGlobal(noticia);
        }
    }

    // ⚡ PROCESSAR INFLAÇÃO DOS FANTOCHES
    processarInflacaoFantoches(nomePais, pais) {
        // Só processa se for um fantoche
        if (!pais.controladoPor && !pais.tributoPara) return;

        let inflacao = pais.inflacao || 0.53;
        const infraestrutura = pais.infraestrutura || 0;
        const agricultura = pais.agricultura || 0;
        const bancos = Number(pais.construcoes?.banco?.nivel || pais.construcoes?.banco || 0);

        // Reduzir inflação baseado em infraestrutura e bancos
        inflacao -= infraestrutura * 0.02; // Cada infra reduz 2%
        inflacao -= bancos * 0.01; // Cada banco reduz 1%
        inflacao -= Math.log10(agricultura + 1) * 0.01;

        // Estabilização natural (alvo = 3%)
        inflacao += (0.03 - inflacao) * 0.1;

        // Limites
        inflacao = Math.max(-0.05, Math.min(1.0, inflacao));
        inflacao = Number(inflacao.toFixed(4));

        db.set(`pais_${nomePais}.inflacao`, inflacao);
    }

    // ⚡ FUNÇÃO PRINCIPAL
    processarIA_Militar(nomePais, pais) {
        const guerras = db.get('guerras_ativas') || [];
        const minhaGuerra = guerras.find(
            (g) => (g.status || 'ativa') === 'ativa' && (g.atacante === nomePais || g.defensor === nomePais)
        );

        if (minhaGuerra) {
            // 🔥 EM GUERRA - IA assume tática
            this.executarTaticaGuerra(nomePais, pais, minhaGuerra);
        }

        // ⚡ SÓ NPCs podem INICIAR guerras
        if (pais.isNPC && pais.personalidade === 'militar' && !minhaGuerra) {
            this.avaliarIniciarGuerra(nomePais, pais);
        }

        // 🏕️ Manutenção de bases (TODOS, em paz ou guerra)
        this.manterBasesMilitares(nomePais, pais);
    }

    processarNegociacoesNPC() {
        const guerras = db.get('guerras_ativas') || [];
        let alterado = false;
        for (const guerraBruta of guerras) {
            if ((guerraBruta.status || 'ativa') !== 'ativa') continue;
            const guerra = criarGuerra(guerraBruta);
            const atacante = db.get(`pais_${guerra.atacante}`);
            const defensor = db.get(`pais_${guerra.defensor}`);
            if (!atacante || !defensor || (!atacante.isNPC && !defensor.isNPC)) continue;
            const equilibrada = guerra.pontuacao.atacante >= 42 && guerra.pontuacao.atacante <= 58;
            const propostaPendente = guerra.propostasPaz.find(
                (proposta) => proposta.tipo === 'paz_branca' && proposta.status === 'pendente'
            );
            if (
                propostaPendente &&
                propostaPendente.para === guerra.atacante &&
                atacante.isNPC &&
                equilibrada &&
                Math.random() < 0.25
            ) {
                propostaPendente.status = 'aceita';
                guerras.splice(guerras.indexOf(guerraBruta), 1);
                alterado = true;
                continue;
            }
            if (!propostaPendente && equilibrada && Math.random() < 0.05) {
                const de = atacante.isNPC ? guerra.atacante : guerra.defensor;
                const para = de === guerra.atacante ? guerra.defensor : guerra.atacante;
                guerra.propostasPaz.push({ tipo: 'paz_branca', de, para, status: 'pendente', criadaEm: Date.now() });
                guerras[guerras.indexOf(guerraBruta)] = guerra;
                alterado = true;
            }
        }
        if (alterado) db.set('guerras_ativas', guerras);
    }

    executarTaticaGuerra(nomePais, pais, guerra) {
        const inimigo = guerra.atacante === nomePais ? guerra.defensor : guerra.atacante;
        const souAtacante = guerra.atacante === nomePais;
        const paisInimigo = db.get(`pais_${inimigo}`);
        if (!paisInimigo) return;

        const progresso = guerra.progresso || 0;
        const poderMeu = this.calcularPoderMilitar(pais);
        const poderInimigo = this.calcularPoderMilitar(paisInimigo);

        // 📊 AVALIAR SITUAÇÃO
        const minhasBases = (pais.bases_militares || []).filter((b) => b.pais === inimigo);
        const basesInimigas = (paisInimigo.bases_militares || []).filter((b) => b.pais === nomePais);

        // ⛽ SUPRIR BASES (automático)
        for (const base of minhasBases) {
            if (base.suprimento < 50) {
                base.suprimento = Math.min(100, base.suprimento + 30);
                if (!pais.isNPC) {
                    this.notificarAcaoTatica(nomePais, `📦 Base em ${inimigo} reabastecida! ⛽ ${base.suprimento}%`);
                }
            }
        }
        if (minhasBases.length > 0) db.set(`pais_${nomePais}.bases_militares`, pais.bases_militares);

        // 🔪 CORTAR SUPRIMENTOS INIMIGOS
        for (const baseInimiga of basesInimigas) {
            if (baseInimiga.suprimento > 30 && Math.random() < 0.3) {
                baseInimiga.suprimento = Math.max(0, baseInimiga.suprimento - 20);
                if (!pais.isNPC) {
                    this.notificarAcaoTatica(nomePais, `🔪 Suprimentos inimigos em ${nomePais} sabotados!`);
                }
            }
        }
        if (basesInimigas.length > 0) db.set(`pais_${inimigo}.bases_militares`, paisInimigo.bases_militares);

        // 🏕️ ESTABELECER BASE (se não tem nenhuma)
        const precisoDeBase = minhasBases.length === 0 && souAtacante && progresso > 20;
        if (precisoDeBase && (pais.exercito?.infantaria || 0) > 10000) {
            const tipoBase = (pais.tesouro || 0) > 1000000 ? 'quartel_general' : 'posto_avancado';
            const custo = TIPOS_BASES[tipoBase]?.custo || 50000;
            if ((pais.tesouro || 0) >= custo) {
                db.subtract(`pais_${nomePais}.tesouro`, custo);
                db.subtract(`pais_${nomePais}.exercito.infantaria`, 5000);
                const bases = pais.bases_militares || [];
                bases.push({
                    nome: `${TIPOS_BASES[tipoBase]?.nome || 'Base'} ${nomePais}`,
                    tipo: tipoBase,
                    pais: inimigo,
                    tropas: 5000,
                    suprimento: 100,
                    criadaEm: Date.now()
                });
                db.set(`pais_${nomePais}.bases_militares`, bases);
                const noticia = {
                    titulo: `🏕️ Base Militar Estabelecida no Front!`,
                    descricao: `Forças de **${pais.nomeFormal || nomePais}** estabeleceram uma base em **${inimigo}**! 👥 5.000 soldados.`,
                    tipo: 'militar',
                    impacto: 'tenso',
                    timestamp: Date.now(),
                    pais: nomePais
                };
                this.adicionarNoticiaNacional(nomePais, noticia);
                this.adicionarNoticiaGlobal(noticia);
            }
        }

        // ⚔️ ATACAR (se for atacante e não estiver 100%)
        if (souAtacante && progresso < 100 && Math.random() < 0.4) {
            const tipoAtaque = this.escolherMelhorAtaque(pais, paisInimigo);
            this.executarAtaqueTatico(nomePais, inimigo, tipoAtaque);
        }

        // ☢️ USAR OGIVA NUCLEAR (SÓ COM AUTORIZAÇÃO DO JOGADOR!)
        if (!pais.isNPC) {
            // ⚡ JOGADOR: NUNCA usar ogiva automaticamente!
            // Só notificar se estiver perdendo
            if (progresso < 20 && (pais.arsenal_nuclear?.ogiva_base || 0) > 0) {
                this.notificarAcaoTatica(
                    nomePais,
                    `⚠️ Situação crítica! Você tem ogivas nucleares disponíveis. Use \`B!operacao-militar bombardear ${inimigo}\` se necessário.`
                );
            }
        } else {
            // 🤖 NPC: pode usar ogiva se estiver perdendo FEIO
            if (progresso < 10 && poderMeu < poderInimigo * 0.3 && Math.random() < 0.15) {
                const arsenal = pais.arsenal_nuclear || {};
                const tipo =
                    arsenal.ogiva_hidrogenio > 0
                        ? 'ogiva_hidrogenio'
                        : arsenal.ogiva_avancada > 0
                          ? 'ogiva_avancada'
                          : 'ogiva_base';
                if ((arsenal[tipo] || 0) > 0) {
                    const poder = tipo === 'ogiva_hidrogenio' ? 100 : tipo === 'ogiva_avancada' ? 10 : 1;
                    const mortos = Math.floor((paisInimigo.populacao || 0) * 0.05 * poder);
                    db.subtract(`pais_${nomePais}.arsenal_nuclear.${tipo}`, 1);
                    db.subtract(`pais_${inimigo}.populacao`, mortos);
                    db.subtract(`pais_${inimigo}.infraestrutura`, Math.min(5, poder * 0.5));
                    db.subtract(`pais_${nomePais}.reputacaoDiplomatica`, 50);
                    const noticia = {
                        titulo: '☢️ ATAQUE NUCLEAR NO FRONT!',
                        descricao: `**${pais.nomeFormal || nomePais}** usou ogiva nuclear contra **${inimigo}**! 💀 ${mortos.toLocaleString('pt-BR')} mortos.`,
                        tipo: 'militar',
                        impacto: 'negativo',
                        timestamp: Date.now(),
                        pais: nomePais
                    };
                    this.adicionarNoticiaGlobal(noticia);
                    this.adicionarNoticiaNacional(nomePais, noticia);
                    this.adicionarNoticiaNacional(inimigo, noticia);
                }
            }
        }

        // 🕊️ RENDIÇÃO (NPCs se estiverem perdendo muito)
        if (pais.isNPC && progresso < 10 && poderMeu < poderInimigo * 0.3 && Math.random() < 0.2) {
            this.oferecerRendicaoNPC(nomePais, inimigo);
        }

        // 🏳️ CAPITULAÇÃO NPC (a resolução política vem depois da derrota militar)
        if (progresso >= 85 && souAtacante) {
            const guerras = db.get('guerras_ativas') || [];
            const indiceGuerra = guerras.findIndex((g) => g.atacante === nomePais && g.defensor === inimigo);
            if (indiceGuerra >= 0 && guerras[indiceGuerra].status === 'ativa' && paisInimigo.isNPC) {
                guerras[indiceGuerra] = {
                    ...guerras[indiceGuerra],
                    status: 'capitulada',
                    capitulacao: { por: inimigo, perante: nomePais, em: Date.now() },
                    conferenciaPaz: { status: 'pendente', vencedor: nomePais, derrotado: inimigo, exigencias: [] }
                };
                db.set('guerras_ativas', guerras);
                const noticia = {
                    titulo: '🏳️ Capitulação no Front!',
                    descricao: `**${paisInimigo.nomeFormal || inimigo}** capitulou perante **${pais.nomeFormal || nomePais}**. Uma Conferência de Paz será realizada.`,
                    tipo: 'militar',
                    impacto: 'tenso',
                    timestamp: Date.now(),
                    pais: inimigo
                };
                this.adicionarNoticiaGlobal(noticia);
                this.adicionarNoticiaNacional(nomePais, noticia);
                this.adicionarNoticiaNacional(inimigo, noticia);
            }
        }
    }

    // ⚡ ESCOLHER MELHOR TIPO DE ATAQUE
    escolherMelhorAtaque(pais, inimigo) {
        const ex = pais.exercito || {};
        const exInimigo = inimigo.exercito || {};

        // Se tem muitos tanques -> Blitzkrieg
        if ((ex.tanques || 0) > 5000) return 'ataque_relampago';
        // Se tem muitos aviões -> Bombardeio aéreo
        if ((ex.avioes || 0) > 1000) return 'bombardeio_aereo';
        // Se tem muitos navios e inimigo tem costa -> Bloqueio naval
        if ((ex.navios || 0) > 500) return 'bloqueio_naval';
        // Se tem muita infantaria -> Cerco estratégico
        if ((ex.infantaria || 0) > 50000) return 'cerco_estrategico';
        // Padrão
        return 'invasao_terrestre';
    }

    // ⚡ EXECUTAR ATAQUE TÁTICO (simplificado, sem embed)
    executarAtaqueTatico(atacante, defensor, tipo) {
        const paisAtacante = db.get(`pais_${atacante}`);
        const paisDefensor = db.get(`pais_${defensor}`);
        if (!paisAtacante || !paisDefensor) return;

        const poderAtk = this.calcularPoderOperacao(paisAtacante, tipo);
        const poderDef = this.calcularPoderDefesa(paisDefensor);
        const vitoria = poderAtk > poderDef;

        // ⚡ CORRIGIDO: Baixas baseadas no PODER TOTAL, não só infantaria!
        const poderTotalAtacante = this.calcularPoderMilitar(paisAtacante);
        const poderTotalDefensor = this.calcularPoderMilitar(paisDefensor);

        // Perdas proporcionais ao poder total
        const taxaPerdaAtacante = vitoria ? 0.0001 : 0.0005; // 0.01% ou 0.05% do poder
        const taxaPerdaDefensor = vitoria ? 0.0005 : 0.0001;

        const perdaAtk = Math.floor(poderTotalAtacante * taxaPerdaAtacante);
        const perdaDef = Math.floor(poderTotalDefensor * taxaPerdaDefensor);

        // Distribuir perdas entre as unidades
        const exAtacante = paisAtacante.exercito || {};
        const exDefensor = paisDefensor.exercito || {};

        // Reduzir proporcionalmente
        if ((exAtacante.infantaria || 0) > 0)
            db.subtract(`pais_${atacante}.exercito.infantaria`, Math.floor(perdaAtk * 0.7));
        if ((exAtacante.tanques || 0) > 0)
            db.subtract(`pais_${atacante}.exercito.tanques`, Math.floor(perdaAtk * 0.01));
        if ((exAtacante.avioes || 0) > 0) db.subtract(`pais_${atacante}.exercito.avioes`, Math.floor(perdaAtk * 0.005));
        if ((exAtacante.navios || 0) > 0) db.subtract(`pais_${atacante}.exercito.navios`, Math.floor(perdaAtk * 0.002));

        if ((exDefensor.infantaria || 0) > 0)
            db.subtract(`pais_${defensor}.exercito.infantaria`, Math.floor(perdaDef * 0.7));
        if ((exDefensor.tanques || 0) > 0)
            db.subtract(`pais_${defensor}.exercito.tanques`, Math.floor(perdaDef * 0.01));
        if ((exDefensor.avioes || 0) > 0) db.subtract(`pais_${defensor}.exercito.avioes`, Math.floor(perdaDef * 0.005));
        if ((exDefensor.navios || 0) > 0) db.subtract(`pais_${defensor}.exercito.navios`, Math.floor(perdaDef * 0.002));

        db.subtract(`pais_${atacante}.tesouro`, 50000);

        // Atualizar progresso
        const guerras = db.get('guerras_ativas') || [];
        const indiceGuerra = guerras.findIndex((g) => g.atacante === atacante && g.defensor === defensor);
        if (indiceGuerra >= 0) {
            const guerra = guerras[indiceGuerra];
            const guerraAtualizada = registrarBatalha(guerra, {
                vencedor: vitoria ? atacante : defensor,
                baixasAtacante: perdaAtk,
                baixasDefensor: perdaDef
            });
            guerraAtualizada.progresso = Math.min(100, (guerra.progresso || 0) + (vitoria ? 8 : 2));
            guerraAtualizada.baixasAtacante = (guerra.baixasAtacante || 0) + perdaAtk;
            guerraAtualizada.baixasDefensor = (guerra.baixasDefensor || 0) + perdaDef;
            guerraAtualizada.pontuacao = calcularPontuacao(guerraAtualizada);
            guerras[indiceGuerra] = guerraAtualizada;
            db.set('guerras_ativas', guerras);
        }
    }

    // ⚡ AVALIAR INICIAR GUERRA
    avaliarIniciarGuerra(nomePais, pais) {
        if (Math.random() > 0.05) return;

        const listaPaises = db.get('lista_paises') || [];
        const aliancas = pais.aliancas || [];
        const embargos = pais.embargos || [];

        const poderMeu = this.calcularPoderMilitar(pais);

        const alvos = listaPaises.filter((p) => {
            if (p === nomePais) return false;
            if (aliancas.includes(p)) return false;
            const dadosAlvo = db.get(`pais_${p}`);
            if (!dadosAlvo) return false;
            const poderDoAlvo = this.calcularPoderMilitar(dadosAlvo);
            if (poderMeu > poderDoAlvo * 3) return true;
            if ((dadosAlvo.petroleo || 0) > 100000 || (dadosAlvo.uranio || 0) > 50000) return true;
            if (embargos.includes(p)) return true;
            return false;
        });

        if (alvos.length === 0) return;

        const alvoEscolhido = alvos[Math.floor(Math.random() * alvos.length)];
        const paisAlvo = db.get(`pais_${alvoEscolhido}`);
        if (!paisAlvo) return;

        const poderAlvo = this.calcularPoderMilitar(paisAlvo);

        // Declarar guerra
        const novaGuerra = criarGuerra({
            atacante: nomePais,
            defensor: alvoEscolhido,
            tipo: 'invasao_terrestre',
            progresso: Math.floor(Math.random() * 10),
            inicio: Date.now(),
            general: 'Comando Central',
            baixasAtacante: 0,
            baixasDefensor: 0,
            baixasCivis: 0,
            status: 'ativa',
            casusBelli: (pais.embargos || []).includes(alvoEscolhido) ? 'violacao_de_acordos' : 'interesse_estrategico',
            objetivos: ['conquista_territorial']
        });

        const guerras = db.get('guerras_ativas') || [];
        guerras.push(novaGuerra);
        db.set('guerras_ativas', guerras);

        this.romperAcordos(nomePais, alvoEscolhido);

        const dadosAlvoNoticia = getDadosPais(alvoEscolhido);
        const noticia = {
            titulo: '⚔️ Guerra Declarada!',
            descricao:
                `**${pais.nomeFormal || nomePais}** declarou guerra contra **${dadosAlvoNoticia?.nomeFormal || alvoEscolhido}**!\n\n` +
                `Motivo: ${poderMeu > poderAlvo * 3 ? 'Superioridade militar' : (paisAlvo.petroleo || 0) > 100000 ? 'Interesse em recursos petrolíferos' : 'Conflito diplomático'}\n\n` +
                `⚔️ Fronteiras se fecham, tropas se mobilizam.`,
            tipo: 'militar',
            impacto: 'negativo',
            timestamp: Date.now(),
            pais: nomePais
        };
        this.adicionarNoticiaGlobal(noticia);
        this.adicionarNoticiaNacional(nomePais, noticia);
        this.adicionarNoticiaNacional(alvoEscolhido, noticia);
    }

    // ⚡ MANTER BASES MILITARES (todos os países)
    manterBasesMilitares(nomePais, pais) {
        const bases = pais.bases_militares || [];
        if (bases.length === 0) return;

        for (const base of bases) {
            // Suprimento diminui naturalmente
            base.suprimento = Math.max(0, (base.suprimento || 100) - 2);

            // Se suprimento zerar, perde tropas
            if (base.suprimento <= 0) {
                base.tropas = Math.max(0, (base.tropas || 0) - 100);
                if (base.tropas <= 0) {
                    // Base abandonada
                    const idx = bases.indexOf(base);
                    bases.splice(idx, 1);

                    if (!pais.isNPC) {
                        this.notificarAcaoTatica(
                            nomePais,
                            `🏚️ Base em ${base.pais} foi abandonada por falta de suprimentos!`
                        );
                    }
                }
            }
        }

        db.set(`pais_${nomePais}.bases_militares`, bases);
    }

    // ⚡ NOTIFICAR AÇÃO TÁTICA (para jogadores)
    notificarAcaoTatica(nomePais, mensagem) {
        const dados = getDadosPais(nomePais);
        const noticia = {
            titulo: '🎖️ Comando Tático',
            descricao: mensagem,
            tipo: 'militar',
            impacto: 'neutro',
            timestamp: Date.now(),
            pais: nomePais
        };
        this.adicionarNoticiaNacional(nomePais, noticia);
    }

    // ⚡ OFERECER RENDIÇÃO (NPC)
    oferecerRendicaoNPC(nomePais, inimigo) {
        const dados = getDadosPais(nomePais);
        const dadosInimigo = getDadosPais(inimigo);

        const noticia = {
            titulo: '🏳️ Rendição Oferecida!',
            descricao: `**${dados?.nomeFormal || nomePais}** ofereceu rendição para **${dadosInimigo?.nomeFormal || inimigo}**!\n\nAs forças militares não sustentam mais o conflito.`,
            tipo: 'militar',
            impacto: 'neutro',
            timestamp: Date.now(),
            pais: nomePais
        };
        this.adicionarNoticiaGlobal(noticia);

        // Remover guerra
        const guerras = db.get('guerras_ativas') || [];
        db.set(
            'guerras_ativas',
            guerras.filter((g) => !(g.atacante === nomePais || g.defensor === nomePais))
        );
    }

    // ⚡ ANEXAR PAÍS AUTOMÁTICO
    anexarPaisAutomatico(nomePais, inimigo) {
        const paisAlvo = db.get(`pais_${inimigo}`);
        if (!paisAlvo) return;

        const dadosAlvo = getDadosPais(inimigo);
        if (dadosAlvo) this.garantirEstruturaPais(inimigo, paisAlvo, dadosAlvo);
        db.set(`pais_${inimigo}.status`, 'anexado');
        db.set(`pais_${inimigo}.anexadoPor`, nomePais);
        db.set(`pais_${inimigo}.controladoPor`, nomePais);

        const tesouro = Math.floor((paisAlvo.tesouro || 0) * 0.5);
        const populacao = Math.floor((paisAlvo.populacao || 0) * 0.3);

        db.add(`pais_${nomePais}.tesouro`, tesouro);
        db.add(`pais_${nomePais}.populacao`, populacao);
        db.set(`pais_${inimigo}.anexadoPor`, nomePais);
        db.set(`pais_${inimigo}.status`, 'anexado');

        const guerras = db.get('guerras_ativas') || [];
        db.set(
            'guerras_ativas',
            guerras.filter((g) => !(g.atacante === nomePais && g.defensor === inimigo))
        );

        const dados = getDadosPais(nomePais);
        const noticia = {
            titulo: '🏴 Anexação Automática!',
            descricao: `**${dados?.nomeFormal || nomePais}** anexou **${dadosAlvo?.nomeFormal || inimigo}** após vitória militar!\n💰 +${tesouro.toLocaleString('pt-BR')} moedas\n👥 +${populacao.toLocaleString('pt-BR')} habitantes`,
            tipo: 'militar',
            impacto: 'positivo',
            timestamp: Date.now(),
            pais: nomePais
        };
        this.adicionarNoticiaGlobal(noticia);
        this.adicionarNoticiaNacional(nomePais, noticia);
    }

    calcularPoderMilitar(pais) {
        const ex = pais.exercito || {};
        const infantaria = Number(ex.infantaria) || 0;
        const tanques = Number(ex.tanques) || 0;
        const avioes = Number(ex.avioes) || 0;
        const navios = Number(ex.navios) || 0;
        const arsenal = pais.arsenal_nuclear || {};
        const bombas =
            (arsenal.ogiva_base || 0) * 1 +
            (arsenal.ogiva_avancada || 0) * 10 +
            (arsenal.ogiva_hidrogenio || 0) * 100 +
            (arsenal.missil_icbm || 0) * 50;
        return Math.floor(infantaria * 1 + tanques * 10 + avioes * 15 + navios * 12 + bombas * 1000);
    }

    calcularPoderOperacao(pais, tipo) {
        const ex = pais.exercito || {};
        const infantaria = Number(ex.infantaria) || 0;
        const tanques = Number(ex.tanques) || 0;
        const avioes = Number(ex.avioes) || 0;
        const navios = Number(ex.navios) || 0;
        const infra = Number(pais.infraestrutura) || 1;
        switch (tipo) {
            case 'invasao_terrestre':
                return Math.floor((infantaria * 1.5 + tanques * 12) * (1 + infra * 0.05));
            case 'ataque_relampago':
                return Math.floor(tanques * 20 * 1.4);
            case 'bombardeio_aereo':
                return Math.floor(avioes * 25);
            case 'bloqueio_naval':
                return Math.floor(navios * 20);
            case 'defesa_estrategica':
                return Math.floor(infantaria * 2.5);
            case 'bombardeio_nuclear':
                return 999999;
            case 'invasao_anfibia':
                return Math.floor((navios * 15 + infantaria * 0.8) * 1.2);
            case 'cerco_estrategico':
                return Math.floor((infantaria * 1.8 + tanques * 15) * 0.9);
            default:
                return this.calcularPoderMilitar(pais);
        }
    }

    calcularPoderDefesa(pais) {
        const poderBase = this.calcularPoderMilitar(pais);
        const infra = Number(pais.infraestrutura) || 1;
        return Math.floor(poderBase * (1 + infra * 0.1) * 1.3);
    }

    romperAcordos(pais1, pais2) {
        const rotas1 = db.get(`pais_${pais1}.rotasComerciais`) || [];
        const rotas2 = db.get(`pais_${pais2}.rotasComerciais`) || [];
        db.set(
            `pais_${pais1}.rotasComerciais`,
            rotas1.filter((r) => r.parceiro !== pais2)
        );
        db.set(
            `pais_${pais2}.rotasComerciais`,
            rotas2.filter((r) => r.parceiro !== pais1)
        );
        const aliancas1 = db.get(`pais_${pais1}.aliancas`) || [];
        const aliancas2 = db.get(`pais_${pais2}.aliancas`) || [];
        db.set(
            `pais_${pais1}.aliancas`,
            aliancas1.filter((a) => a !== pais2)
        );
        db.set(
            `pais_${pais2}.aliancas`,
            aliancas2.filter((a) => a !== pais1)
        );
        if (!(db.get(`pais_${pais1}.embargos`) || []).includes(pais2)) db.push(`pais_${pais1}.embargos`, pais2);
        if (!(db.get(`pais_${pais2}.embargos`) || []).includes(pais1)) db.push(`pais_${pais2}.embargos`, pais1);
    }

    // Nova função (ANTES do último }):
    processarDrones(nomePais, pais) {
        const DRONES = {
            drone_fpv: { nome: 'Drone FPV Kamikaze', emoji: '🎮', poder: 50 },
            drone_shahed: { nome: 'Drone Shahed-136', emoji: '💣', poder: 500 },
            drone_bayraktar: { nome: 'Drone Bayraktar TB2', emoji: '🛩️', poder: 2000 }
        };
        const produzindo = pais.produzindo_drone;
        if (!produzindo) return;

        produzindo.progresso = (produzindo.progresso || 0) + 1;

        if (produzindo.progresso >= produzindo.total) {
            const arsenal = pais.arsenal_drones || {};
            //Adicionar a quantidade produzida
            arsenal[produzindo.tipo] = (arsenal[produzindo.tipo] || 0) + produzindo.quantidade;
            db.set(`pais_${nomePais}.arsenal_drones`, arsenal);
            db.delete(`pais_${nomePais}.produzindo_drone`);

            const drone = DRONES[produzindo.tipo];
            const dados = getDadosPais(nomePais);
            const noticia = {
                titulo: `${drone?.emoji || '🛸'} Novo Drone Produzido!`,
                descricao: `**${dados?.nomeFormal || nomePais}** concluiu a produção de um **${drone?.nome || produzindo.tipo}**!`,
                tipo: 'militar',
                impacto: 'neutro',
                timestamp: Date.now(),
                pais: nomePais
            };
            this.adicionarNoticiaNacional(nomePais, noticia);
        } else {
            db.set(`pais_${nomePais}.produzindo_drone`, produzindo);
        }
    }

    // ⚡ NOVA FUNÇÃO (ANTES do último }):
    processarAnexacoes() {
        const listaPaises = db.get('lista_paises') || [];

        for (const nomePais of listaPaises) {
            const pais = db.get(`pais_${nomePais}`);
            if (!pais) continue;

            // Verificar se foi anexado
            const anexadoPor = pais.anexadoPor;
            if (!anexadoPor) continue;

            const conquistador = db.get(`pais_${anexadoPor}`);
            if (!conquistador) continue;

            // ⚡ Já foi processado? (status = 'anexado')
            if (pais.status === 'integrado') continue;

            // ⚡ TRANSFERIR RECURSOS
            const tesouroTransferir = Math.floor((pais.tesouro || 0) * 0.5);
            const populacaoTransferir = Math.floor((pais.populacao || 0) * 0.6);
            const infraTransferir = Math.floor((pais.infraestrutura || 0) * 0.3);

            db.add(`pais_${anexadoPor}.tesouro`, tesouroTransferir);
            db.add(`pais_${anexadoPor}.populacao`, populacaoTransferir);
            db.add(`pais_${anexadoPor}.infraestrutura`, infraTransferir);

            // Transferir recursos naturais
            const recursos = [
                'ouro',
                'comida',
                'madeira',
                'pedra',
                'ferro',
                'carvao',
                'cobre',
                'aluminio',
                'diamante',
                'petroleo',
                'uranio',
                'titanio',
                'silicio',
                'litio',
                'grafeno',
                'terras_raras',
                'gas_natural',
                'helio3'
            ];
            for (const rec of recursos) {
                const qtd = pais[rec] || 0;
                if (qtd > 0) {
                    db.add(`pais_${anexadoPor}.${rec}`, Math.floor(qtd * 0.5));
                }
            }

            // Transferir exército (50% das tropas)
            const exAnx = pais.exercito || {};
            if (exAnx.infantaria > 0)
                db.add(`pais_${anexadoPor}.exercito.infantaria`, Math.floor((exAnx.infantaria || 0) * 0.5));
            if (exAnx.tanques > 0)
                db.add(`pais_${anexadoPor}.exercito.tanques`, Math.floor((exAnx.tanques || 0) * 0.5));
            if (exAnx.avioes > 0) db.add(`pais_${anexadoPor}.exercito.avioes`, Math.floor((exAnx.avioes || 0) * 0.5));
            if (exAnx.navios > 0) db.add(`pais_${anexadoPor}.exercito.navios`, Math.floor((exAnx.navios || 0) * 0.5));

            // Transferir ogivas
            const arsenalNuc = pais.arsenal_nuclear || {};
            for (const [tipo, qtd] of Object.entries(arsenalNuc)) {
                if (qtd > 0) db.add(`pais_${anexadoPor}.arsenal_nuclear.${tipo}`, qtd);
            }

            // Transferir drones
            const arsenalDrones = pais.arsenal_drones || {};
            for (const [tipo, qtd] of Object.entries(arsenalDrones)) {
                if (qtd > 0) db.add(`pais_${anexadoPor}.arsenal_drones.${tipo}`, qtd);
            }

            // ⚡ MARCAR COMO INTEGRADO
            db.set(`pais_${nomePais}.status`, 'integrado');
            db.set(`pais_${nomePais}.populacao`, Math.floor((pais.populacao || 0) * 0.4)); // 40% fica
            db.set(`pais_${nomePais}.tesouro`, 0);
            db.set(`pais_${nomePais}.exercito.infantaria`, 0);
            db.set(`pais_${nomePais}.exercito.tanques`, 0);
            db.set(`pais_${nomePais}.exercito.avioes`, 0);
            db.set(`pais_${nomePais}.exercito.navios`, 0);

            // ⚡ REMOVER DA LISTA DE PAÍSES ATIVOS?
            // Opção: manter como "território" mas sem governo
            db.set(`pais_${nomePais}.isNPC`, false);
            db.set(`pais_${nomePais}.governador`, null);

            // ⚡ NOTÍCIA
            const dadosAnx = getDadosPais(nomePais);
            const dadosConq = getDadosPais(anexadoPor);
            const noticia = {
                titulo: '🏴 Território Integrado ao Império!',
                descricao:
                    `**${dadosConq?.nomeFormal || anexadoPor}** integrou completamente **${dadosAnx?.nomeFormal || nomePais}** ao seu território!\n\n` +
                    `💰 Tesouro: +${tesouroTransferir.toLocaleString('pt-BR')} moedas\n` +
                    `👥 População: +${populacaoTransferir.toLocaleString('pt-BR')} habitantes\n` +
                    `🏗️ Infraestrutura: +${infraTransferir}`,
                tipo: 'militar',
                impacto: 'positivo',
                timestamp: Date.now(),
                pais: anexadoPor
            };
            this.adicionarNoticiaGlobal(noticia);
            this.adicionarNoticiaNacional(anexadoPor, noticia);

            // ⚠️ CHANCE DE REVOLTA (10%)
            if (Math.random() < 0.1) {
                const revoltosos = Math.floor((pais.populacao || 0) * 0.1);
                db.subtract(`pais_${anexadoPor}.populacao`, revoltosos);
                db.subtract(`pais_${anexadoPor}.aprovacaoPopular`, 5);

                const noticiaRevolta = {
                    titulo: '⚠️ Revolta em Território Anexado!',
                    descricao: `**${dadosAnx?.nomeFormal || nomePais}** se rebela contra o domínio de **${dadosConq?.nomeFormal || anexadoPor}**!\n💀 ${revoltosos.toLocaleString('pt-BR')} mortos nos confrontos.`,
                    tipo: 'militar',
                    impacto: 'negativo',
                    timestamp: Date.now(),
                    pais: anexadoPor
                };
                this.adicionarNoticiaNacional(anexadoPor, noticiaRevolta);
            }
        }
    }
}

module.exports = PaisEngine;
