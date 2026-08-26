// B!restaurar - Salvação do Império
const Discord = require('discord.js');
const db = require('../systems/firestore');

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const nomePais = db.get(`${userId}.pais`);

    const pais = db.get(`pais_${nomePais}`);
    // RESTAURAR TESOURO (se foi saqueado)
    if ((pais.tesouro || 0) < 1000000000000) {
        db.set(`pais_${nomePais}.tesouro`, 500000000000);
    }
   
    
    
    const embed = new Discord.EmbedBuilder()
        .setTitle('✅ Império Restaurado!')
        .setColor('#2ecc71')
        .setDescription(`**${nomePais}** foi restaurado sob seu comando!`)
        .addFields({ name: '👑 Governo', value: 'Restaurado', inline: true })
        .addFields({ name: '🪖 Exército', value: '10M infantaria + tanques/aviões/navios', inline: true })
        .addFields({ name: '💰 Tesouro', value: '+50 Bilhões', inline: true })
        .addFields({ name: '👥 População', value: '+500 Milhões', inline: true })
        .addFields({ name: '☢️ Arsenal Nuclear', value: `6 ogivas preservadas`, inline: true })
        .addFields({ name: '⚡ Ação', value: 'Agora use B!exercito para ver suas forças!', inline: false })
        .setFooter({ text: 'Comando de Emergência Imperial • OneBot' })
        .setTimestamp();
    
    message.channel.send({ embeds: [embed] });
};