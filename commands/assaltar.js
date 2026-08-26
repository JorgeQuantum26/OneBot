const Discord = require("discord.js");
const db = require('../systems/firestore');

exports.run = async (client, message, args) => {
    let user = message.author;
    let vitima = message.mentions.users.first();

    if (!vitima) {
        const erro0 = new Discord.EmbedBuilder()
            .setTitle(`<a:nao:868232161289986128> **| ERRO DETECTADO`)
            .setColor('#e74c3c')
            .setDescription(`${user} Você precisa mencionar alguém para assaltar!`);
        message.channel.send({ embeds: [erro0] });
        return;
    }
    
    let amountVictim = db.get(`money_${message.guild.id}_${vitima.id}`);
    if (amountVictim === null || amountVictim <= 5) {
        const erro1 = new Discord.EmbedBuilder()
            .setTitle("<a:nao:868232161289986128> **| ERRO DETECTADO")
            .setColor('#e74c3c')
            .setDescription(`${user} Infelizmente, não foi possível realizar um assalto em ${vitima} pois ele possui menos de 5 OneCoins na carteira!`);
        message.channel.send({ embeds: [erro1] });
        return;
    }
    
    let inventory = db.get(`inventory_${message.guild.id}_${user.id}`);
    let armaNome = '';
    let armamento = '';
    if (inventory) { 
        armamento = inventory.find(item => item.tipo === "arma");
    
        if (armamento) {
            armaNome = armamento.item;
        } else {
            armaNome = null; // Não tem armamento, então arma Nome é null.
        }
    } else {
        armaNome = null; // Sem arma no inventário 
    }
    
    console.log(`Inventário do usuário: ${JSON.stringify(inventory)}`);
    console.log(`Arma encontrada: ${JSON.stringify(armamento)}`);
    console.log(`Nome da arma: ${armaNome}`);

    if (!armaNome) {
        const erro2 = new Discord.EmbedBuilder()
            .setTitle(`<a:nao:868232161289986128> **| ERRO DETECTADO**`)
            .setColor('#e74c3c')
            .setDescription(`${user} Você não possui armas para iniciar um assalto!`);
        message.channel.send({ embeds: [erro2] });
        return;
    }

    let escudo = db.get(`escudo_${message.guild.id}_${vitima.id}`);
    if (escudo === true) {
        const erro3 = new Discord.EmbedBuilder()
            .setTitle(`<a:nao:868232161289986128> **| ERRO DETECTADO**`)
            .setColor('#e74c3c')
            .setDescription(`Infelizmente, ${vitima} possui um escudo, portanto não foi possível realizar um assalto!`);
        message.channel.send({ embeds: [erro3] });
        return;
    }

    if (vitima.id === user.id) {
        const erro4 = new Discord.EmbedBuilder()
            .setTitle(`<a:nao:868232161289986128> **| ERRO DETECTADO**`)
            .setColor('#e74c3c')
            .setDescription(`${user} Você não pode assaltar a si mesmo!`);
        message.channel.send({ embeds: [erro4] });
        return;
    }

    console.log(`Iniciando o assalto!`);
    const embed = new Discord.EmbedBuilder()
        .setTitle("<:desert_eagle:1272024045566558301> Assalto")
        .setColor('#e74c3c')
        .setDescription(`${user} Você está prestes a iniciar um assalto à carteira de ${vitima}. Você quer continuar com essa ação?`);

    let msg = await message.channel.send({ embeds: [embed] });

    const filter = (reaction, user) => {
        return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
    };

    await msg.react('✅'); // Reação para confirmar
    await msg.react('❌'); // Reação para cancelar

    msg.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
        .then(async collected => {
            const reaction = collected.first();

            if (reaction.emoji.name === '✅') {
                console.log(`Reação coletada: ${reaction.emoji.name}`);
                let chance = Math.random();
                let result = chance < 0.4;

                if (result) {
                    setTimeout(() => {
                        console.log(`Se aproximando de ${vitima} (1°)`);
                        const embed1 = new Discord.EmbedBuilder()
                            .setTitle(`<:desert_eagle:1272024045566558301> Assalto!`)
                            .setColor('#f1c40f')
                            .setDescription(`🔎 ${user}, você está se aproximando de ${vitima}.`)
                            .setFooter({ text: `© OneBot 2024 - Todos os Direitos Reservados!` })
                            .setTimestamp();
                        msg.edit({ embeds: [embed1] });
                    }, 3000);

                    setTimeout(async () => {
                        console.log(`Executando o sistema de chances.`);
                        let quantidadeBalas = 0;
                        let result1;
                        let chance1;

                        if (armaNome === "AK-47") {
                            quantidadeBalas = db.get(`municaoAK_${message.guild.id}_${user.id}`);
                        } else if (armaNome === "M4A1") {
                            quantidadeBalas = db.get(`municaoM4_${message.guild.id}_${user.id}`);
                        }

                        // Verifique a quantidade de balas e determine a chance de a polícia chegar
                        if (quantidadeBalas < 10) {
                            chance1 = Math.random();
                            result1 = chance1 < 0.6; // 60% chance de a polícia chegar
                        } else if (quantidadeBalas >= 10) {
                            chance1 = Math.random();
                            result1 = chance1 < 0.4; // 40% chance de a polícia chegar
                        }

                        console.log(`Chance de polícia chegar: ${chance1}`);

                        if (result1) {
                            let municao;
                            if (armaNome === "AK-47") {
                                municao = "7.62mm";
                            } else if (armaNome === "M4A1") {
                                municao = "5.56mm";
                            }
                            const embed1 = new Discord.EmbedBuilder()
                                .setTitle(`<:desert_eagle:1272024045566558301> Assalto!`)
                                .setColor('#e74c3c')
                                .setDescription(`${user}, você não conseguiu roubar ${vitima}. A polícia chegou, você começou a trocar tiros com uma equipe de policiais! Sua munição acabou e você foi preso!`)
                                .addFields({ name: `⚠️ **Sobre sua Arma**:`, value: `A polícia pegou sua ${armaNome} e as munições **${municao}** enquanto você ia preso.`, inline: true })
                                .setFooter({ text: { text: `© Use B!pagar-fiança para pagar a fiança! | ${message.author.username}`, iconURL: message.author.displayAvatarURL({ size: 32 }) } });

                            console.log(`Removendo a arma do inventário do usuário`);
                            // Remova a arma do inventário e edite a mensagem
                            let inventory = db.get(`inventory_${message.guild.id}_${user.id}`) || [];
                            inventory = inventory.filter(item => item.item !== armaNome);
                            db.set(`inventory_${message.guild.id}_${user.id}`, inventory);
                            console.log(`Arma removida com sucesso!`);

                            await msg.edit({ embeds: [embed1] });
                        } else {
                            // Se a polícia não chegar, mostre a mensagem de falha
                            console.log("A polícia não prendeu o usuário no assalto, mas o assalto falhou!");
                            let userBalance = db.get(`money_${message.guild.id}_${user.id}`);
    let valor = Math.floor(Math.random() * (userBalance * 0.2) + 1);
                            const embed2 = new Discord.EmbedBuilder()
                                .setTitle(`<:desert_eagle:1272024045566558301> Assalto!`)
                                .setColor('#e74c3c')
                                .setDescription(`${user}, você não conseguiu roubar ${vitima} e a polícia te pegou! Você teve de pagar ${valor} OneCoins como multa e foi liberado!`); // Ajuste o valor conforme necessário
                            db.subtract(`money_${message.guild.id}_${user.id}`, valor);
                            await msg.edit({ embeds: [embed2] });
                        }
                    }, 6000);

                } else if (result === false) {
                    setTimeout(() => {
                        console.log(`Se Aproximando de ${vitima} (2°)`);
                        const embed1 = new Discord.EmbedBuilder()
                            .setTitle(`<:desert_eagle:1272024045566558301> Assalto!`)
                            .setColor('#f1c40f')
                            .setDescription(`🔎 ${user}, você está se aproximando de ${vitima}.`)
                            .setFooter({ text: `© OneBot 2024 - Todos os Direitos Reservados!` })
                            .setTimestamp();
                        msg.edit({ embeds: [embed1] });
                        }, 3000);

                    setTimeout(async () => {
                        console.log(`Tentando iniciar o assalto`);
                        let chance = Math.random();
                        let result2 = chance < 0.5; // 50% chance de sucesso no assalto

                        if (result2) {
                            let valor = Math.floor(Math.random() * (amountVictim - 5) + 5); // Valor aleatório entre 5 e o total disponível menos 5
                            let amountAtual = db.get(`money_${message.guild.id}_${user.id}`);
                            db.set(`money_${message.guild.id}_${user.id}`, amountAtual + valor);
                            db.subtract(`money_${message.guild.id}_${vitima.id}`, valor);

                            const embed3 = new Discord.EmbedBuilder()
                                .setTitle(`<:desert_eagle:1272024045566558301> Assalto!`)
                                .setColor('#2ecc71')
                                .setDescription(`${user}, você passou correndo próximo ao ${vitima}, você exibiu sua arma e conseguiu roubar ${valor} OneCoins!`)
                                .setFooter({ text: `© OneBot 2024 - Todos os Direitos Reservados!` })
                                .setTimestamp();

                            console.log(`Assalto bem-sucedido. ${user} roubou ${valor} de ${vitima}.`);
                            await msg.edit({ embeds: [embed3] });
                        } else {
                            const embed4 = new Discord.EmbedBuilder()
                                .setTitle(`<:desert_eagle:1272024045566558301> Assalto!`)
                                .setColor('#e74c3c')
                                .setDescription(`${user}, o assalto falhou! ${vitima} conseguiu se defender. Você não conseguiu roubar nada.`)
                                .setFooter({ text: `© OneBot 2024 - Todos os Direitos Reservados!` })
                                .setTimestamp();

                            console.log(`Assalto falhou. ${user} não conseguiu roubar ${vitima}.`);
                            await msg.edit({ embeds: [embed4] });
                        }
                    }, 6000);
                }
            } else if (reaction.emoji.name === '❌') {
                const embed5 = new Discord.EmbedBuilder()
                    .setTitle(`<a:nao:868232161289986128> **| CANCELADO**`)
                    .setColor('#e74c3c')
                    .setDescription(`${user}, você decidiu que não era uma boa idéia e resolveu não cometer o assalto!`);
                console.log(`Assalto cancelado por ${user}.`);
                await msg.edit({ embeds: [embed5] });
            }
        })
        .catch(collected => {
            const embed6 = new Discord.EmbedBuilder()
                .setTitle(`<a:nao:868232161289986128> **| ERRO DETECTADO**`)
                .setColor('#e74c3c')
                .setDescription(`${user}, você demorou demais para reagir, a polícia passou por perto e você decidiu correr.`);
            console.log(`O assalto foi cancelado devido à falta de resposta de ${user}.`);
            msg.edit({ embeds: [embed6] });
        });
};