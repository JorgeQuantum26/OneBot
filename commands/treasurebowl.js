const db = require('../systems/firestore');
const { EmbedBuilder } = require('discord.js');

const cooldowns = new Map();

module.exports = {
    name: 'treasurebowl',
    description: 'Inicia um jogo de Treasure Bowl',
    run: async (client, message, args) => {

        let betAmount = args[0];
    if(betAmount.toLowerCase().includes('k')) {
            betAmount = parseFloat(betAmount.toLowerCase().replace('k', '') * 1000);
            
        } else if(betAmount.toLowerCase().includes('m')) {
            betAmount = parseFloat(betAmount.toLowerCase().replace('m', '') * 1000000);
            
        } else if(betAmount.toLowerCase().includes('b')) {
      betAmount = parseFloat(betAmount.toLowerCase().replace('b', '') * 1000000000)  
   } else if(betAmount.toLowerCase().includes('t')) {
            betAmount = parseFloat(betAmount.toLowerCase().replace('t', '') * 1000000000000);
            
   } else if(betAmount.toLowerCase().includes('qd')) {
            betAmount = parseFloat(betAmount.toLowerCase().replace('qd', '') * 1000000000000000);
   } else if(betAmount.toLowerCase().includes('qi')) {
            betAmount = parseFloat(betAmount.toLowerCase().replace('qi', '') * 1000000000000000000);
   } else {
            betAmount = parseInt(betAmount, 10);
        }

      let user = message.author;
        let pag = args[1];
        let dinheiroCassino = await db.get(`cassMoney`) || 0;

        let cooldownDuration = 60000; // 60 segundos
    let cooldownEndTime = Date.now() + cooldownDuration;
        
        

    
        if(args[0] === 'feature') {
            message.channel.send(`Você precisa colocar o valor da sua aposta antes do Feature! Exemplo:\n\`\`\`B!treasurebowl 3000 feature\`\`\``);
            return;
        }

        let valorRecurso = betAmount * 75;
        let descricaoRecurso = "Compre este recurso para ativar uma vitória **WILD** de 3 linhas e ENTRE NA FASE DE RODADAS GRÁTIS!\n**Observação: O Valor deste recurso é calculado através da seguinte maneira:\nO valor que você inseriu para a aposta, sera multiplicado por 75 vezes!**\nQualquer tipo de trapaça levará a Blacklist!";
        
        if(pag === `feature-buy`) {

            if(cooldowns.has(message.author.id)) {
      

                let cooldownEndTime = cooldowns.get(message.author.id);
                let remainingTime = cooldownEndTime - Date.now();
                let remainingMinutes = 0;
                let remainingSeconds = Math.floor((remainingTime % 120000) / 1000);
            
                let time;
                if(remainingMinutes > 0) {
                    time = `${remainingMinutes} minutos e ${remainingSeconds} segundos`;
                } else {
                    time = `${remainingSeconds} segundos`;
                }
                
                const cooldownAtivo = new EmbedBuilder()
            .setTitle(`<a:nao:868232161289986128> **|** ERRO DETECTADO`)
            .setColor('#e74c3c')
            .setDescription(`Não foi possivel realizar a compra desse recurso, pois você precisa aguardar ${time}  para comprar novamente!`)
            .setFooter({ text: `© Cassino OneBot 2024` })
            .setTimestamp();

            message.channel.send({ embeds: [cooldownAtivo] });
            return;
            }
            if(!betAmount) {
                message.channel.send(`Insira um valor para apostar, e depois prossiga para acessar a compra do recurso!`);
                return;
            }


            if(betAmount < 100000) {
                const erroFeature2 = new EmbedBuilder()
                .setTitle(`<a:nao:868232161289986128> **|** ERRO DETECTADO`)
                .setColor('#e74c3c')
                .setDescription(`Você precisa inserir um valor acima de 100.000 OneCoins para poder comprar este recurso!`)
                .setFooter({ text: `© Cassino OneBot 2024` })
                .setTimestamp();

                message.channel.send({ embeds: [erroFeature2] });
                return;
            }
            let money = await db.get(`moneyCass_${message.guild.id}_${user.id}`); 
            if(money < valorRecurso) {
                const erroFeature = new EmbedBuilder()
                .setTitle(`<a:nao:868232161289986128> **|** ERRO DETECTADO`)
                .setColor('#e74c3c')
                .setDescription(`Seu saldo disponível é insuficiente para prosseguir com o pagamento.\n\`\`\`${money.toLocaleString()}/${valorRecurso.toLocaleString()}\`\`\``)
                .setFooter({ text: `© Cassino OneBot 2024` })
                .setTimestamp();

                message.channel.send({ embeds: [erroFeature] });
                return;
            }

            let recurso = db.get(`treasureFeature_${message.guild.id}_${user.id}`);
            if(recurso) {
                message.channel.send(`Você já comprou esse recurso uma vez!`);
                return;
            }

            const comprarFeature = new EmbedBuilder()
            .setTitle(`<a:sim:868232093556166756> **|** COMPRA REALIZADA`)
            .setColor('#2ecc71')
            .setDescription(`Você comprou o recurso com sucesso pelo valor de ${valorRecurso.toLocaleString()}!`)
            .setFooter({ text: `© Cassino OneBot 2024` })
            .setTimestamp();
            
      cooldowns.set(message.author.id, cooldownEndTime);
            setTimeout(() => {
                const liberado = new EmbedBuilder()
                .setTitle(`<a:sim:868232093556166756> **|** COOLDOWN REMOVIDO`)
                .setColor('#2ecc71')
                .setDescription(`${message.author} (${user.username}), o Cooldown para comprar o recurso em **Treasure Bowl** foi liberado!`)
                .setFooter({ text: `[Sistema] Cassino OneBot` })
                .setTimestamp();
                message.channel.send({ embeds: [liberado] });
                cooldowns.delete(message.author.id);
                
            }, 1000 * 60)
            db.set(`treasureFeature_${message.guild.id}_${user.id}`, true);
            db.subtract(`moneyCass_${message.guild.id}_${user.id}`, valorRecurso);
            message.channel.send({ embeds: [comprarFeature] });
            console.log(`[LOG] O usuário ${user.username} (${user.tag}) comprou o recurso Treasure Feature por ${valorRecurso.toLocaleString()}`);
            return;
        }

        if(pag === `feature`) {
            if(!betAmount) {
                message.channel.send(`Insira um valor para apostar, e depois prossiga para acessar as informações do recurso!`);
                return;
            }
            
            const featureEmbed = new EmbedBuilder()
                .setAuthor(`Para comprar, use B!feature-buy`)
                .setTitle(`⭐ **|** Comprar Recurso`)
                .setColor('#f1c40f')
                .setDescription(`${user} Você quer comprar um recurso para o jogo? Então abaixo deixarei algumas informações sobre como ele funciona!`)
                .addFields({ name: `💰 **|** Valor`, value: `${valorRecurso.toLocaleString()}`, inline: true })
                .addFields({ name: `📄 **|** Descrição:`, value: `**${descricaoRecurso}**`, inline: true })
                .setFooter({ text: `© Cassino OneBot 2024` })
                .setTimestamp();
                
            message.channel.send({ embeds: [featureEmbed] });
            return;
        }

        
        if (isNaN(betAmount) || betAmount <= 0) {
            return message.channel.send('Por favor, insira um valor válido para a aposta.');
        }

        const userBalance = await db.get(`moneyCass_${message.guild.id}_${user.id}`) || 0;

        if (userBalance < betAmount) {
            return message.channel.send(`<:recusado:1031262539272687777>**|** ${user} Você não tem saldo suficiente para essa aposta.`);
        }

        if (dinheiroCassino < betAmount) {
            message.channel.send(`:x: **|** ${user}, Sua aposta é maior do que o saldo disponível do Cassino. **Nenhum dinheiro foi gasto.**`);
            return;
        }

        let isFreeSpin = false;
        let verificar = await db.get(`freespins_${message.guild.id}_${user.id}`);
        
        if (verificar > 0) {
            isFreeSpin = true;
            await db.subtract(`freespins_${message.guild.id}_${user.id}`, 1);
        }
        
        await playGame(message, betAmount, isFreeSpin);
    }
};

