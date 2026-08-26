var Discord = require('discord.js');



exports.run = async(bot, msg, args) => {
     if(!["758473669658935328"].includes(message.author.id)) {
     return message.channel.send(`<a:nao:868232161289986128>|Apenas meus Desenvolvedores Podem Executar Este Comando Por ele estar fora do ar.`)
     }
    
  if(!msg.member.hasPermission('KICK_MEMBERS')) return msg.reply('<a:X_Icon:806588437049638992>| Voce nao tem permissao para utilizar esse comando!');
  if(message.guild.me.hasPermission("KICK_MEMBERS"))
    return message.channel.send({embed: {
      title: "Erro ao Executar este comando!",
      description: `<a:nao:868232161289986128>| Eu não tenho a permissão de **Expulsar_membros** Para executar este comando`,
      color: "RANDOM"
    }})

    var user = msg.mentions.users.first();
    if(!user) return msg.reply('<a:X_Icon:806588437049638992>|Mencione Um Usuário!');

    var member;

    try {
        member = await msg.guild.members.fetch(user);
    } catch(err) {
        member = null;
    }

    if(!member) return msg.reply('<a:X_Icon:806588437049638992>|Este usuario não está no servidor!');
    if(member.hasPermission('MANAGE_MESSAGES')) return msg.reply('<a:X_Icon:806588437049638992>|Você não pode expulsar este usuario');
    if(member.hasPermission('MANAGE_MESSAGES')) return msg.reply('<a:X_Icon:806588437049638992>|Você não pode expulsar este usúario');
    
    var reason = args.splice(1).join(' ');
    if(!reason) return msg.reply('<a:X_Icon:806588437049638992>|Dê um motivo!');

    var channel = msg.guild.channels.cache.find(c => c.id === '859338437365334016');

    var log = new Discord.EmbedBuilder()
    .setColor('#2ecc71')
    .setTitle('<a:VerificadoVerdeIcon:806590288424468520>|Usuário Expulso')
    .addFields({ name: 'Usuario Expulso:', value: user, inline: true })
    .addFields({ name: 'Expulso Por:', value: msg.author, inline: true })
    .addFields({ name: 'Motivo:', value: reason, inline: false })
    channel.send({ embeds: [log] });

    var embed = new Discord.EmbedBuilder()
    .setTitle('| Voce foi Expulso! **Motivo**')
    .setDescription(reason);

    try {
        await user.send({ embeds: [embed] });
    } catch(err) {
        console.warn(err);
    }

    member.kick(reason);

    msg.channel.send(`<a:VerificadoVerdeIcon:806590288424468520>|**${user}** Foi Expulso por **${msg.author}** Do servidor!!`);
}