const { createCanvas } = require('@napi-rs/canvas');
const atlas = require('world-atlas/countries-110m.json');
const { feature } = require('topojson-client');

const WORLD = feature(atlas, atlas.objects.countries).features;
const COORDENADAS = {
    brasil: [-51, -10],
    argentina: [-64, -34],
    mexico: [-102, 23],
    eua: [-100, 38],
    canadá: [-106, 57],
    china: [104, 35],
    rússia: [90, 60],
    ucrânia: [32, 49],
    polônia: [19, 52],
    alemanha: [10, 51],
    frança: [2, 46],
    espanha: [-4, 40],
    portugal: [-8, 39],
    itália: [12, 42],
    holanda: [5, 52],
    'coreia-do-sul': [128, 36],
    japão: [138, 36],
    índia: [79, 22],
    paquistão: [69, 30],
    indonésia: [117, -2],
    filipinas: [122, 12],
    'africa-do-sul': [24, -29],
    egito: [30, 27],
    nigéria: [8, 9],
    'emirados-árabes': [54, 24],
    'arábia-saudita': [45, 24],
    irã: [53, 32],
    turquia: [35, 39],
    israel: [35, 31],
    austrália: [134, -25]
};

function projetar([lon, lat], width, height) {
    return [((lon + 180) * width) / 360, ((90 - lat) * height) / 180];
}

