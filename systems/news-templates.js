const db = require('./rpg-db');
const { reduzirPopulacao } = require('./pais-mutacoes');

// ================= 🌋 DESASTRES NATURAIS POR REGIÃO (15 eventos) =================
const desastresPorRegiao = {
    asia: [
        {
            titulo: '🌊 Tsunami devasta costa de {pais}!',
            desc: 'Ondas de {valor}m atingiram o litoral. {valor2}% da população costeira afetada. Milhares de desaparecidos.',
            efeito: (p) => {
                const pop = db.get(`pais_${p}.populacao`) || 0;
                reduzirPopulacao(p, Math.floor(pop * 0.04));
                db.subtract(`pais_${p}.infraestrutura`, 1.5);
            }
        },
        {
            titulo: '🌋 Erupção vulcânica em {pais}!',
            desc: 'Vulcão entrou em erupção! Cinzas cobrem o céu, {valor} voos cancelados, agricultura perdida.',
            efeito: (p) => {
                db.subtract(`pais_${p}.agricultura`, Math.floor((db.get(`pais_${p}.agricultura`) || 0) * 0.2));
                db.add(`pais_${p}.inflacao`, 0.04);
            }
        },
        {
            titulo: '🏚️ Terremoto de magnitude {valor} em {pais}!',
            desc: 'Prédios desabaram, {valor2}% da infraestrutura destruída. Equipes de resgate trabalham sem parar.',
            efeito: (p) => {
                db.subtract(`pais_${p}.infraestrutura`, 1);
                reduzirPopulacao(p, Math.floor((db.get(`pais_${p}.populacao`) || 0) * 0.02));
            }
        },
        {
            titulo: '🌀 Tufão de categoria {valor} atinge {pais}!',
            desc: 'Ventos de até 200km/h devastaram comunidades inteiras. Estado de calamidade decretado.',
            efeito: (p) => {
                db.subtract(`pais_${p}.infraestrutura`, 0.8);
                db.subtract(`pais_${p}.comida`, Math.floor((db.get(`pais_${p}.comida`) || 0) * 0.15));
            }
        }
    ],
    americas: [
        {
            titulo: '🌀 Furacão categoria {valor} devasta {pais}!',
            desc: 'Ventos de {valor}km/h destruíram o litoral. Evacuações em massa, {valor2}% da infraestrutura perdida.',
            efeito: (p) => {
                db.subtract(`pais_${p}.infraestrutura`, Math.floor((db.get(`pais_${p}.infraestrutura`) || 0) * 0.25));
                reduzirPopulacao(p, Math.floor((db.get(`pais_${p}.populacao`) || 0) * 0.015));
            }
        },
        {
            titulo: '🔥 Megaincêndios florestais em {pais}!',
            desc: '{valor}% das florestas consumidas! Ar irrespirável, fauna dizimada, evacuações em massa.',
            efeito: (p) => {
                db.subtract(`pais_${p}.madeira`, Math.floor((db.get(`pais_${p}.madeira`) || 0) * 0.4));
                db.subtract(`pais_${p}.aprovacaoPopular`, 10);
            }
        },
        {
            titulo: '🌪️ Tornado destrutivo atinge {pais}!',
            desc: 'Tornado de categoria F{valor} arrasou cidades inteiras em minutos. Centenas de desaparecidos.',
            efeito: (p) => {
                db.subtract(`pais_${p}.infraestrutura`, 0.5);
                reduzirPopulacao(p, Math.floor((db.get(`pais_${p}.populacao`) || 0) * 0.005));
            }
        },
        {
            titulo: '🏔️ Avalanche mortal em {pais}!',
            desc: 'Avalanche soterrou vilarejo alpino. Equipes de resgate enfrentam dificuldades.',
            efeito: (p) => {
                reduzirPopulacao(p, Math.floor((db.get(`pais_${p}.populacao`) || 0) * 0.002));
            }
        }
    ],
    europa: [
        {
            titulo: '🥵 Onda de calor recorde em {pais}!',
            desc: '{valor}°C! Idosos em risco, colheitas perdidas, {valor2}% da produção agrícola destruída.',
            efeito: (p) => {
                db.subtract(`pais_${p}.comida`, Math.floor((db.get(`pais_${p}.comida`) || 0) * 0.1));
                reduzirPopulacao(p, Math.floor((db.get(`pais_${p}.populacao`) || 0) * 0.003));
            }
        },
        {
            titulo: '❄️ Nevasca histórica paralisa {pais}!',
            desc: '{valor}cm de neve! Transportes colapsam, escolas fecham, economia em choque.',
            efeito: (p) => {
                db.subtract(`pais_${p}.produtividade`, 0.12);
                db.subtract(`pais_${p}.tesouro`, Math.floor((db.get(`pais_${p}.tesouro`) || 0) * 0.04));
            }
        },
        {
            titulo: '🌊 Enchente catastrófica em {pais}!',
            desc: "Rios transbordaram! {valor}% das cidades debaixo d'água. Perdas milionárias.",
            efeito: (p) => {
                db.subtract(`pais_${p}.infraestrutura`, 0.8);
                db.subtract(`pais_${p}.tesouro`, Math.floor((db.get(`pais_${p}.tesouro`) || 0) * 0.06));
            }
        }
    ],
    oriente_medio: [
        {
            titulo: '🏜️ Tempestade de areia engole {pais}!',
            desc: 'Visibilidade zero! Aeroportos fechados, {valor}% do comércio paralisado.',
            efeito: (p) => {
                db.subtract(`pais_${p}.produtividade`, 0.08);
                db.subtract(`pais_${p}.tesouro`, Math.floor((db.get(`pais_${p}.tesouro`) || 0) * 0.03));
            }
        },
        {
            titulo: '💧 Seca histórica castiga {pais}!',
            desc: 'Reservatórios em {valor}% da capacidade! Racionamento de água, agricultura em colapso.',
            efeito: (p) => {
                db.subtract(`pais_${p}.agricultura`, Math.floor((db.get(`pais_${p}.agricultura`) || 0) * 0.3));
                db.subtract(`pais_${p}.comida`, Math.floor((db.get(`pais_${p}.comida`) || 0) * 0.25));
            }
        }
    ]
};

