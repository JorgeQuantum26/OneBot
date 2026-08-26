const Discord = require("discord.js");
const db = require('../systems/rpg-db');

let contadorInvestimentos = 0;
const taxaJurosInicial = 20;
const incrementoTaxaJuros = 5;
const taxaJurosMaxima = 50;

exports.run = async (client, message, args) => {
    let idCidadao = message.author.id;
    const cidadao = db.get(`${idCidadao}`);

    if (!cidadao) {
        return message.channel.send(`<:recusado:1031262539272687777>**|** ${message.author}, cidadão não encontrado. Verifique se você já fez o registro com \`registrar\`.`);
    }

    const pais = cidadao.pais;
    if (!pais) {
        return message.channel.send(`<:recusado:1031262539272687777>**|** ${message.author}, você não possui um país registrado!`);
    }

    const valorInvestido = parseInt(args[0]);

    if (isNaN(valorInvestido) || valorInvestido <= 0) {
        return message.channel.send(`<:recusado:1031262539272687777>**|** ${message.author}, valor inválido! Use: \`investir <valor>\``);
    }

    const saldoAtual = db.get(`${idCidadao}.saldo`) || 0;
    if (saldoAtual < valorInvestido) {
        return message.channel.send(`<:recusado:1031262539272687777>**|** ${message.author}, saldo insuficiente!\n\`\`\`Saldo: ${saldoAtual} / Valor: ${valorInvestido}\`\`\``);
    }

    let taxaJuros = taxaJurosInicial;
    contadorInvestimentos++;
    if (contadorInvestimentos >= 2) {
        taxaJuros = Math.min(taxaJuros + incrementoTaxaJuros, taxaJurosMaxima);
        contadorInvestimentos = 0;
    }

    const lucroGerado = valorInvestido * (taxaJuros / 100);
    const lucroArredondado = parseFloat(lucroGerado.toFixed(2));

    db.subtract(`${idCidadao}.saldo`, valorInvestido);
    db.add(`${idCidadao}.saldo`, lucroArredondado);
    db.add(`pais_${pais}.tesouro`, valorInvestido);

    const embed = new Discord.EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('💹 Investimento Realizado!')
        .setDescription(`<:aceitado:1031262771326759002>**|** ${message.author}, você investiu **${valorInvestido}** moedas no país **${pais}** e recebeu um lucro de **${lucroArredondado}** moedas (${taxaJuros}% de juros).`)
        .addFields({ name: 'Valor investido', value: `${valorInvestido} moedas`, inline: true })
        .addFields({ name: 'Lucro recebido', value: `${lucroArredondado} moedas`, inline: true })
        .addFields({ name: 'Taxa de juros', value: `${taxaJuros}%`, inline: true })
        .setFooter({ text: '© RPG Mundi - OneBot' })
        .setTimestamp();

    message.channel.send({ embeds: [embed] });
};
