const Discord = require('discord.js');
const db = require('../systems/rpg-db');
const { conferirPais } = require('../systems/pais-conferencia');
const { getDadosPais } = require('../systems/real-countries-data');

function formatarNumero(valor) {
    return Number(valor || 0).toLocaleString('pt-BR');
}

exports.run = async (client, message, args) => {
    const nomePais = (args[0] || db.get(`${message.author.id}.pais`) || '').toLowerCase();
    if (!nomePais) return message.channel.send('❌ Informe um país ou registre-se em um país primeiro.');

    const pais = db.get(`pais_${nomePais}`);
    if (!pais) return message.channel.send(`❌ País **${nomePais}** não encontrado.`);
    if (args[0] && pais.governador !== message.author.id) {
        return message.channel.send('❌ Apenas o governador pode consultar a conferência de outro país.');
    }

    const resultado = conferirPais(nomePais);
    const dados = getDadosPais(nomePais);
    const tituloPais = `${dados?.bandeira || pais.bandeira || '🏳️'} ${dados?.nomeFormal || pais.nomeFormal || nomePais}`;
    const anomalias = resultado.anomalias.length
        ? resultado.anomalias
              .map(
                  (anomalia) =>
                      `${anomalia.severidade === 'critica' ? '🚨' : anomalia.severidade === 'alta' ? '🔴' : '🟡'} **${anomalia.codigo}** — ${anomalia.mensagem}\nCampos: ${anomalia.campos.join(', ') || 'estado'}`
              )
              .join('\n\n')
        : '✅ Nenhuma anomalia detectada nas relações verificadas.';
    const indicadores = resultado.indicadores;

    const embed = new Discord.EmbedBuilder()
        .setTitle(`🔎 Conferência Nacional — ${tituloPais}`)
        .setColor(resultado.ok ? 0x2ecc71 : 0xe67e22)
        .setDescription(
            `${resultado.ok ? 'Estado consistente nas verificações atuais.' : 'Foram encontradas diferenças que precisam de análise.'}\n` +
                'A conferência é somente leitura: nenhum valor foi alterado automaticamente.'
        )
        .addFields(
            { name: '📋 Anomalias', value: anomalias, inline: false },
            {
                name: '📊 Indicadores derivados',
                value:
                    `👥 População: **${formatarNumero(indicadores.populacao)}**\n` +
                    `💰 PIB: **${formatarNumero(indicadores.pib)}**\n` +
                    `⚔️ Força bruta: **${formatarNumero(indicadores.forca)}**\n` +
                    `⚡ Energia: **${formatarNumero(indicadores.energia.saldo)} MW**\n` +
                    `🌾 Produção estimada: **${formatarNumero(indicadores.producaoAgricolaEstimada)}**`,
                inline: false
            }
        )
        .setFooter({ text: `Verificado em ${new Date(resultado.verificadoEm).toLocaleString('pt-BR')}` })
        .setTimestamp();

    return message.channel.send({ embeds: [embed] });
};
