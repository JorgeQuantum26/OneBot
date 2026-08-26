const Discord = require('discord.js');
const db = require('../systems/rpg-db');
const { getDadosPais } = require('../systems/real-countries-data');

exports.run = async (client, message, args) => {
    const listaPaises = db.get('lista_paises') || [];
    if (listaPaises.length === 0) return message.channel.send(`📊 Nenhum país registrado ainda.`);

    const paisesComCambio = listaPaises
        .map(nome => {
            const pais = db.get(`pais_${nome}`);
            if (!pais) return null;
            const dados = getDadosPais(nome);
            const historico = db.get(`pais_${nome}.historicoCambio`) || [];
            return {
                nome: dados ? dados.nomeFormal : nome,
                bandeira: dados?.bandeira || '🏳️',
                moeda: pais.moeda || 'Moeda Desconhecida',
                simbolo: pais.simboloMoeda || '?',
                valor: pais.valorMoeda || 1.0,
                inflacao: pais.inflacao || 0.05,
                historico: historico,
                tesouro: pais.tesouro || 0,
                pib: pais.pib || 0
            };
        })
        .filter(Boolean)
        .sort((a, b) => b.valor - a.valor);

    const formatarTendencia = (historico) => {
        if (!historico || historico.length < 2) return { emoji: '➡️', texto: 'Estável', variacao: '0.00%' };
        const ultimo = historico[historico.length - 1];
        const anterior = historico[historico.length - 2];
        if (anterior === 0 || !anterior) return { emoji: '➡️', texto: 'Estável', variacao: '0.00%' };
        const diff = (((ultimo - anterior) / anterior) * 100);
       if (diff > 0.01) return { emoji: '📈', texto: `Subindo +${diff.toFixed(2)}%`, variacao: `+${diff.toFixed(2)}%` };
if (diff < -0.01) return { emoji: '📉', texto: `Caindo ${diff.toFixed(2)}%`, variacao: `${diff.toFixed(2)}%` };
        return { emoji: '➡️', texto: 'Estável', variacao: `${diff.toFixed(2)}%` };
    };

    const corInflacao = (inf) => {
        if (inf > 0.15) return '🔴';
        if (inf > 0.08) return '🟠';
        if (inf > 0.05) return '🟡';
        if (inf < -0.02) return '🟣';
        if (inf < 0) return '🟢';
        return '⚪';
    };

    const embed = new Discord.EmbedBuilder()
        .setTitle('🏦 Bolsa Monetária Internacional')
        .setColor('#f1c40f')
        .setDescription('*Cotação das moedas no mercado global. Atualizado a cada ciclo.*\n');

    paisesComCambio.forEach((p, i) => {
        const tendencia = formatarTendencia(p.historico);
        const num = i + 1;
        const posicao = num === 1 ? '🥇' : num === 2 ? '🥈' : num === 3 ? '🥉' : `#${num}`;
        
        let texto = '';
        texto += `💵 **${p.simbolo} $${p.valor.toFixed(4)}** ${tendencia.emoji} ${tendencia.texto}\n`;
        texto += `${corInflacao(p.inflacao)} Inflação: **${(p.inflacao * 100).toFixed(2)}%**\n`;
        texto += `💰 PIB: **${p.pib.toLocaleString('pt-BR')}**\n`;
        texto += `🏦 Tesouro: **${p.tesouro.toLocaleString('pt-BR')}**`;
        
        embed.addFields({ name: `${posicao} ${p.bandeira} ${p.nome} — ${p.moeda}`, value: texto, inline: false });
    });

    const userId = message.author.id;
    const meuPaisNome = db.get(`${userId}.pais`);
    if (meuPaisNome) {
        const meu = paisesComCambio.find(p => {
            const dados = getDadosPais(meuPaisNome);
            return p.nome === (dados?.nomeFormal || meuPaisNome);
        });
        if (meu) {
            const minhaPosicao = paisesComCambio.indexOf(meu) + 1;
            const tendencia = formatarTendencia(meu.historico);
            embed.addFields({ name: '📍 Sua Moeda', value: `${meu.bandeira} **${meu.nome}** • Posição: **#${minhaPosicao} de ${paisesComCambio.length}**\n` +
                `💵 ${meu.simbolo} **$${meu.valor.toFixed(4)}** ${tendencia.emoji} ${tendencia.texto}\n` +
                `${corInflacao(meu.inflacao)} Inflação: **${(meu.inflacao * 100).toFixed(2)}%**\n` +
                `💰 PIB: **${meu.pib.toLocaleString('pt-BR')}**\n` +
                `🏦 Tesouro: **${meu.tesouro.toLocaleString('pt-BR')}**`, inline: false });
        }
    }

    embed.setFooter({ text: '📈 Sobe | 📉 Cai | ➡️ Estável | Ciclo de 1 minuto' })
         .setTimestamp();

    message.channel.send({ embeds: [embed] });
};