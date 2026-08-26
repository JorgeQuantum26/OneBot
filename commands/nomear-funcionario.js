const Discord = require('discord.js');
const db = require('../systems/rpg-db');

const CARGOS_DISPONIVEIS = [
    'Ministro das Finanças', 'Ministro da Defesa', 'Ministro da Educação',
    'Ministro da Saúde', 'Ministro da Agricultura', 'Ministro do Comércio',
    'Ministro do Interior', 'Secretário de Estado', 'Embaixador', 'Conselheiro de Segurança'
];

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const nomePais = db.get(`${userId}.pais`);
    if (!nomePais) return message.channel.send(`<:recusado:1031262539272687777>**|** Você não possui um país!`);

    const pais = db.get(`pais_${nomePais}`);
    if (!pais) return message.channel.send(`<:recusado:1031262539272687777>**|** País não encontrado.`);
    if (pais.governador !== userId) return message.channel.send(`<:recusado:1031262539272687777>**|** Apenas o governador pode nomear funcionários.`);

    if (!args[0]) {
        return message.channel.send(
            `**Cargos Disponíveis:**\n${CARGOS_DISPONIVEIS.map((c, i) => `\`${i + 1}.\` ${c}`).join('\n')}\n\n` +
            `**Uso:** \`B!nomear-funcionario <cargo> [@usuario]\`\n` +
            `*Se não mencionar um usuário, o cargo será preenchido por IA.*`
        );
    }

    const cargo = args.filter(a => !a.startsWith('<@')).join(' ');
    const usuario = message.mentions.users.first();

    if (!CARGOS_DISPONIVEIS.includes(cargo) && !CARGOS_DISPONIVEIS.some(c => c.toLowerCase().includes(cargo.toLowerCase()))) {
        return message.channel.send(`<:recusado:1031262539272687777>**|** Cargo inválido. Use \`B!nomear-funcionario\` para ver os cargos disponíveis.`);
    }

    const cargoFinal = CARGOS_DISPONIVEIS.find(c => c.toLowerCase().includes(cargo.toLowerCase())) || cargo;
    const funcionarios = pais.funcionarios || [];
    const funcionariosIA = pais.funcionariosIA || [];

    const jaExiste = [...funcionarios, ...funcionariosIA].find(f => f.cargo === cargoFinal);
    if (jaExiste) return message.channel.send(`<:recusado:1031262539272687777>**|** O cargo **${cargoFinal}** já está preenchido! Demita o atual primeiro.`);

    if (usuario) {
        const novoFunc = { cargo: cargoFinal, userId: usuario.id, tag: usuario.tag, ia: false, nomeadoEm: Date.now() };
        funcionarios.push(novoFunc);
        db.set(`pais_${nomePais}.funcionarios`, funcionarios);

        const noticia = {
            titulo: `🏛️ Nomeação em ${nomePais}`,
            descricao: `**${usuario.tag}** foi nomeado(a) **${cargoFinal}** de **${nomePais}** pelo governador.`,
            tipo: 'governo', impacto: 'neutro', timestamp: Date.now(), pais: nomePais
        };
        const engine = client.paisEngine;
        if (engine) engine.publicarNoticiaNacional(nomePais, noticia);

        const embed = new Discord.EmbedBuilder()
            .setTitle('🏛️ Funcionário Nomeado')
            .setDescription(`**${usuario.tag}** agora é o **${cargoFinal}** de **${nomePais}**!`)
            .setColor('#3498db').setTimestamp();
        return message.channel.send({ embeds: [embed] });
    } else {
        const nomesIA = ['Dr. Silvestre', 'Prof. Alcântara', 'Gen. Moreira', 'Eng. Barbosa', 'Dra. Fonseca', 'Min. Carvalho'];
        const nomeIA = nomesIA[Math.floor(Math.random() * nomesIA.length)];
        const novoIA = { cargo: cargoFinal, nome: nomeIA, ia: true, nomeadoEm: Date.now() };
        funcionariosIA.push(novoIA);
        db.set(`pais_${nomePais}.funcionariosIA`, funcionariosIA);

        const embed = new Discord.EmbedBuilder()
            .setTitle('🤖 Funcionário IA Nomeado')
            .setDescription(`**${nomeIA}** (IA) agora é o **${cargoFinal}** de **${nomePais}**!\n*Este funcionário atuará automaticamente conforme a situação do país.*`)
            .setColor('#9b59b6').setTimestamp();
        return message.channel.send({ embeds: [embed] });
    }
};