function desenharGeometria(ctx, geometry, projetarPonto) {
    const poligonos = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
    for (const poligono of poligonos) {
        for (const anel of poligono) {
            anel.forEach((ponto, index) => {
                const [x, y] = projetarPonto(ponto);
                if (index === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.closePath();
        }
    }
}

function localizarPais(nome) {
    const aliases = {
        brasil: 'Brazil',
        argentina: 'Argentina',
        mexico: 'Mexico',
        eua: 'United States of America',
        canadá: 'Canada',
        china: 'China',
        rússia: 'Russia',
        ucrânia: 'Ukraine',
        polônia: 'Poland',
        alemanha: 'Germany',
        frança: 'France',
        espanha: 'Spain',
        portugal: 'Portugal',
        itália: 'Italy',
        holanda: 'Netherlands',
        japão: 'Japan',
        índia: 'India',
        'coreia-do-sul': 'South Korea',
        paquistão: 'Pakistan',
        indonésia: 'Indonesia',
        filipinas: 'Philippines',
        'africa-do-sul': 'South Africa',
        egito: 'Egypt',
        nigéria: 'Nigeria',
        turquia: 'Turkey',
        israel: 'Israel',
        austrália: 'Australia'
    };
    return WORLD.find((pais) => pais.properties && pais.properties.name === aliases[nome]);
}

function pintarPais(ctx, nome, color, width, height, alpha) {
    const pais = localizarPais(nome);
    if (!pais) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    desenharGeometria(ctx, pais.geometry, (ponto) => projetar(ponto, width, height));
    ctx.fill();
    ctx.restore();
}

function contarBases(pais, alvo, basesRegistradas) {
    const basesDoPais = Array.isArray(pais?.bases_militares) ? pais.bases_militares : [];
    const basesNoTeatro = basesDoPais.filter((base) => base.pais === alvo).length;
    return Math.max(basesNoTeatro, Array.isArray(basesRegistradas) ? basesRegistradas.length : 0);
}

function desenharPainelGuerra(ctx, guerra, atacante, defensor, width) {
    const ocupacao = Math.max(0, Math.min(100, Number(guerra.ocupacao?.percentual) || 0));
    const batalhas = Array.isArray(guerra.batalhas) ? guerra.batalhas.length : 0;
    const pontuacaoAtacante = Number(guerra.pontuacao?.atacante) || 0;
    const pontuacaoDefensor = Number(guerra.pontuacao?.defensor) || 0;
    const basesAtacante = contarBases(atacante, guerra.defensor, guerra.bases?.atacante);
    const basesDefensor = contarBases(defensor, guerra.atacante, guerra.bases?.defensor);

    ctx.fillStyle = 'rgba(10, 18, 27, 0.94)';
    ctx.fillRect(width - 480, 145, 430, 245);
    ctx.strokeStyle = '#557080';
    ctx.lineWidth = 2;
    ctx.strokeRect(width - 480, 145, 430, 245);
    ctx.fillStyle = '#f4f7f8';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('SITUAÇÃO ATUAL DO TEATRO', width - 450, 180);
    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#f3d35b';
    ctx.fillText(`Ocupação: ${ocupacao.toFixed(1)}% do defensor`, width - 450, 215);
    ctx.fillStyle = '#55b5ff';
    ctx.fillText(`Atacante: ${pontuacaoAtacante}%  •  Bases: ${basesAtacante}`, width - 450, 250);
    ctx.fillStyle = '#ff7070';
    ctx.fillText(`Defensor: ${pontuacaoDefensor}%  •  Bases: ${basesDefensor}`, width - 450, 285);
    ctx.fillStyle = '#f4f7f8';
    ctx.fillText(`Batalhas registradas: ${batalhas}`, width - 450, 320);
    ctx.fillText(
        `Baixas: ${Number(guerra.baixasAtacante || 0).toLocaleString('pt-BR')} x ${Number(guerra.baixasDefensor || 0).toLocaleString('pt-BR')}`,
        width - 450,
        355
    );
    ctx.fillStyle = '#aab8c2';
    ctx.font = '16px sans-serif';
    ctx.fillText(`Teatro: ${defensor?.nomeFormal || guerra.defensor}`, width - 450, 380);
}

function desenharPonto(ctx, nome, color, width, height) {
    const coordenada = COORDENADAS[nome];
    if (!coordenada) return;
    const [x, y] = projetar(coordenada, width, height);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
}

async function renderizarFront(guerra, atacante, defensor) {
    const width = 1600;
    const height = 900;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    const progresso = Math.max(0, Math.min(100, Number(guerra.progresso) || 0));
    const pontoAtacante = projetar(COORDENADAS[guerra.atacante] || [0, 0], width, height);
    const pontoDefensor = projetar(COORDENADAS[guerra.defensor] || [0, 0], width, height);

    ctx.fillStyle = '#0d1721';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#172734';
    ctx.fillRect(0, 0, width, 115);
    ctx.strokeStyle = '#557080';
    ctx.lineWidth = 1;
    for (const pais of WORLD) {
        ctx.beginPath();
        desenharGeometria(ctx, pais.geometry, (ponto) => projetar(ponto, width, height));
        ctx.fillStyle = '#263d49';
        ctx.fill();
        ctx.stroke();
    }
    pintarPais(ctx, guerra.atacante, '#2d83c6', width, height, 0.82);
    pintarPais(ctx, guerra.defensor, '#b84747', width, height, 0.82);
    desenharPainelGuerra(ctx, guerra, atacante, defensor, width);
    const ocupacao = Math.max(0, Math.min(100, Number(guerra.ocupacao?.percentual) || progresso));
    ctx.save();
    ctx.globalAlpha = 0.34;
    pintarPais(ctx, guerra.defensor, '#f3d35b', width, height, ocupacao / 100);
    ctx.restore();

    for (const base of [...(guerra.bases?.atacante || []), ...(guerra.bases?.defensor || [])]) {
        desenharPonto(ctx, base.pais, base.pais === guerra.atacante ? '#55b5ff' : '#ff7070', width, height);
    }

    const frenteX = pontoDefensor[0] + (pontoAtacante[0] - pontoDefensor[0]) * (progresso / 100);
    const frenteY = pontoDefensor[1] + (pontoAtacante[1] - pontoDefensor[1]) * (progresso / 100);
    ctx.strokeStyle = '#f3d35b';
    ctx.lineWidth = 7;
    ctx.setLineDash([18, 12]);
    ctx.beginPath();
    ctx.moveTo(pontoDefensor[0], pontoDefensor[1]);
    ctx.lineTo(frenteX, frenteY);
    ctx.stroke();
    ctx.setLineDash([]);

    for (const [x, y, color] of [
        [pontoAtacante[0], pontoAtacante[1], '#55b5ff'],
        [pontoDefensor[0], pontoDefensor[1], '#ff7070']
    ]) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
    }
    ctx.fillStyle = '#f4f7f8';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText(`${atacante.nomeFormal || guerra.atacante}  x  ${defensor.nomeFormal || guerra.defensor}`, 42, 48);
    ctx.font = '22px sans-serif';
    ctx.fillText(`FRENTE • ${progresso}% avanço | TEATRO CONTROLADO • ${ocupacao}%`, 42, 84);
    ctx.fillStyle = '#55b5ff';
    ctx.fillText(`ATACANTE  ${guerra.atacante}`, 42, 855);
    ctx.fillStyle = '#ff7070';
    ctx.fillText(`DEFENSOR  ${guerra.defensor}`, 350, 855);
    ctx.fillStyle = '#f3d35b';
    ctx.fillText('--- linha de frente atual', 650, 855);
    ctx.fillStyle = '#f4f7f8';
    ctx.font = '20px sans-serif';
    ctx.fillText(
        `BATALHAS: ${(guerra.batalhas || []).length}  |  BASES: ${(guerra.bases?.atacante || []).length + (guerra.bases?.defensor || []).length}`,
        42,
        885
    );
    return canvas.encode('png');
}

module.exports = { renderizarFront };
