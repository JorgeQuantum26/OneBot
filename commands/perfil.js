const Discord = require("discord.js");
const db = require('../systems/firestore');

exports.run = async (bot, message, args) => {

  let pag = args[0];
  let user = bot.users.cache.get(args[0]) || message.mentions.users.first() || message.author;
  let ban = await db.fetch(`banido_${user.id}`);
  
  if(ban >= 1) {
    return message.channel.send(`${message.author}, Você foi banido! ¯\_(ツ)_/¯\n\nVocê está na minha Blacklist e não pode usar meus comandos, Será que é tão difícil assim seguir as regras?\n\nCaso você ache que seu banimento foi injusto (Concerteza não foi), você pode entrar em Contato com a Equipe Do OneBot\n\nAo entrar em contato conosco, aguarde que logo iremos resolver seu problema, caso você tenha sido banido(a) injustamente iremos resolver, caso contrário você permanecerá banido(a) `);
  }
  
  let perfil = { 
    criminal: await db.fetch(`crimial_${user.id}`) || "Meliante",
    policia: await db.fetch(`policia_${user.id}`) || "Não",
    força: await db.fetch(`força_${user.id}`) || 0,
    alistado: await db.fetch(`certificado_${user}`) || "Nenhum",
    cargo: await db.fetch(`cargo_${user}`) || "Nenhum",
    delegado: await db.fetch(`delegado_${user.id}`) || "Não",
    vida: await db.fetch(`hp_${user.id}`) || 0,
    exp: await db.fetch(`exp_${user.id}`) || 0,
    procurado: await db.fetch(`proc_${user.id}`) || "Não",
    energia: await db.fetch(`energia_${user.id}`) || 0,
    medals: await db.fetch(`medalha_${user.id}`) || "Sem Medalhas por Enquanto",
    topic: await db.fetch(`topico_${user.id}`) || "(Exército)",
    blacklist: await db.fetch(`banido_${user.id}`) || "Não",
    premiums: await db.fetch(`premiumplan_${user.id}`) || "Não", 
    hackerlvl: await db.fetch(`hackerlvl_${user.id}`) || 0,
    hacker: await db.fetch(`hacker_${user.id}`) || "Não",
    
  };


  if(!pag || pag === "{1}") {
  const embed = new Discord.EmbedBuilder()
    .setAuthor({ name: `Use B!perfil {pag} para mudar de página <Troque PÁG por NÚMERO `, iconURL: user.displayAvatarURL() })
    .setColor('Random')
    .setTitle(`Perfil`)
    .addFields(
      { name: 'Nome:', value: `${user}`, inline: true },
      { name: 'Usuário Está na Minha Blacklist?:', value: perfil.blacklist, inline: true },
      { name: 'Premium?:', value: perfil.premiums, inline: true },
      { name: 'Cidadão?:', value: perfil.criminal, inline: true },
      { name: 'Policial?:', value: perfil.policia, inline: true },
      { name: 'Força:', value: perfil.força, inline: true },
      { name: 'Delegado:', value: perfil.delegado, inline: true },
      { name: 'Vida', value: perfil.vida, inline: true },
      { name: 'Exp:', value: perfil.exp, inline: true },
      { name: 'Energia:', value: perfil.energia, inline: true },
      { name: 'Procurado:', value: perfil.procurado, inline: true },
      { name: 'Tópico:', value: perfil.topic, inline: true },
      { name: 'Certificado:', value: perfil.alistado, inline: true },
      { name: 'Patente no Exército', value: perfil.cargo, inline: true },
      { name: 'Medalhas:', value: perfil.medals, inline: true }, 
      { name: 'Conquistas desbloqueadas', value: 'Sistema sendo programado' }
    )
    .setFooter({ text: `© [Pág 1/2] RPG OneBot` })
    .setTimestamp();

  message.channel.send({ embeds: [embed] });

  }
  if(pag === "{2}") {
    const embed2 = new Discord.EmbedBuilder()
      
    .setTitle(`Perfil`)
    .setColor(Math.floor(Math.random() * 0xffffff))
    .addFields(
      { name: 'O usuário é um Hacker?', value: perfil.hacker, inline: true },
      { name: ' Nível de Hacker', value: perfil.hackerlvl, inline: true},
      { name: 'Em breve...', value: 'Em breve...', inline: true }
      )
      .setFooter({ text: `© [Pág 2/2] RPG OneBot` })
      
      .setTimestamp();
      message.channel.send({ embeds: [embed2] });
    
  }
}