// ================= 🚨 CRISES POLÍTICAS (10 eventos) =================
const crisesPoliticas = [
    {
        titulo: '🚨 Golpe de Estado em {pais}!',
        desc: 'Militares tomam o poder! Governo deposto, protestos nas ruas, incerteza total.',
        efeito: (p) => {
            db.subtract(`pais_${p}.aprovacaoPopular`, 40);
            db.subtract(`pais_${p}.reputacaoDiplomatica`, 25);
            db.add(`pais_${p}.inflacao`, 0.12);
            db.push(`pais_${p}.embargos`, 'onu');
        }
    },
    {
        titulo: '🏛️ Escândalo de Corrupção em {pais}!',
        desc: 'Ministros presos! Desvio bilionário revelado. População vai às ruas.',
        efeito: (p) => {
            db.subtract(`pais_${p}.aprovacaoPopular`, 25);
            db.subtract(`pais_${p}.tesouro`, Math.floor((db.get(`pais_${p}.tesouro`) || 0) * 0.05));
            db.subtract(`pais_${p}.reputacaoDiplomatica`, 10);
        }
    },
    {
        titulo: '👑 Renúncia do Governante em {pais}!',
        desc: 'Pressionado, governante renuncia! Crise de sucessão, instabilidade política.',
        efeito: (p) => {
            db.subtract(`pais_${p}.aprovacaoPopular`, 15);
            db.add(`pais_${p}.inflacao`, 0.05);
            db.subtract(`pais_${p}.produtividade`, 0.08);
        }
    },
    {
        titulo: '🗳️ Eleições Antecipadas em {pais}!',
        desc: 'Parlamento dissolve governo! Novas eleições convocadas, incerteza nos mercados.',
        efeito: (p) => {
            db.subtract(`pais_${p}.reputacaoDiplomatica`, 5);
            db.add(`pais_${p}.inflacao`, 0.03);
        }
    },
    {
        titulo: '📢 Greve Geral paralisa {pais}!',
        desc: 'Sindicatos paralisam o país! {valor}% da produção interrompida.',
        efeito: (p) => {
            db.subtract(`pais_${p}.produtividade`, 0.2);
            db.subtract(`pais_${p}.tesouro`, Math.floor((db.get(`pais_${p}.tesouro`) || 0) * 0.08));
        }
    },
    {
        titulo: '🕊️ Acordo de Paz histórico em {pais}!',
        desc: 'Após décadas, paz é declarada! População celebra, diplomatas elogiados.',
        efeito: (p) => {
            db.add(`pais_${p}.aprovacaoPopular`, 30);
            db.add(`pais_${p}.reputacaoDiplomatica`, 20);
            db.subtract(`pais_${p}.inflacao`, 0.03);
        }
    },
    {
        titulo: '🔒 Estado de Sítio em {pais}!',
        desc: 'Toque de recolher! Exército nas ruas, liberdades suspensas.',
        efeito: (p) => {
            db.subtract(`pais_${p}.aprovacaoPopular`, 20);
            db.subtract(`pais_${p}.reputacaoDiplomatica`, 15);
            db.subtract(`pais_${p}.produtividade`, 0.15);
        }
    },
    {
        titulo: '👥 Revolta Popular em {pais}!',
        desc: 'População se rebela! Prédios públicos incendiados, caos nas ruas.',
        efeito: (p) => {
            db.subtract(`pais_${p}.infraestrutura`, 0.5);
            db.subtract(`pais_${p}.aprovacaoPopular`, 35);
            db.subtract(`pais_${p}.tesouro`, Math.floor((db.get(`pais_${p}.tesouro`) || 0) * 0.1));
        }
    },
    {
        titulo: '⚖️ Impeachment aprovado em {pais}!',
        desc: 'Governante sofre impeachment! País dividido, futuro incerto.',
        efeito: (p) => {
            db.subtract(`pais_${p}.aprovacaoPopular`, 20);
            db.subtract(`pais_${p}.reputacaoDiplomatica`, 10);
            db.add(`pais_${p}.inflacao`, 0.06);
        }
    },
    {
        titulo: '🌟 Reformas Históricas em {pais}!',
        desc: 'Governo aprova pacote de reformas! População esperançosa, investidores otimistas.',
        efeito: (p) => {
            db.add(`pais_${p}.aprovacaoPopular`, 20);
            db.add(`pais_${p}.reputacaoDiplomatica`, 10);
            db.add(`pais_${p}.produtividade`, 0.05);
        }
    }
];

