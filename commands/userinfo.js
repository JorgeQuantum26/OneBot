const { EmbedBuilder } = require('discord.js');
const moment = require('moment');

const flags = {
    DISCORD_EMPLOYEE: 'Empregado do Discord',
    DISCORD_PARTNER: 'Parceiro do Discord',
    BUGHUNTER_LEVEL_1: 'Bug Hunter (Level 1)',
    BUGHUNTER_LEVEL_2: 'Bug Hunter (Level 2)',
    HYPESQUAD_EVENTS: 'Eventos HypeSquad',
    HOUSE_BRAVERY: 'Bravery HypeSquad',
    HOUSE_BRILLIANCE: 'Brilliance HypeSquad',
    HOUSE_BALANCE: 'Balance HypeSquad',
    EARLY_SUPPORTER: 'Apoiante inicial',
    TEAM_USER: 'Usuário da equipe',
    SYSTEM: 'Sistema',
    VERIFIED_BOT: 'Bot verificado',
    VERIFIED_DEVELOPER: 'Desenvolvedor de bot verificado',
    TAG_BOT: 'Bot'
};

module.exports = {
    name: 'userinfo',
    description: 'Veja informações de membros mencionados',
    aliases: ['userinfo', 'user'],
    run: async (client, message, args) => {

        const member = message.mentions.members.last() || message.member;
        
        // Verifica se o membro é um bot
        const isBot = member.user.bot; // Aqui está a correção

        const isBotTag = isBot ? "(<:bot_tag:1289413302857760778>)" : "";
        
        const roles = member.roles.cache
            .sort((a, b) => b.position - a.position)
            .map(role => role.toString())
            .slice(0, -1);
        
        const userFlags = member.user.flags.toArray();
        
        const embed = new EmbedBuilder()
            .setDescription(`**${member.user.username}**`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
            .setColor(member.displayHexColor || 'BLACK')
            .addFields({ name: 'Usuário:', value: [
                `🍭 Nome de usuário: ${member.user.username} ${isBotTag}`,
                `**🔱 Tag**: ${member.user.discriminator}`,
                `**️⚠️ ID**: ${member.id}`,
                `**🔰 Emblemas**: ${userFlags.length ? userFlags.map(flag => flags[flag]).join(', ') : 'Nenhum'}`,
                `**🏷 Avatar**: [Clique aqui](${member.user.displayAvatarURL({ dynamic: true })})`,
                `**📌 Criada em**: ${moment(member.user.createdTimestamp).format('LT')} ${moment(member.user.createdTimestamp).format('LL')} ${moment(member.user.createdTimestamp).fromNow()}`,
                `\u200b`
            ], inline: false })
            .addFields({ name: 'Informações no servidor:', value: [
                `**🔥 Cargo mais alto**: ${member.roles.highest.id === message.guild.id ? 'Nenhum' : member.roles.highest.name}`,
                `**🌐 Entrou aqui em**: ${moment(member.joinedAt).format('LL LTS')}`,
                `**📎 Cargos** [${roles.length}]: ${roles.length < 10 ? roles.join(', ') : roles.length > 10 ? this.client.utils.trimArray(roles) : 'Nenhum'}`,
                `\u200b`
            ], inline: false });

        return message.channel.send({ embeds: [embed] });
    }
};