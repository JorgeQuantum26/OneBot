const db = require('../systems/firestore');

const { EmbedBuilder } = require('discord.js')


module.exports = {
    name: "setlogs",
    aliases: ['logs'],

    run: async(client, message, args) => {

        let canal = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
        let author = message.author;
        let err = "Mencione um canal";
        let msg_error_perm = "Você não possui permissão para utilizar este comando.";
        let msg_error_ferinha_canal = "Você deve escrever com \`!setmodlogs #canal\`.";
        let msg_confirmado = "Canal setado";
        let prefix = db.get(`prefix_${message.guild.id}`) || 'j.';

    if(args[0] === "edit"){

        let perm = "**Gerenciar Servidor**";
        let msg_error_perm = `:x: | ${author} Você não possui de ${perm}.`

        if (!message.member.hasPermission("MANAGE_GUILD")) return message.channel.send(`${msg_error_perm}`);
        if (!canal) return message.channel.send(`:x: | ${author} ${err}.`);

        db.set(`msg_edit_${message.guild.id}`, canal.id);

        let confirm_pt1 = "O canal";
        let confirm_pt2 = "foi configurado com sucesso.";
        message.channel.send(`✅ ${author} ${confirm_pt1} ${canal} ${confirm_pt2}`)
      }
    if(args[0] === "delete"){

        let perm = "**Gerenciar Servidor**";
        let msg_error_perm = `:x: | ${author} Você não possui de ${perm}.`

        if (!message.member.hasPermission("MANAGE_GUILD")) return message.channel.send(`${msg_error_perm}`);
        if (!canal) return message.channel.send(`:x: | ${author} ${err}.`);

        db.set(`msg_del_${message.guild.id}`, canal.id);

        let confirm_pt1 = "O canal";
        let confirm_pt2 = "foi configurado com sucesso.";
        message.channel.send(`✅ ${author} ${confirm_pt1} ${canal} ${confirm_pt2}`)
    }
    if(args[0] === "mod"){

        if(!message.member.hasPermission("MANAGE_GUILD")) return message.channel.send(`:x: | ${author} ${msg_error_perm}`)

        let canal = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);

        if(!canal) return message.channel.send(`:x: | ${author} ${msg_error_canal}`);

        db.set(`mod_logs_${message.guild.id}`, canal.id);

        let mod_logs0 = db.get(`mod_logs_${message.guild.id}`, canal.id);

        message.channel.send(`✅ | ${author} ${msg_confirmado} para <#${mod_logs0}> com sucesso.`)
    }
    if(!args[0]){
        let embed = new EmbedBuilder()
            .setTitle('Set Logs')
            .addFields({ name: 'Mensagens Editadas', value: `\`B!setlogs edit <#canal>\` Para setar um canal de  mensagens editadas`, inline: false })
            .addFields({ name: 'Mensagens Apagadas', value: `\`B!setlogs delete <#canal>\` Para setar um canal de mensagens apagadas`, inline: false })
            .addFields({ name: 'Mensagens de Moderação', value: `\`B!setlogs mod <#canal>\` Para setar um canal de mensagens de mute, unmute, banimentos, desbanimentos.`, inline: false })
            .setColor('#f1c40f')
    message.channel.send({ embeds: [embed] })
    }
  }   
}
client.on("messageDelete", async (message) => {



  let canal = db.get(`msg_del_${message.guild.id}`);
  if (!canal === null) return;

  if (message.author.bot) return;

  let author = message.author;
  let canal_2 = message.channel;
  let msg_del = message.content;

  let msg_embed = new EmbedBuilder()
  .setTitle(`🗑 Mensagem excluída`)
  .setColor(Math.floor(Math.random() * 0xffffff))
  .addFields(
    {
      name: `Autor da mensagem`,
      value: author,
      inline: false
    },
    {
      name: `Canal`,
      value: canal_2,
      inline: false
    },
    {
      name: `Mensagem`,
      value: `\`\`\`${msg_del}\`\`\``,
      inline: false
    }
  )
  .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
  .setTimestamp()
  .setFooter({ text: { text: message.guild.name, iconURL: message.guild.iconURL() } });

  client.channels.cache.get(canal).send({ embeds: [msg_embed] })
});



client.on("messageUpdate", async (message, oldMessage) => {
  let canal = db.get(`msg_edit_${message.guild.id}`);
  if (!canal === null) return;

  if (message.author.bot) return;

  let author = message.author;
  let canal_2 = message.channel;
  let msg_antiga = message.content;
  let msg_editada = oldMessage.content;

  let embed = new EmbedBuilder()
  .setTitle(`📝 Mensagem editada`)
  .setColor(Math.floor(Math.random() * 0xffffff))
  .addFields(
    {
      name: `Autor da mensagem`,
      value: author,
      inline: false
    },
    {
      name: `Canal`,
      value: canal_2,
      inline: false
    },
    {
      name: `Mensagem antiga`,
      value: `\`\`\`${msg_antiga}\`\`\``,
      inline: false
    },
    {
      name: `Mensagem editada`,
      value: `\`\`\`${msg_editada}\`\`\``,
      inline: false
    }
  )
  .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
  .setTimestamp()
  .setFooter({ text: { text: message.guild.name, iconURL: message.guild.iconURL() } });

  client.channels.cache.get(canal).send({ embeds: [embed] })
});