const Discord = require('discord.js');
const db = require('../systems/rpg-db');

exports.run = async (client, message, args) => {
    const nomePais = args[0] || db.get(`${message.author.id}.pais`);
    if (!nomePais) return message.channel.send(`<:recusado:1031262539272687777>**|** Informe o país ou registre-se em um com \`B!criarpais\`.`);

    const pais = db.get(`pais_${nomePais}`);
    if (!pais) return message.channel.send(`<:recusado:1031262539272687777>**|** País **${nomePais}** não encontrado!`);

    const noticias = db.get(`noticias_${nomePais}`) || [];
    const pagina = parseInt(args[1]) || 1;
    const porPagina = 5;
    const inicio = (pagina - 1) * porPagina;
    const totalPaginas = Math.ceil(noticias.length / porPagina) || 1;

    if (noticias.length === 0) {
        return message.channel.send(`📰 | Nenhuma notícia nacional disponível para **${nomePais}** ainda.`);
    }

    const slice = noticias.slice(inicio, inicio + porPagina);
    const emoji = { positivo: '📈', negativo: '📉', neutro: '📰', tenso: '⚠️', governo: '🏛️', lei: '📜', eleicao: '🗳️', social: '👥', desastre: '🆘' };

    const descricao = slice.map(n => {
        const data = new Date(n.timestamp).toLocaleString('pt-BR');
        return `${emoji[n.tipo] || '📰'} **${n.titulo}**\n${n.descricao}\n🕐 *${data}*`;
    }).join('\n\n');

    const embed = new Discord.EmbedBuilder()
        .setTitle(`📰 Notícias Nacionais — ${nomePais}`)
        .setDescription(descricao)
        .setColor('#9b59b6')
        .setFooter({ text: `Página ${pagina}/${totalPaginas} • B!noticias-nacionais ${nomePais} <página>` })
        .setTimestamp();

    message.channel.send({ embeds: [embed] });
};
