const Discord = require("discord.js");
const db = require('../systems/firestore');
const moment = require("moment");
const { v4: uuidv4 } = require('uuid');

exports.run = async (client, message, args) => {
  let user = message.author;
  let painel = args[0];

  let banco_nome = db.fetch(`banco_${message.guild.id}_${user.id}.nomeb`);
  let conta_nome = db.fetch(`banco_${message.guild.id}_${user.id}.conta`);
  let agencia = db.fetch(`banco_${message.guild.id}_${user.id}.agencia`);
  let saldo_inicial = db.fetch(`banco_${message.guild.id}_${user.id}.saldo`);
  let bancoID = db.fetch(`banco_${message.guild.id}_${user.id}.bancoId`);
    if(!bancoID) {
     const erro = new Discord.EmbedBuilder()
      .setTitle(`<a:nao:868232161289986128> **|** ERRO DETECTADO`)
      .setColor('#e74c3c')
      .setDescription(`${user} Não encontrei informações sobre sua conta bancária em meu banco de dados!`)
      .setFooter({ text: `© Sistema Bancário - OneBot 2024` })
      .setTimestamp();

      message.channel.send({ embeds: [erro] });
      return;
    }
  if (!args[0]) {
    const banco = new Discord.EmbedBuilder()
      .setAuthor(`Use B!banco <menu> para ver os painéis do banco`)
      .setTitle(`CONTA BANCÁRIA`)
      .setColor('#2ecc71')
      .setDescription(`<a:sim:868232093556166756>**|** ${user}, Bem-vindo, aqui você pode acessar suas informações bancárias:`)
      .addFields({ name: 'Nome do Banco:', value: `\`${banco_nome}\``, inline: true })
      .addFields({ name: 'Nome da Conta:', value: `\`${conta_nome}\``, inline: true })
      .addFields({ name: 'ID Do Banco:', value: `\`${bancoID}\``, inline: true })
      .addFields({ name: 'Agência:', value: `\`${agencia}\``, inline: true })
      .addFields({ name: 'Saldo:', value: `\`${saldo_inicial.toLocaleString()}\``, inline: true })
      .setFooter({ text: `© Sistema Bancário || OneBot Com todos os seus direitos reservados!` })
      .setTimestamp();

    message.channel.send({ embeds: [banco] });
  }

  if (painel === "menu") {
    const embed1 = new Discord.EmbedBuilder()
      .setTitle(`PAINÉIS PARA O BANCO`)
      .setColor(Math.floor(Math.random() * 0xffffff))
      .addFields({ name: `<:banco:1254113283628335116> **Banco**`, value: `Veja suas principais informações bancárias \`\`\`B!banco\`\`\``, inline: true })
      .addFields({ name: `<:investimento:1254112183005085766> **Investimentos**`, value: `Faça investimentos em Bolsa de Valores, etc. \`\`\`B!banco inv\`\`\``, inline: true })
      .addFields({ name: `<:emprestimo:1254112568289530007> **Empréstimos**`, value: `Faça empréstimos com o Banco \`\`\`B!banco empréstimo\`\`\``, inline: true })
      .addFields({ name: `<:extrato:1254108978368217160> **Extrato**`, value: `Veja seu extrato bancário \`\`\`B!banco extrato\`\`\``, inline: true })
      .setFooter({ text: `© Sistema Bancário || OneBot Com todos os seus direitos reservados!` })
      .setTimestamp();

    message.channel.send({ embeds: [embed1] });
  }

  if (painel === "empréstimo") {
    const valorEmprestimo = parseFloat(args[1]); // Valor do empréstimo
    const prazoDias = 1; // Prazo do empréstimo em dias

    if (valorEmprestimo > 10000000) {
      const erro = new Discord.EmbedBuilder()
        .setTitle(`<a:nao:868232161289986128> **|** ERRO DETECTADO`)
        .setColor('#e74c3c')
        .setDescription(`${user} Você inseriu um valor acima do limite estabelecido pela Agência Bancária, por favor, insira um valor abaixo de **R$10.000.000**`)
        .setFooter({ text: `© Sistema Bancário || OneBot com Todos os Direitos Reservados!` })
        .setTimestamp();

      message.channel.send({ embeds: [erro] });
      return;
    }

    // Calcula a data de vencimento do empréstimo
    const dataConcessao = moment();
    const dataVencimento = dataConcessao.clone().add(prazoDias, 'days').format('DD/MM/YYYY');

    // Armazena informações do empréstimo no banco de dados
    const emprestimoID = uuidv4(); // Gerando uma identificação única para o empréstimo

    const embed8 = new Discord.EmbedBuilder()
      .setTitle(`Empréstimo Bancário`)
      .setColor('#2ecc71')
      .setDescription(`Empréstimo aprovado com sucesso. Informações:`)
      .addFields({ name: `Valor:`, value: `R$${valorEmprestimo.toFixed(2)}`, inline: true })
      .addFields({ name: `Data de Vencimento:`, value: `${dataVencimento}`, inline: true })
      .addFields({ name: `ID:`, value: `Use o ID do Empréstimo: \`\`\`${emprestimoID}\`\`\` para pagar o empréstimo.`, inline: true })
      .setFooter({ text: `© Sistema Bancário || OneBot Com todos os seus direitos reservados!` })
      .setTimestamp();

    message.channel.send({ embeds: [embed8] });
    db.add(`money_${message.guild.id}_${user.id}`, valorEmprestimo);

    db.push(`emprestimos_${user.id}`, {
      id: emprestimoID,
      valor: valorEmprestimo,
      dataConcessao: dataConcessao.format('DD/MM/YYYY'),
      dataVencimento: dataVencimento,
      pago: false // Marca o empréstimo como não pago
    });
  }

  if (painel === "pagar-emprestimo") {
    const emprestimoID = args[1]; // Identificação única do empréstimo a ser pago

    const emprestimos = db.get(`emprestimos_${user.id}`) || [];
    const emprestimoIndex = emprestimos.findIndex(e => e.id === emprestimoID);

    if (emprestimoIndex === -1) return message.reply("Empréstimo não encontrado.");

    const emprestimo = emprestimos[emprestimoIndex];
    const valorEmprestimo = emprestimo.valor;

    if (emprestimo.pago) return message.reply("Este empréstimo já foi pago.");

    const saldoUsuario = db.get(`money_${message.guild.id}_${user.id}`);
    if (saldoUsuario < valorEmprestimo) return message.reply("Você não possui saldo suficiente para pagar este empréstimo.");

    db.subtract(`money_${message.guild.id}_${user.id}`, valorEmprestimo);
    db.set(`emprestimos_${user.id}.${emprestimoIndex}.pago`, true); // Marca o empréstimo como pago

    message.reply(`Empréstimo de R$${valorEmprestimo.toFixed(2)} pago com sucesso.`);
  }

  if (painel === "extrato") {
    let transacoes = db.fetch(`banco_${message.guild.id}_${user.id}.transacoes`) || [];

    if (transacoes.length === 0) {
      return message.channel.send(`${user}, você não tem transações registradas.`);
    }

    // Função para criar embeds com no máximo 10 transações por página
    function createEmbeds(transacoes, perPage) {
      let embeds = [];
      for (let i = 0; i < transacoes.length; i += perPage) {
        let embed = new Discord.EmbedBuilder()
          .setTitle(`Extrato Bancário - ${user.username}`)
          .setColor('#3498db')
          .setDescription(`Aqui está o seu extrato bancário:`)
          .addFields(transacoes.slice(i, i + perPage).map((transacao, index) => ({
            name: `Transação ${i + index + 1}:`,
            value: transacao
          })));
        embeds.push(embed);
      }
      return embeds;
    }

    const perPage = 10;
    const embeds = createEmbeds(transacoes, perPage);

    let page = 0;

    const sendEmbed = () => {
      message.channel.send({ embeds: [embeds[page]] }).then(sentMessage => {
        // Adiciona reações para navegação
        sentMessage.react('◀️');
        sentMessage.react('▶️');

        // Filtro de reações
        const filter = (reaction, user) => ['◀️', '▶️'].includes(reaction.emoji.name) && user.id === message.author.id;
        const collector = sentMessage.createReactionCollector(filter, { time: 60000 }); // 1 minuto de tempo para interação

        collector.on('collect', (reaction) => {
          if (reaction.emoji.name === '▶️') {
            if (page < embeds.length - 1) {
              page++;
              sentMessage.edit({ embeds: [embeds[page]] });
            }
          } else if (reaction.emoji.name === '◀️') {
            if (page > 0) {
              page--;
              sentMessage.edit({ embeds: [embeds[page]] });
            }
          }
          reaction.users.remove(message.author.id); // Remove a reação do autor
        });

        collector.on('end', () => {
          sentMessage.reactions.removeAll(); // Remove todas as reações após o tempo
        });
      });
    };

    sendEmbed();
  }
};