// ================= 💰 EVENTOS ECONÔMICOS (10 eventos) =================
const eventosEconomicos = [
    {
        titulo: '📈 Boom Econômico em {pais}!',
        desc: 'PIB dispara! Desemprego em mínima histórica, consumo nas alturas.',
        efeito: (p) => {
            db.add(`pais_${p}.pib`, Math.floor((db.get(`pais_${p}.pib`) || 10000) * 0.2));
            db.add(`pais_${p}.tesouro`, Math.floor((db.get(`pais_${p}.tesouro`) || 0) * 0.15));
            db.add(`pais_${p}.aprovacaoPopular`, 12);
        }
    },
    {
        titulo: '📉 Recessão atinge {pais}!',
        desc: 'PIB encolhe {valor}%! Empresas fecham, desemprego dispara.',
        efeito: (p) => {
            db.subtract(`pais_${p}.pib`, Math.floor((db.get(`pais_${p}.pib`) || 10000) * 0.12));
            db.subtract(`pais_${p}.tesouro`, Math.floor((db.get(`pais_${p}.tesouro`) || 0) * 0.1));
            db.subtract(`pais_${p}.aprovacaoPopular`, 15);
        }
    },
    {
        titulo: '💱 Moeda de {pais} entra em colapso!',
        desc: 'Desvalorização de {valor}%! Importações param, inflação explode.',
        efeito: (p) => {
            db.subtract(`pais_${p}.valorMoeda`, 0.4);
            db.add(`pais_${p}.inflacao`, 0.25);
            db.subtract(`pais_${p}.aprovacaoPopular`, 20);
        }
    },
    {
        titulo: '🏦 Banco Central de {pais} intervém!',
        desc: 'Taxa de juros nas alturas! Inflação controlada, mas economia desacelera.',
        efeito: (p) => {
            db.subtract(`pais_${p}.inflacao`, 0.08);
            db.subtract(`pais_${p}.produtividade`, 0.05);
        }
    },
    {
        titulo: '🛢️ Descoberta de Petróleo em {pais}!',
        desc: 'Reservas gigantes encontradas! +{valor} milhões de barris. Economia transformada.',
        efeito: (p) => {
            db.add(`pais_${p}.petroleo`, 500000);
            db.add(`pais_${p}.tesouro`, Math.floor((db.get(`pais_${p}.tesouro`) || 0) * 0.2));
        }
    },
    {
        titulo: '💎 Descoberta de Diamantes em {pais}!',
        desc: 'Mina riquíssima encontrada! +{valor} diamantes. Corrida por recursos.',
        efeito: (p) => {
            db.add(`pais_${p}.diamante`, 1000);
            db.add(`pais_${p}.tesouro`, Math.floor((db.get(`pais_${p}.tesouro`) || 0) * 0.1));
        }
    },
    {
        titulo: '📊 Bolsa de {pais} atinge recorde!',
        desc: 'Investidores eufóricos! Mercado sobe {valor}%, riqueza nacional aumenta.',
        efeito: (p) => {
            db.add(`pais_${p}.pib`, Math.floor((db.get(`pais_${p}.pib`) || 10000) * 0.1));
            db.add(`pais_${p}.aprovacaoPopular`, 5);
        }
    },
    {
        titulo: '🏭 Indústria de {pais} em colapso!',
        desc: 'Fábricas fecham em massa! {valor}% dos empregos industriais perdidos.',
        efeito: (p) => {
            db.subtract(`pais_${p}.produtividade`, 0.15);
            db.subtract(`pais_${p}.aprovacaoPopular`, 12);
        }
    },
    {
        titulo: '🌾 Agronegócio de {pais} bate recorde!',
        desc: 'Safra histórica! Exportações disparam, comida abundante.',
        efeito: (p) => {
            db.add(`pais_${p}.agricultura`, Math.floor((db.get(`pais_${p}.agricultura`) || 0) * 0.3));
            db.add(`pais_${p}.comida`, Math.floor((db.get(`pais_${p}.comida`) || 0) * 0.2));
        }
    },
    {
        titulo: '🚢 Embarque comercial de {pais} afunda!',
        desc: 'Navio cargueiro naufraga! {valor}% das exportações perdidas.',
        efeito: (p) => {
            db.subtract(`pais_${p}.tesouro`, Math.floor((db.get(`pais_${p}.tesouro`) || 0) * 0.05));
            db.subtract(`pais_${p}.exportacoes`, Math.floor((db.get(`pais_${p}.exportacoes`) || 0) * 0.1));
        }
    }
];

