const Discord = require('discord.js');
const db = require('../systems/firestore');

exports.run = async (client, message, args) => {
    let user = message.author;
    let painel = args[0];
    let ban = await db.fetch(`banido_${user.id}`);

    const manuntencao = {
        "mercado-legalizado": true,
        "mercado-negro": false
    }
        function verificarManutencao(painel, user, message) {
            if(manuntencao[painel]) {
                const erro = new Discord.EmbedBuilder()
                .setTitle(`<a:nao:868232161289986128> **|** ERRO DETECTADO`)
                .setColor('#e74c3c')
                .setDescription(`${user} O ${painel} está em manutenção, tente novamente mais tarde!`)
                .setFooter({ text: { text: `© [SISTEMA] ${client.user.username}`, iconURL: client.user.displayAvatarURL() } })
                .setTimestamp();

                message.channel.send({ embeds: [erro] });
            return true;
            }
        return false;
        }
    if (ban >= 1) {
        return message.channel.send(`${message.author}, Você foi banido! ¯\\_(ツ)_/¯\n\nVocê está na minha Blacklist e não pode usar meus comandos. Será que é tão difícil assim seguir as regras?\n\nCaso você ache que seu banimento foi injusto (Com certeza não foi), você pode entrar em Contato com a Equipe Do OneBot\n\nAo entrar em contato conosco, aguarde que logo iremos resolver seu problema. Caso contrário, você permanecerá banido(a).`);
    }

    if (!painel) {
        const { guild } = message;
        const icon = guild.iconURL();
        const comandos = new Discord.EmbedBuilder()
            .setColor('#000001')
            .setThumbnail(icon)
            .setTitle('Loja OneBot')
            .addFields({ name: `🏪 Mercado Legalizado`, value: `Compre itens legalizados\nUse: \`\`\`B!loja mercado-legalizado\`\`\``, inline: true })
            .addFields({ name: `<:desert_eagle:1272024045566558301> Mercado Negro`, value: `Compre itens ilegalizados\nUse: \`\`\`B!loja mercado-negro\`\`\``, inline: true });
        return message.channel.send({ embeds: [comandos] });
    }

   
    if (painel === "mercado-legalizado") {
        if(verificarManutencao("mercado-legalizado", user, message)) return;
        const mercadoLegal = new Discord.EmbedBuilder()
            .setTitle(`Loja OneBot | Mercado Legalizado`)
            .addFields({ name: `🖥️ Eletrônicos**(1)**`, value: `Reaja a mensagem para abrir`, inline: true })
            .addFields({ name: `Computador (Nível 1)`, value: ` **Preço: 15.000**`, inline: true })
            .addFields({ name: `Computador (Nível 2)`, value: `**Preço: 23.000**\n> Usado para invasões cibernéticas ao banco dos usuários.`, inline: true })
            .addFields({ name: `Vip 1`, value: `Preço: 18.000`, inline: true })
            .addFields({ name: `Vip 2`, value: `Preço: 25.830`, inline: true })
            .addFields({ name: `Vip 3`, value: `Preço: 30.000`, inline: true })
            .addFields({ name: `Nota:`, value: `> Veja os benefícios VIP no comando B!beneficios VIP <Em desenvolvimento>`, inline: true })
            .setFooter({ text: { text: `Use B!comprar | Comando Executado por: ${message.author.username}`, iconURL: message.author.displayAvatarURL({size: 32}) } })
            .setTimestamp();
        return message.channel.send({ embeds: [mercadoLegal] });
    }

    if (painel === "mercado-negro") {
    if (painel === "mercado-negro") {
    try {
        if(verificarManutencao("mercado-negro", user, message)) return;
        const mercadoNegro = new Discord.EmbedBuilder()
            .setTitle(`Loja OneBot | Mercado Negro`)
            .addFields({ name: `<:desert_eagle:1272024045566558301> Armas`, value: `Escolha este emoji para acessar as armas.`, inline: true })
            .addFields({ name: `<:ammo:1278390883598995509> Munições`, value: `Escolha este emoji para acessar as munições.`, inline: true })
            .addFields({ name: `↩️ Voltar`, value: `Escolha este emoji para voltar à seleção anterior.`, inline: true })
            .setFooter({ text: { text: `© Use B!comprar | Comando Executado por: ${message.author.username}`, iconURL: message.author.displayAvatarURL({size: 32}) } })
            .setTimestamp();

        // Enviar a mensagem do mercado negro e adicionar as reações
        const sentMessage = await message.channel.send({ embeds: [mercadoNegro] });
        await sentMessage.react('↩️');
        await sentMessage.react('<:desert_eagle:1272024045566558301>');
        await sentMessage.react('<:ammo:1278390883598995509>');

        const filter = (reaction, user) => {
            if(user.bot) return false;
            
        const DesertEagleId = "1272024045566558301";
        const ammoId = "1278390883598995509"
            const backEmojiName = "↩️";

            return (reaction.emoji.id === DesertEagleId || reaction.emoji.id === ammoId || reaction.emoji.name === backEmojiName) && user.id === message.author.id;
        };
        // Coletar as reações
        const collector = sentMessage.createReactionCollector(filter, { time: 60000 });
        
        collector.on('collect', reaction => {
            const emojiId = reaction.emoji.id;
            console.log("Coletando reação:", emojiId);
            if (emojiId === "1272024045566558301") {
                const mercadoNegroArmas = new Discord.EmbedBuilder()
                    .setTitle(`Loja OneBot | Mercado Negro - Armas`)
                    .addFields({ name: `AK-47`, value: `Preço: 56.700`, inline: true })
                    .addFields({ name: `M4A1`, value: `Preço: 50.000`, inline: true })
                    .setFooter({ text: { text: `© Use B!comprar | Comando Executado por: ${message.author.username}`, iconURL: message.author.displayAvatarURL({size: 32}) } })
                    .setTimestamp();
                sentMessage.edit({ embeds: [mercadoNegroArmas] });
            } else if (emojiId === '1278390883598995509') {
                const mercadoNegroMunicoes = new Discord.EmbedBuilder()
                    .setTitle(`Loja OneBot | Mercado Negro - Munições`)
                    .addFields({ name: `<:ammo:1278390883598995509> Munição de AK-47`, value: `Calibre: 7.62mm\nPreço: 30.000 por 30 Balas`, inline: true })
                    .addFields({ name: `<:ammo:1278390883598995509> Munição de M4A1`, value: `Calibre: 5.56mm\nPreço: 28.500 por 30 balas`, inline: true })
                    .addFields({ name: `Nota:`, value: `Para comprar, use o Calibre da munição para encontrar o item.`, inline: true })
                    .setFooter({ text: { text: `© Use B!comprar | Comando Executado por: ${message.author.username}`, iconURL: message.author.displayAvatarURL({size: 32}) } })
                    .setTimestamp();
                sentMessage.edit({ embeds: [mercadoNegroMunicoes] });
            } else if (reaction.emoji.name === '↩️') {
                sentMessage.edit({ embeds: [mercadoNegro] });
            }
        });
    } catch (error) {
        console.error("Erro ao processar o comando do mercado-negro: ", error);
    }
    }
    }
}