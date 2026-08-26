const Discord = require('discord.js');
const db = require('../systems/rpg-db');

exports.run = async (client, message, args) => {
    const noticias = db.get('noticias_globais') || [];
    const pagina = parseInt(args[0]) || 1;
    const porPagina = 5;
    const inicio = (pagina - 1) * porPagina;
    const totalPaginas = Math.ceil(noticias.length / porPagina) || 1;

    if (noticias.length === 0) {
        return message.channel.send(`📰 | Nenhuma notícia internacional disponível ainda. O motor de países está gerando eventos automaticamente!`);
    }

    const slice = noticias.slice(inicio, inicio + porPagina);
    const emoji = { positivo: '📈', negativo: '📉', neutro: '📰', tenso: '⚠️', desastre: '🆘', militar: '⚔️', economia: '💹', social: '👥', agricultura: '🌾' };

    let descricao = slice.map((n, i) => {
        const data = new Date(n.timestamp).toLocaleString('pt-BR');
        return `${emoji[n.tipo] || '📰'} **${n.titulo}**\n${n.descricao}\n🕐 *${data}*`;
    }).join('\n\n');

    const embed = new Discord.EmbedBuilder()
        .setTitle('🌍 Notícias Internacionais')
        .setDescription(descricao || 'Sem notícias.')
        .setColor('#3498db')
        .setFooter({ text: `Página ${pagina}/${totalPaginas} • Use B!noticias-internacionais <página>` })
        .setTimestamp();

    message.channel.send({ embeds: [embed] });
};