// ================= 🦠 SAÚDE (8 eventos) =================
const eventosSaude = [
    {
        titulo: '🦠 Pandemia atinge {pais}!',
        desc: 'Nova variante viral! {valor}% da população infectada. Hospitais em colapso.',
        efeito: (p) => {
            const pop = db.get(`pais_${p}.populacao`) || 0;
            db.add(`pais_${p}.doentes_ativos`, Math.floor(pop * 0.08));
            db.subtract(`pais_${p}.produtividade`, 0.1);
        }
    },
    {
        titulo: '💉 Vacinação em massa em {pais}!',
        desc: 'Campanha nacional de vacinação! {valor}% da população imunizada.',
        efeito: (p) => {
            db.subtract(`pais_${p}.doentes_ativos`, Math.floor((db.get(`pais_${p}.doentes_ativos`) || 0) * 0.5));
            db.add(`pais_${p}.aprovacaoPopular`, 8);
        }
    },
    {
        titulo: '🏥 Hospitais de {pais} entram em colapso!',
        desc: 'Superlotação total! Pacientes nos corredores, faltam médicos e remédios.',
        efeito: (p) => {
            db.subtract(`pais_${p}.aprovacaoPopular`, 15);
            reduzirPopulacao(p, Math.floor((db.get(`pais_${p}.populacao`) || 0) * 0.01));
        }
    },
    {
        titulo: '🦟 Epidemia de Dengue em {pais}!',
        desc: 'Mosquito transmissor se prolifera! {valor}% da população contaminada.',
        efeito: (p) => {
            const pop = db.get(`pais_${p}.populacao`) || 0;
            db.add(`pais_${p}.doentes_ativos`, Math.floor(pop * 0.05));
            db.subtract(`pais_${p}.produtividade`, 0.05);
        }
    },
    {
        titulo: '🧪 Cura descoberta em {pais}!',
        desc: 'Cientistas encontram cura para doença! Mortalidade reduzida drasticamente.',
        efeito: (p) => {
            db.subtract(`pais_${p}.doentes_ativos`, Math.floor((db.get(`pais_${p}.doentes_ativos`) || 0) * 0.8));
            db.add(`pais_${p}.reputacaoDiplomatica`, 10);
        }
    },
    {
        titulo: '🚑 Greve de Médicos em {pais}!',
        desc: 'Médicos paralisam atendimentos! População sem assistência, caos na saúde.',
        efeito: (p) => {
            db.subtract(`pais_${p}.aprovacaoPopular`, 10);
            db.add(`pais_${p}.doentes_ativos`, Math.floor((db.get(`pais_${p}.populacao`) || 0) * 0.02));
        }
    },
    {
        titulo: '🧬 Avanço Genético em {pais}!',
        desc: 'Cientistas decifram genoma! Nova era da medicina personalizada.',
        efeito: (p) => {
            db.add(`pais_${p}.reputacaoDiplomatica`, 15);
            db.add(`pais_${p}.produtividade`, 0.03);
        }
    },
    {
        titulo: '💊 Crise de Medicamentos em {pais}!',
        desc: 'Farmácias vazias! População sem acesso a remédios básicos.',
        efeito: (p) => {
            db.subtract(`pais_${p}.aprovacaoPopular`, 12);
            db.add(`pais_${p}.inflacao`, 0.03);
        }
    }
];

