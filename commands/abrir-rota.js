const Discord = require('discord.js');
const db = require('../systems/rpg-db');
const { gerarNoticiaRota } = require('../systems/news-templates');

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const nomePais = db.get(`${userId}.pais`);
    if (!nomePais) return message.channel.send(`<:recusado:1031262539272687777>**|** Você não possui um país!`);

    const pais = db.get(`pais_${nomePais}`);
    if (!pais) return message.channel.send(`<:recusado:1031262539272687777>**|** País não encontrado.`);
    if (pais.governador !== userId) return message.channel.send(`<:recusado:1031262539272687777>**|** Apenas o governador pode abrir rotas comerciais.`);

    const nomeParceiro = args.join(' ').toLowerCase();
    if (!nomeParceiro) return message.channel.send(`<:recusado:1031262539272687777>**|** Informe o país: \`B!abrir-rota <país>\``);

    const parceiro = db.get(`pais_${nomeParceiro}`);
    if (!parceiro) return message.channel.send(`<:recusado:1031262539272687777>**|** País **${nomeParceiro}** não encontrado!`);
    if (nomeParceiro === nomePais) return message.channel.send(`<:recusado:1031262539272687777>**|** Você não pode abrir uma rota com o próprio país.`);

    const embargos = pais.embargos || [];
    if (embargos.includes(nomeParceiro)) return message.channel.send(`<:recusado:1031262539272687777>**|** Você tem um embargo contra **${nomeParceiro}**! Remova-o primeiro.`);

    const emb2 = parceiro.embargos || [];
    if (emb2.includes(nomePais)) return message.channel.send(`<:recusado:1031262539272687777>**|** **${nomeParceiro}** tem um embargo contra seu país!`);

    const rotas = pais.rotasComerciais || [];
    if (rotas.find(r => r.parceiro === nomeParceiro)) return message.channel.send(`<:recusado:1031262539272687777>**|** Já existe uma rota comercial com **${nomeParceiro}**!`);

    const custo = 500;
    if ((pais.tesouro || 0) < custo) return message.channel.send(`<:recusado:1031262539272687777>**|** Custo de abertura: **${custo}** moedas. Tesouro insuficiente.`);

    rotas.push({ parceiro: nomeParceiro, tipo: 'bilateral', abertaEm: Date.now() });
    db.set(`pais_${nomePais}.rotasComerciais`, rotas);
    db.subtract(`pais_${nomePais}.tesouro`, custo);
    db.add(`pais_${nomePais}.gastos`, custo);

    const rotasParceiro = parceiro.rotasComerciais || [];
    if (!rotasParceiro.find(r => r.parceiro === nomePais)) {
        rotasParceiro.push({ parceiro: nomePais, tipo: 'bilateral', abertaEm: Date.now() });
        db.set(`pais_${nomeParceiro}.rotasComerciais`, rotasParceiro);
    }

    const noticia = gerarNoticiaRota(nomePais, nomeParceiro, 'abrir');
    const engine = client.paisEngine;
    if (engine) {
        engine.publicarNoticiaGlobal(noticia);
        engine.publicarNoticiaNacional(nomePais, noticia);
    }

    const embed = new Discord.EmbedBuilder()
        .setTitle('🚢 Rota Comercial Aberta')
        .setDescription(`**${nomePais}** agora tem uma rota comercial bilateral com **${nomeParceiro}**!`)
        .addFields({ name: '💰 Custo de Abertura', value: `${custo.toLocaleString('pt-BR')} moedas`, inline: true })
        .addFields({ name: '📈 Ganhos por Ciclo', value: `100–500 moedas em exportações`, inline: true })
        .setColor('#2ecc71').setTimestamp();
    message.channel.send({ embeds: [embed] });
};