async function playGame(message, betAmount, isFreeSpin) {
    const user = message.author;
    const slots = ['<:treasurewild:1254206247201280001>', '<:treasurewild1:1254220057496780871>', '🍀', '🍒', '🍋'];
    const combinations = [
        { combo: ['<:treasurewild:1254206247201280001>', '<:treasurewild:1254206247201280001>', '<:treasurewild:1254206247201280001>'], prize: 'FreeSpins', multiplier: '3x' },
        { combo: ['<:treasurewild1:1254220057496780871>', '<:treasurewild1:1254220057496780871>', '<:treasurewild1:1254220057496780871>'], prize: 50, multiplier: '50x' },
        { combo: ['🍀', '🍀', '🍀'], prize: 10, multiplier: '10x' },
        { combo: ['<:treasurewild1:1254220057496780871>', '🍀', '🍀'], prize: 4, multiplier: '4x' },
        { combo: ['<:treasurewild1:1254220057496780871>', '🍋', '🍋'], prize: 1, multiplier: '1x' },
        { combo: ['<:treasurewild1:1254220057496780871>', '🍒', '🍒'], prize: 2, multiplier: '2x' },
        { combo: ['🍀', '<:treasurewild1:1254220057496780871>', '🍀'], prize: 3, multiplier: '3x' },
        { combo: ['🍋', '🍋', '<:treasurewild1:1254220057496780871>'], prize: 2.5, multiplier: '2.5x' },
        { combo: ['🍒', '🍒', '<:treasurewild1:1254220057496780871>'], prize: 2.5, multiplier: '2.5x' },
        { combo: ['🍒', '🍒', '🍒'], prize: 5, multiplier: '5x' },
        { combo: ['🍋', '🍋', '🍋'], prize: 2, multiplier: '2x' }
    ];

    let result = [];

    for (let i = 0; i < 3; i++) {
        result.push(slots[Math.floor(Math.random() * slots.length)]);
    }

    let feature = await db.get(`treasureFeature_${message.guild.id}_${user.id}`);
    let freeSpins = await db.get(`freespins_${message.guild.id}_${user.id}`) || 0;

    if (feature) {
        result = [`<:treasurewild:1254206247201280001> | <:treasurewild:1254206247201280001> | <:treasurewild:1254206247201280001>`];
        await db.add(`freespins_${message.guild.id}_${user.id}`, 10);
        await db.set(`treasureFeature_${message.guild.id}_${user.id}`, false);
        freeSpins += 10;
        console.log(`[LOG] O usuário ${user.username} (${user.tag}) ganhou 10 Free Spins através do Treasure Feature! Sua aposta foi de: ${betAmount.toLocaleString()}`);
    }

    const resultString = result.join(' | ');
    
    let prize = null;
    let multiplier = null;

    for (let i = 0; i < combinations.length; i++) {
        if (JSON.stringify(result) === JSON.stringify(combinations[i].combo)) {
            prize = combinations[i].prize;
            multiplier = combinations[i].multiplier;
            break;
        }
    }

    await db.add(`jogos_${user.id}`, 1);
    await db.add(`apostas_${user.id}`, betAmount);

       
    let embed = new EmbedBuilder()
        .setTitle('🎰 **|** Resultado do Treasure Bowl')
        .setColor('#3498db')
        .addFields({ name: '🔮 **|** Resultados:', value: `**${result.join(' | ')}**`, inline: false })
        .addFields({ name: '💸 **|** Aposta:', value: `${betAmount.toLocaleString()}`, inline: false })
        .addFields({ name: '🏆 **|** Prêmio:', value: prize ? `${prize.toLocaleString()} (Multiplicador: ${multiplier})` : 'Nada', inline: false })
        .addFields({ name: '🎁 **|** Rodadas Grátis Restantes:', value: `${freeSpins} rodadas`, inline: false })
        .setFooter({ text: `© Cassino OneBot 2024` })
        .setTimestamp();    
    let winAmount = 0;

    if (prize) {
        if (prize === 'FreeSpins') {
            embed.addFields({ name: '🎁 **|** Rodadas Grátis:', value: 'Você ganhou 10 Rodadas Grátis!', inline: false });
            await db.add(`freespins_${message.guild.id}_${user.id}`, 10);
        
        } else {
            winAmount = betAmount * prize;
            let dinheiroCassino = db.get(`cassMoney`) || 0;
            if(winAmount > dinheiroCassino) {
                embed.addFields({ name: `⚠️ **|** Aviso:`, value: `Você recebeu um prêmio maior do que o saldo disponível no Cassino \`\`\`Seu Prêmio seria: ${winAmount.toLocaleString()}/ Saldo do Cassino: ${dinheiroCassino.toLocaleString()}\`\`\`. Para evitar problemas, o seu prêmio foi 30% do Saldo disponível do Cassino! `, inline: false });
                winAmount = dinheiroCassino * 0.3;
              console.log(`[LOG] O Usuário ${user.username} ${user.tag} ganhou ${winAmount.toLocaleString()} devido ao prêmio maior do que o saldo disponível no cassino (${dinheiroCassino.toLocaleString()}.`)
                
            }
            embed.addFields({ name: '🎉 **|** Ganho Total:', value: `${winAmount.toLocaleString()}`, inline: false });
            
            await db.add(`moneyCass_${message.guild.id}_${user.id}`, winAmount);
        }
    } else {
        embed.addFields({ name: '❌ **|** Resultado:', value: 'Infelizmente, você não ganhou nada desta vez.', inline: false });
    }

    // Se não for uma rodada grátis, subtrai a aposta do saldo do usuário
    if (!isFreeSpin) {
        if (prize) {
            // Se ganhar, adiciona ao saldo do usuário e subtrai do cassino
            await db.add(`moneyCass_${message.guild.id}_${user.id}`, winAmount);
            await db.subtract(`cassMoney`, winAmount);
        } else {
            // Se perder, subtrai do saldo do usuário e adiciona ao cassino
            await db.subtract(`moneyCass_${message.guild.id}_${user.id}`, betAmount);
            await db.add(`cassMoney`, betAmount);
        }
    }

    // Enviar a mensagem de resultado
    message.channel.send({ embeds: [embed] });

    // Log dos resultados
    console.log(`[LOG] O usuário ${user.username} (${user.tag}) apostou ${betAmount.toLocaleString()} e ${prize ? `ganhou ${winAmount.toLocaleString()}` : 'não ganhou nada'}.`);

}
