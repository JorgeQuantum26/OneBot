const Discord = require('discord.js');
const db = require('../systems/rpg-db');

exports.run = async (client, message, args) => {
    const nomePais = args[0] || db.get(`${message.author.id}.pais`);
    if (!nomePais) return message.channel.send(`<:recusado:1031262539272687777>**|** Informe o país ou registre-se em um.`);

    const pais = db.get(`pais_${nomePais}`);
    if (!pais) return message.channel.send(`<:recusado:1031262539272687777>**|** País não encontrado.`);

    const funcionarios = pais.funcionarios || [];
    const funcionariosIA = pais.funcionariosIA || [];

    let descricao = '';
    if (funcionarios.length > 0) {
        descricao += `**👤 Funcionários Reais:**\n`;
        descricao += funcionarios.map(f => `• **${f.cargo}** — ${f.tag}`).join('\n');
        descricao += '\n\n';
    }
    if (funcionariosIA.length > 0) {
        descricao += `**🤖 Funcionários IA:**\n`;
        descricao += funcionariosIA.map(f => `• **${f.cargo}** — ${f.nome} *(age automaticamente)*`).join('\n');
    }
    if (!descricao) descricao = '*Nenhum funcionário nomeado ainda.*';

    const embed = new Discord.EmbedBuilder()
        .setTitle(`🏛️ Governo de ${nomePais}`)
        .setDescription(descricao)
        .setColor('#3498db')
        .setFooter({ text: 'Use B!nomear-funcionario para nomear novos funcionários.' })
        .setTimestamp();
    message.channel.send({ embeds: [embed] });
};
