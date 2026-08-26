const Discord = require('discord.js');
const db = require('../systems/rpg-db');

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const nomePais = db.get(`${userId}.pais`);
    if (!nomePais) return message.channel.send(`<:recusado:1031262539272687777>**|** Você não possui um país!`);

    const pais = db.get(`pais_${nomePais}`);
    if (!pais) return message.channel.send(`<:recusado:1031262539272687777>**|** País não encontrado.`);
    if (pais.governador !== userId) return message.channel.send(`<:recusado:1031262539272687777>**|** Apenas o governador pode declarar sanções.`);

    const acao = args[0];
    const nomeParceiro = args.slice(1).join(' ').toLowerCase();

    if (!acao || !['aplicar', 'remover'].includes(acao) || !nomeParceiro) {
        return message.channel.send(
            `**⚔️ Sanções Militares — Uso:**\n` +
            `\`B!sancao-militar aplicar <país>\` — Restrições militares contra o país\n` +
            `\`B!sancao-militar remover <país>\` — Levanta as sanções militares`
        );
    }

    const parceiro = db.get(`pais_${nomeParceiro}`);
    if (!parceiro) return message.channel.send(`<:recusado:1031262539272687777>**|** País **${nomeParceiro}** não encontrado!`);

    let sancoes = pais.sancoes || [];

    if (acao === 'aplicar') {
        if (sancoes.find(s => s.pais === nomeParceiro && s.tipo === 'militar')) {
            return message.channel.send(`<:recusado:1031262539272687777>**|** Já existe uma sanção militar contra **${nomeParceiro}**!`);
        }

        const bombasNecessarias = 5;
        const bombas = pais.bombasNucleares || 0;
        if (bombas < bombasNecessarias) {
            return message.channel.send(`<:recusado:1031262539272687777>**|** Arsenal insuficiente! Você precisa de pelo menos **${bombasNecessarias} bombas nucleares** para aplicar sanções militares.`);
        }

        sancoes.push({ pais: nomeParceiro, tipo: 'militar', aplicadaEm: Date.now() });
        db.set(`pais_${nomePais}.sancoes`, sancoes);

        const penalidade = Math.floor((parceiro.bombasNucleares || 0) * 0.1) + 1;
        const novoArsenal = Math.max(0, (parceiro.bombasNucleares || 0) - penalidade);
        db.set(`pais_${nomeParceiro}.bombasNucleares`, novoArsenal);

        const noticia = {
            titulo: `⚔️ Sanção Militar Internacional!`,
            descricao: `**${nomePais}** impôs **sanções militares** a **${nomeParceiro}**!\nO arsenal de **${nomeParceiro}** foi reduzido em **${penalidade}** unidades.`,
            tipo: 'militar', impacto: 'tenso', timestamp: Date.now(), pais: nomePais
        };
        const engine = client.paisEngine;
        if (engine) {
            engine.publicarNoticiaGlobal(noticia);
            engine.publicarNoticiaNacional(nomeParceiro, noticia);
        }

        const embed = new Discord.EmbedBuilder()
            .setTitle('⚔️ Sanção Militar Aplicada')
            .setDescription(`**${nomePais}** impôs sanções militares a **${nomeParceiro}**!`)
            .addFields({ name: '💣 Arsenal do Alvo Reduzido', value: `-${penalidade} unidades`, inline: true })
            .setColor('#e74c3c').setTimestamp();
        return message.channel.send({ embeds: [embed] });
    }

    if (acao === 'remover') {
        const idx = sancoes.findIndex(s => s.pais === nomeParceiro && s.tipo === 'militar');
        if (idx === -1) return message.channel.send(`<:recusado:1031262539272687777>**|** Nenhuma sanção militar ativa contra **${nomeParceiro}**!`);
        sancoes.splice(idx, 1);
        db.set(`pais_${nomePais}.sancoes`, sancoes);
        message.channel.send(`✅ Sanção militar contra **${nomeParceiro}** levantada.`);
    }
};
