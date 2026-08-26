const Discord = require('discord.js');
const db = require('../systems/rpg-db');
const { PAISES_REAIS } = require('../systems/real-countries-data');

exports.run = async (client, message, args) => {
    const primeiroArg = args[0];
const numero = Number(primeiroArg);

const ehPagina = primeiroArg !== undefined && Number.isInteger(numero);

const filtro = !ehPagina && primeiroArg
    ? primeiroArg.toLowerCase()
    : null;

const pagina = ehPagina
    ? numero
    : Number(args[1]) || 1;
    const porPagina = 15;

    let lista = PAISES_REAIS;
    if (filtro) {
        lista = PAISES_REAIS.filter(p =>
            p.nome.includes(filtro) ||
            p.nomeFormal.toLowerCase().includes(filtro) ||
            p.personalidade.includes(filtro)
        );
    }

    const inicio = (pagina - 1) * porPagina;
    const totalPaginas = Math.ceil(lista.length / porPagina) || 1;
    const slice = lista.slice(inicio, inicio + porPagina);

    const linhas = slice.map(p => {
        const paisDB = db.get(`pais_${p.nome}`);
        const status = !paisDB ? '⚫' : paisDB.isNPC ? '🤖' : '👤';
        const dono = !paisDB ? '*não iniciado*' : paisDB.isNPC ? '*IA*' : '*Jogador*';
        return `${status} ${p.bandeira} **${p.nomeFormal}** — \`${p.nome}\`\n   💱 ${p.moeda} • 🌍 ${dono}`;
    }).join('\n\n');

    const embed = new Discord.EmbedBuilder()
        .setTitle('🌍 Países Disponíveis no RPG')
        .setDescription(linhas || 'Nenhum país encontrado.')
        .setColor('#3498db')
        .addFields({ name: '📖 Legenda', value: '🤖 Controlado por IA (pode assumir) | 👤 Controlado por jogador | ⚫ Ainda não iniciado', inline: false })
        .setFooter({ text: `Página ${pagina}/${totalPaginas} • B!lista-paises [filtro] [página] • Total: ${lista.length} países` })
        .setTimestamp();

    message.channel.send({ embeds: [embed] });
};