// ================= ⚔️ EVENTOS MILITARES (8 eventos) =================
const eventosMilitares = [
    {
        titulo: '⚔️ Conflito Armado explode em {pais}!',
        desc: 'Rebeldes atacam capital! {valor}% do exército mobilizado. Zonas de guerra.',
        efeito: (p) => {
            db.subtract(
                `pais_${p}.exercito.infantaria`,
                Math.floor((db.get(`pais_${p}.exercito.infantaria`) || 0) * 0.1)
            );
            db.subtract(`pais_${p}.infraestrutura`, 0.8);
            reduzirPopulacao(p, Math.floor((db.get(`pais_${p}.populacao`) || 0) * 0.01));
        }
    },
    {
        titulo: '☢️ Teste Nuclear de {pais} assusta mundo!',
        desc: 'Ogiva testada com sucesso! Comunidade internacional condena.',
        efeito: (p) => {
            db.subtract(`pais_${p}.reputacaoDiplomatica`, 20);
            db.add(`pais_${p}.bombasNucleares`, 1);
        }
    },
    {
        titulo: '🛡️ Aliança militar fortalecida em {pais}!',
        desc: 'Novos acordos de defesa assinados! Poder militar ampliado.',
        efeito: (p) => {
            db.add(`pais_${p}.reputacaoDiplomatica`, 8);
            db.add(`pais_${p}.aprovacaoPopular`, 5);
        }
    },
    {
        titulo: '🚀 Míssil de {pais} atinge país vizinho!',
        desc: 'Tensão internacional! Risco de guerra regional, sanções aplicadas.',
        efeito: (p) => {
            db.subtract(`pais_${p}.reputacaoDiplomatica`, 30);
            db.subtract(`pais_${p}.tesouro`, Math.floor((db.get(`pais_${p}.tesouro`) || 0) * 0.15));
        }
    },
    {
        titulo: '🪖 Exército de {pais} modernizado!',
        desc: 'Novos equipamentos adquiridos! Poder militar aumenta significativamente.',
        efeito: (p) => {
            db.add(`pais_${p}.exercito.tanques`, 1000);
            db.add(`pais_${p}.exercito.avioes`, 200);
            db.subtract(`pais_${p}.tesouro`, Math.floor((db.get(`pais_${p}.tesouro`) || 0) * 0.1));
        }
    },
    {
        titulo: '💣 Atentado terrorista em {pais}!',
        desc: 'Explosões abalam capital! Dezenas de mortos, pânico generalizado.',
        efeito: (p) => {
            reduzirPopulacao(p, Math.floor((db.get(`pais_${p}.populacao`) || 0) * 0.003));
            db.subtract(`pais_${p}.aprovacaoPopular`, 10);
        }
    },
    {
        titulo: '🕊️ Desmilitarização em {pais}!',
        desc: 'Exército reduzido! Recursos redirecionados para saúde e educação.',
        efeito: (p) => {
            db.subtract(
                `pais_${p}.exercito.infantaria`,
                Math.floor((db.get(`pais_${p}.exercito.infantaria`) || 0) * 0.3)
            );
            db.add(`pais_${p}.aprovacaoPopular`, 10);
        }
    },
    {
        titulo: '🔫 Golpe militar frustrado em {pais}!',
        desc: 'Tentativa de golpe fracassa! Conspiradores presos, instituições fortalecidas.',
        efeito: (p) => {
            db.add(`pais_${p}.aprovacaoPopular`, 10);
            db.subtract(`pais_${p}.reputacaoDiplomatica`, 5);
        }
    }
];

