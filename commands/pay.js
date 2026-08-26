const Discord = require("discord.js");
const db = require('../systems/firestore');

exports.run = async (bot, message, args) => {
    console.log("Iniciando comando de transferência");
    let user = message.author;
    let recipient = message.mentions.members.first();

    console.log(`Usuário que executa: ${user.tag} (${user.id})`);
    console.log(`Usuário destinatário: ${recipient ? recipient.user.tag : "Nenhum usuário mencionado"}`);

    let embed1 = new Discord.EmbedBuilder()
        .setColor("#000001")
        .setDescription(`<a:nao:868232161289986128>**|** ${message.author}, Você tem que mencionar alguém para transferir dinheiro!`);

    if (!recipient) {
        console.log("Nenhum usuário mencionado");
        return message.channel.send({ embeds: [embed1] });
    }

    const embed3 = new Discord.EmbedBuilder()
        .setTitle(`Erro!`)
        .setColor('Random')
        .setDescription(`<a:nao:868232161289986128>**|**${user}, Você não pode transferir dinheiro para você mesmo.`)
        .setFooter({ text: `Não foi possível executar o comando!` })
        .setTimestamp();

    if (recipient.id === user.id) {
        console.log("Usuário tentou transferir dinheiro para si mesmo");
        return message.channel.send({ embeds: [embed3] });
    }

    let memberBalance = db.fetch(`money_${message.guild.id}_${user.id}`);
    console.log(`Saldo do usuário: ${memberBalance}`);

    let userBankActive = db.get(`banco_${message.guild.id}_${user.id}.certificado`);
    let recipientBankActive = db.get(`banco_${message.guild.id}_${recipient.id}.certificado`);

    console.log(`Banco do usuário ativo: ${userBankActive}`);
    console.log(`Banco do destinatário ativo: ${recipientBankActive}`);

    if (!recipientBankActive) {
        const erro = new Discord.EmbedBuilder()
            .setTitle(`<a:nao:868232161289986128> **|** Conta não encontrada`)
            .setColor('#e74c3c')
            .setDescription(`${user}, o Usuário ${recipient} não possui conta bancária. Não é possível prosseguir com o pagamento.`)
            .setFooter({ text: `© OneBot 2024 - Todos os Direitos Reservados` })
            .setTimestamp();

        console.log("Destinatário não possui conta bancária");
        return message.channel.send({ embeds: [erro] });
    }

    if (!userBankActive) {
        const erro2 = new Discord.EmbedBuilder()
            .setTitle(`<a:nao:868232161289986128> **|** Conta não encontrada`)
            .setColor('#e74c3c')
            .setDescription(`${user}, você não possui conta bancária. Não é possível prosseguir com o pagamento.`)
            .setFooter({ text: `© OneBot 2024 - Todos os Direitos Reservados` })
            .setTimestamp();

        console.log("Usuário não possui conta bancária");
        return message.channel.send({ embeds: [erro2] });
    }

    let recipientBankName = db.get(`banco_${message.guild.id}_${recipient.id}.nomeb`);
    let recipientAccountName = db.get(`banco_${message.guild.id}_${recipient.id}.conta`);

    console.log(`Nome do banco do destinatário: ${recipientBankName}`);
    console.log(`Nome da conta do destinatário: ${recipientAccountName}`);

    let embed2 = new Discord.EmbedBuilder()
        .setColor("#000001")
        .setDescription(`<a:nao:868232161289986128>**|** ${message.author}, Coloque um valor válido para o pagamento!`);

    if (!args[1]) {
        console.log("Nenhum valor fornecido para transferência");
        return message.channel.send({ embeds: [embed2] });
    }

    let amount = parseInt(args[1]);
    if (isNaN(amount)) {
        console.log("Valor fornecido não é numérico");
        return message.channel.send({ embeds: [embed2] });
    }

    let embed4 = new Discord.EmbedBuilder()
        .setColor("#000001")
        .setDescription(`<a:nao:868232161289986128>**|** Você não possui Coins suficiente para realizar o pagamento! \`${memberBalance}/${amount}\``);

    if (memberBalance < amount) {
        console.log("Saldo insuficiente para transferência");
        return message.channel.send({ embeds: [embed4] });
    }

    let embed5 = new Discord.EmbedBuilder()
        .setColor("#000001")
        .setDescription(`<a:nao:868232161289986128>**|**${message.author}, Você não pode enviar quantias abaixo de 100!`);

    if (amount < 100) {
        console.log("Tentativa de transferir uma quantia abaixo de 100");
        return message.channel.send({ embeds: [embed5] });
    }

    let embed7 = new Discord.EmbedBuilder()
        .setColor("#000001")
        .setDescription(`<a:nao:868232161289986128>**|** Você tem que colocar um valor numérico para transferir! `);

    if (isNaN(amount)) {
        console.log("Valor fornecido não é numérico");
        return message.channel.send({ embeds: [embed7] });
    }

    let embed6 = new Discord.EmbedBuilder()
        .setTitle(`Realizando o pagamento!`)
        .setColor('#e67e22')
        .setDescription(`<a:carregando:1246119195901689888>**|** Localizando Banco de ${recipient}`)
        .setFooter({ text: `© OneBot 2024 - Todos os Direitos Reservados` })
        .setTimestamp();

    let msg = await message.channel.send({ embeds: [embed6] });

    setTimeout(async () => {
        const embed7 = new Discord.EmbedBuilder()
            .setTitle(`Quase lá!`)
            .setColor('#e67e22')
            .setDescription(`<a:carregando:1246119195901689888>**|** Conta localizada!`)
            .addFields({ name: `Nome:`, value: `\`${recipientAccountName}\``, inline: true })
            .addFields({ name: `Banco:`, value: `\`${recipientBankName}\``, inline: true })
            .addFields({ name: `Iniciando Transferência!`, value: `Aguarde`, inline: true })
            .setFooter({ text: `© OneBot 2024 - Todos os Direitos Reservados` })
            .setTimestamp();

        msg.edit({ embeds: [embed7] });
        console.log("Conta do destinatário localizada, iniciando transferência");
    }, 3000);

    setTimeout(() => {
        let embed8 = new Discord.EmbedBuilder()
            .setTitle("Transferência Efetuada!")
            .setColor("#000001")
            .setDescription(`<a:sim:868232093556166756>**|** Você transferiu ${amount} OneCoins para ${recipient} com sucesso!`);

        msg.edit({ embeds: [embed8] });
        db.add(`banco_${message.guild.id}_${recipient.id}.saldo`, amount);
        db.subtract(`money_${message.guild.id}_${user.id}`, amount);

        console.log(`Transferência de ${amount} OneCoins de ${user.tag} (${user.id}) para ${recipient.user.tag} (${recipient.id})`);

        // Adicionar transações aos respectivos usuários
        db.push(`banco_${message.guild.id}_${user.id}.transacoes`, `[-] Transferiu ${amount} OneCoins para ${recipient.user.tag}`);
        db.push(`banco_${message.guild.id}_${recipient.id}.transacoes`, `[+] Recebeu ${amount} OneCoins de ${user.tag}`);

        // Verificação de logs para depuração
        console.log(`Transações de ${user.tag} (${user.id}):`, db.get(`banco_${message.guild.id}_${user.id}.transacoes`));
        console.log(`Transações de ${recipient.user.tag} (${recipient.id}):`, db.get(`banco_${message.guild.id}_${recipient.id}.transacoes`));
    }, 6000);
}; 