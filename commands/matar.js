const Discord = require("discord.js");
const db = require('../systems/firestore');

const activeIntervals = {};
module.exports = {
    name: 'matar',
    description: 'Mate um jogador no FreeFire',
    run: async (client, message, args) => {
        let user = message.author;
        let modo = db.get(`partidaModo_${user.id}`);
        
        let inventory = db.get(`inventory_${user.id}`) || [];
        let playerWeapon = inventory.find(item => item.type === "arma");

        if (inventory.length === 0 || !playerWeapon) {
            const semArma = new Discord.EmbedBuilder()
                .setTitle(`❌ | ERRO`)
                .setColor(Math.floor(Math.random() * 0xffffff))
                .setDescription(`Você não tem nenhuma arma!\nSeus itens: ${inventory.length > 0 ? inventory.map(item => item.item).join(', ') : "Inventário Vazio"}`)
                .setFooter({ text: `© OneBot 2024 - Todos os Direitos Reservados!` })
                .setTimestamp();
            message.channel.send({ embeds: [semArma] });
            return;
        }

        let location = db.get(`location_${user.id}`);
        if (!location) {
            message.channel.send(`Você precisa se mover para um local para matar alguém! \`\`\`B!mover\`\`\``);
            return;
        }

        const npcs = {
            "Clock Tower": ["BG Assassin", "SniperX"],
            "Factory": ["ProPlayer FF", "TF Blaze"],
            "Hangar": ["Quinn", "AG Gladiator"]
        };

        

        const npcWeapons = ["M500", "MP40", "AWM"];
        const npcWeaponDamage = [67, 48, 150];

        let aliveNPCs = db.get(`aliveNPCs`) || [];
        let aliveNPCs1 = aliveNPCs.filter(npc => npcs[location].includes(npc));
        if(!aliveNPCs1 || aliveNPCs1.length === 0) {
            aliveNPCs1 = npcs[location].slice();
            db.set(`aliveNPCs`, aliveNPCs);
    
        }

        if (aliveNPCs.length === 0) {
            message.channel.send(`NINGUÉM NO LOCAL`);
            return;
        }

        let enemy = aliveNPCs[Math.floor(Math.random() * aliveNPCs.length)];

        // Selecionar uma arma aleatória para o NPC
        let weaponIndex = Math.floor(Math.random() * npcWeapons.length);
        let weapon = npcWeapons[weaponIndex];
        let weaponDamage = npcWeaponDamage[weaponIndex];

        let enemyHealth = 100;

        const inimigo = {
            nome: enemy,
            vida: enemyHealth,
            arma: weapon,
            dano: weaponDamage,
            on: true
        }
        db.set(`inimigo_${user.id}`, inimigo);

        // Jogador ataca o NPC
        if (inimigo.on === true) {
            let playerDamage = playerWeapon.dano;
            let health = db.get(`health_${user.id}`);
            if (health === null) {
                health = 200;
                db.set(`health_${user.id}`, 200);
            }

            const ataques = new Discord.EmbedBuilder()
                .setTitle(`COMBATE`)
                .setColor(Math.floor(Math.random() * 0xffffff))
                .setDescription(`Você encontrou o ${enemy} com uma ${weapon}! Você rushou e atacou ele causando ${playerDamage} de Dano!\nVida do ${enemy}: ${enemyHealth - playerDamage}`);

            let msg = await message.channel.send({ embeds: [ataques] });
            enemyHealth -= playerDamage;
            db.set(`enemyHP_${user.id}`, enemyHealth);

            // NPC revida com a arma selecionada
            if (enemyHealth > 0) {
                setTimeout(() => {
                    health -= weaponDamage;
                    db.set(`health_${user.id}`, health);
                    message.channel.send(`O ${enemy} revidou com uma ${weapon} causando ${weaponDamage} de Dano!\nSua Vida: ${health}`);

                    if (health <= 0) {
                        const mortoJogador = new Discord.EmbedBuilder()
                            .setTitle(`☠️ | GAME OVER`)
                            .setColor('#e74c3c')
                            .setDescription(`${user.username} foi morto!`)
                            .setFooter({ text: `© OneBot 2024 - Todos os Direitos Reservados!` })
                            .setTimestamp();
                        message.channel.send({ embeds: [mortoJogador] });

                        // Limpa o intervalo quando o jogador morre
                        let intervalId = db.get(`intervalId_${user.id}`);
                        if (intervalId) {                      clearInterval(intervalId);
if (activeIntervals[user.id]) {         
clearInterval(activeIntervals[user.id]);
  delete activeIntervals[user.id];
      }
  }          db.set(`partida_${user.id}`, false);
           return;
     }
  }, 2000);
 }
    setTimeout(() => {
if (enemyHealth > 0) {
    const editado = new Discord.EmbedBuilder()                     .setTitle(`COMBATE`)                      .setColor(Math.floor(Math.random() * 0xffffff))                   .setDescription(`Você atacou o ${enemy} novamente causando mais ${playerDamage} de Dano!\nVida do ${enemy}: ${enemyHealth - playerDamage}`);
 enemyHealth -= playerDamage;              db.set(`enemyHP_${user.id}`, enemyHealth);
  msg.edit({ embeds: [editado] });
        }
                
      if (enemyHealth <= 0) {
           const morto = new Discord.EmbedBuilder()
     .setTitle(`💀 | Morte`)
    .setColor(Math.floor(Math.random() * 0xffffff))
    .setDescription(`${enemy} foi morto!`)
    .setFooter({ text: `© OneBot 2024 - Todos os Direitos Reservados!` })
  .setTimestamp();

    if(modo === "Ranqueada") {
          db.add(`kills_${user.id}`, 1);  
        db.add(`dano_${user.id}`, playerDamage);
    } 
        message.channel.send({ embeds: [morto] });

                    // Remove NPC morto da lista
                    aliveNPCs = aliveNPCs.filter(npc => npc !== enemy);
                    db.set(`aliveNPCs_${location}`, aliveNPCs);
                    db.delete(`inimigo_${user.id}`);

                    // Verifica se todos os NPCs estão mortos
                    if (aliveNPCs.length === 0) {
                        message.channel.send(`Não há mais NPCs vivos neste local.`);
                    }
                }

            }, 4000);

            // Atualiza a saúde do jogador no banco de dados
            db.set(`health_${user.id}`, health);

        } else {
            // NPC ataca o jogador
            health -= weaponDamage;
            const npcAtaca = new Discord.EmbedBuilder()
                .setTitle(`⚔️ | Combate`)
                .setColor(Math.floor(Math.random() * 0xffffff))
                .setDescription(`${enemy} ataca ${user.username} com ${weapon}, causando ${weaponDamage} de dano!`)
                .setFooter({ text: `© OneBot 2024 - Todos os Direitos Reservados!` })
                .setTimestamp();
            message.channel.send({ embeds: [npcAtaca] });

            if (health <= 0) {
                const mortoJogador = new Discord.EmbedBuilder()
                    .setTitle(`☠️ | GAME OVER`)
                    .setColor('#e74c3c')
                    .setDescription(`${user.username} foi morto!`)
                    .setFooter({ text: `© OneBot 2024 - Todos os Direitos Reservados!` })
                    .setTimestamp();
                message.channel.send({ embeds: [mortoJogador] });

                // Limpa o intervalo quando o jogador morre
                let intervalId = db.get(`intervalId_${user.id}`);
                if (intervalId) {
                    clearInterval(intervalId);
                    if (activeIntervals[user.id]) {
                        clearInterval(activeIntervals[user.id]);
                        delete activeIntervals[user.id];
                    }
                }
         alivePlayers = alivePlayers.filter(player => player !== enemy);
                    db.set(`alivePlayers`, alivePlayers);
                db.set(`partida_${user.id}`, false);
                return;
            }

            // Atualiza a saúde do jogador no banco de dados
            db.set(`health_${user.id}`, null);
        }

        // Atualiza a saúde do inimigo no banco de dados
        inimigo.vida = enemyHealth;
        db.set(`inimigo_${user.id}`, inimigo);
        
    }
};