// ================= 🎉 EVENTOS POSITIVOS ALEATÓRIOS (8 eventos) =================
const eventosPositivos = [
    {
        titulo: '🏆 {pais} ganha prêmio internacional!',
        desc: 'Reconhecimento global por avanços em direitos humanos!',
        efeito: (p) => {
            db.add(`pais_${p}.reputacaoDiplomatica`, 15);
            db.add(`pais_${p}.aprovacaoPopular`, 10);
        }
    },
    {
        titulo: '🎨 Festival cultural de {pais} atrai milhões!',
        desc: 'Turismo dispara! Economia aquecida, imagem internacional melhorada.',
        efeito: (p) => {
            db.add(`pais_${p}.tesouro`, Math.floor((db.get(`pais_${p}.populacao`) || 0) * 0.002));
            db.add(`pais_${p}.reputacaoDiplomatica`, 5);
        }
    },
    {
        titulo: '🚀 {pais} lança satélite com sucesso!',
        desc: 'Novo satélite em órbita! Orgulho nacional, avanço tecnológico.',
        efeito: (p) => {
            db.add(`pais_${p}.reputacaoDiplomatica`, 10);
            db.add(`pais_${p}.produtividade`, 0.02);
        }
    },
    {
        titulo: '📚 Educação de {pais} é destaque mundial!',
        desc: 'Estudantes batem recordes em avaliações internacionais!',
        efeito: (p) => {
            db.add(`pais_${p}.produtividade`, 0.05);
            db.add(`pais_${p}.aprovacaoPopular`, 8);
        }
    },
    {
        titulo: '🌳 {pais} lidera preservação ambiental!',
        desc: 'Desmatamento zero! Reconhecimento global por políticas verdes.',
        efeito: (p) => {
            db.add(`pais_${p}.reputacaoDiplomatica`, 12);
            db.add(`pais_${p}.aprovacaoPopular`, 8);
        }
    },
    {
        titulo: '🏗️ Megaprojeto concluído em {pais}!',
        desc: 'Obra faraônica finalizada! Infraestrutura nacional transformada.',
        efeito: (p) => {
            db.add(`pais_${p}.infraestrutura`, 1);
            db.add(`pais_${p}.aprovacaoPopular`, 10);
        }
    },
    {
        titulo: '💡 Inventor de {pais} revoluciona tecnologia!',
        desc: 'Patente milionária registrada! País na vanguarda da inovação.',
        efeito: (p) => {
            db.add(`pais_${p}.produtividade`, 0.08);
            db.add(`pais_${p}.tesouro`, Math.floor((db.get(`pais_${p}.tesouro`) || 0) * 0.05));
        }
    },
    {
        titulo: '🤝 {pais} sedia cúpula internacional!',
        desc: 'Líderes mundiais se reúnem! País no centro da diplomacia global.',
        efeito: (p) => {
            db.add(`pais_${p}.reputacaoDiplomatica`, 20);
            db.subtract(`pais_${p}.tesouro`, Math.floor((db.get(`pais_${p}.tesouro`) || 0) * 0.02));
        }
    }
];

