const Discord = require("discord.js");
module.exports = {
  name: "Antilink",

  run: async(client, message, args) => {

    let user = message.author;

    let reason = args.slice(0).join(" ");
    if (!reason) reason = "Não especificado";
    
    const antilink3 = {
      nome: user,
      id: user.id,
      ativado: false,
      motivo: reason
    } 
    let antilink2 = db.get(`antilink_${message.guild.id}.ativado`)
    if(antilink2 === true) { antilink1 = '<:ativo:1254523429038850070>'
                 }
    if(antilink2 === true) {
      const embed = new Discord.EmbedBuilder()
      .setTitle(`<:link:1254496122106548225> Sistema Antilink `)
      .setColor('#e74c3c')
      .setDescription(`${antikink1} o Antikink foi ativado com sucesso.\nMotivo: **${reason}**`)
      .setFooter({ text: `© OneBot com todos os direitos reservados - 2024` })
      .setTimestamp();
      db.set(`antilink_${message.guild.id}.ativado`, true)
      return;
    } else {
    
    }
  }
}