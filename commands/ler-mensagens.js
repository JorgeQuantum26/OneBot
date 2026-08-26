const Discord = require("discord.js");
const db = require('../systems/firestore');

exports.run = async (client, message, args) => {
  

// Lê mensagens recebidas pelo usuário no banco de dados
        const mensagens = db.get(`mensagens.${message.author.id}`);

        if (!mensagens || mensagens.length === 0) {
            message.channel.send(`Não há mensagens para você!`);
        } else {
            const embed = new Discord.EmbedBuilder()
                .setTitle(`Mensagens de ${message.author.username}`)
            
            for (let i = 0; i < mensagens.length; i++) {
                const remetente = client.users.cache.get(mensagens[i].remetente).username;
                embed.addFields({ name: `De ${remetente} em ${new Date(mensagens[i].data).toLocaleString()}:`, value: mensagens[i].mensagem, inline: false });
            }

            db.delete(`mensagens.${message.author.id}`); // Limpa a caixa de entrada do usuário
            message.channel.send({ embeds: [embed] });
        }
    }