// ================= FUNÇÕES =================
function getRegiao(pais) {
    const regioes = {
        asia: [
            'china',
            'japão',
            'índia',
            'indonésia',
            'filipinas',
            'tailândia',
            'coreia-do-sul',
            'norte-coreia',
            'taiwan',
            'singapura',
            'malásia',
            'vietnã'
        ],
        americas: [
            'eua',
            'canadá',
            'mexico',
            'brasil',
            'argentina',
            'colômbia',
            'chile',
            'peru',
            'venezuela',
            'cuba',
            'equador',
            'bolivia',
            'paraguai',
            'uruguai'
        ],
        europa: [
            'reino-unido',
            'frança',
            'alemanha',
            'itália',
            'espanha',
            'portugal',
            'holanda',
            'suíça',
            'suécia',
            'noruega',
            'polônia',
            'ucrânia',
            'grécia',
            'finlândia',
            'dinamarca'
        ],
        oriente_medio: ['arábia-saudita', 'irã', 'iraque', 'israel', 'emirados-árabes', 'turquia', 'egito']
    };
    for (const [regiao, paises] of Object.entries(regioes)) {
        if (paises.includes(pais)) return regiao;
    }
    return 'global';
}

function getEventoAleatorio(lista) {
    return lista[Math.floor(Math.random() * lista.length)];
}

// ⚡ FUNÇÃO PRINCIPAL
function gerarEventoImpactante(pais) {
    const regiao = getRegiao(pais);
    const todasListas = [];

    // 25% desastre regional
    if (desastresPorRegiao[regiao] && Math.random() < 0.25) {
        const evento = getEventoAleatorio(desastresPorRegiao[regiao]);
        const valor = Math.floor(Math.random() * 5) + 3;
        const valor2 = Math.floor(Math.random() * 30) + 10;
        const titulo = evento.titulo.replace('{pais}', pais).replace('{valor}', valor).replace('{valor2}', valor2);
        const desc = evento.desc.replace('{pais}', pais).replace('{valor}', valor).replace('{valor2}', valor2);
        if (evento.efeito) evento.efeito(pais);
        return { titulo, descricao: desc, tipo: 'desastre', impacto: 'negativo', timestamp: Date.now(), pais };
    }

    // Escolhe categoria aleatória
    const categoria = getEventoAleatorio([
        crisesPoliticas,
        eventosEconomicos,
        eventosSaude,
        eventosMilitares,
        eventosPositivos
    ]);
    const evento = getEventoAleatorio(categoria);
    const valor = Math.floor(Math.random() * 20) + 5;
    const titulo = evento.titulo.replace('{pais}', pais).replace('{valor}', valor);
    const desc = evento.desc.replace('{pais}', pais).replace('{valor}', valor);
    if (evento.efeito) evento.efeito(pais);

    const impacto = categoria === eventosPositivos ? 'positivo' : categoria === crisesPoliticas ? 'negativo' : 'neutro';
    return {
        titulo,
        descricao: desc,
        tipo:
            categoria === crisesPoliticas
                ? 'politico'
                : categoria === eventosSaude
                  ? 'social'
                  : categoria === eventosMilitares
                    ? 'militar'
                    : categoria === eventosPositivos
                      ? 'social'
                      : 'economia',
        impacto,
        timestamp: Date.now(),
        pais
    };
}

// ================= FUNÇÕES ANTIGAS (COMPATIBILIDADE) =================
function gerarNoticia(pais, pais2 = null) {
    return gerarEventoImpactante(pais);
}
function gerarNoticiaEleicao(pais, candidato, votos) {
    return {
        titulo: `🗳️ Eleição em ${pais}`,
        descricao: `**${candidato}** venceu com **${votos}%** em **${pais}**.`,
        tipo: 'eleicao',
        impacto: 'neutro',
        timestamp: Date.now(),
        pais
    };
}
function gerarNoticiaLei(pais, lei, aprovada) {
    return {
        titulo: `${aprovada ? '✅' : '❌'} Lei ${aprovada ? 'Aprovada' : 'Vetada'} em ${pais}`,
        descricao: `**${pais}**: ${lei.titulo}`,
        tipo: 'lei',
        impacto: aprovada ? 'positivo' : 'neutro',
        timestamp: Date.now(),
        pais
    };
}
function gerarNoticiaRota(pais, pais2, tipo) {
    return {
        titulo: '🚢 Comércio Internacional',
        descricao: `**${pais}** ${tipo === 'abrir' ? 'abriu' : 'encerrou'} rota com **${pais2}**.`,
        tipo: 'comercio',
        impacto: 'positivo',
        timestamp: Date.now(),
        pais
    };
}

module.exports = {
    gerarNoticia,
    gerarNoticiaEleicao,
    gerarNoticiaLei,
    gerarNoticiaRota,
    gerarEventoImpactante
};
