const Discord = require("discord.js");
const db =  require('../systems/firestore');

exports.run = async(client, message, args) => {
  let user =  message.author;
  let money = db.get(`money_${message.guild.id}_${user.id}`);
  if(money === null) money = 0;

   let deposito = parseInt(args[0]);
  if(!deposito) {
    message.channel.send(`:x:| ${user} Voce não inseriu um valor`);
    return;
  }
  if(money < deposito) {
    message.channel.send(`:x: | ${user} Voce não tem saldo suficiente para realizar esse deposito`);
    return;
  }

  if(deposito <= 0) {
    message.channel.send(`:x:| ${user} Insira um numero maior quee 0`);
    return;
  }
    if(isNaN(deposito)) {
      message.channel.send(`:x:|${user} Insira numeros validos`);
      return;
    }
    if(user.id !== "758473669658935328")  {
      message.channel.send(`${user} Voce não tem permissão para usar esse comando`)
      return;
    } 
    const embed = new Discord.EmbedBuilder()
   .setTitle("Deposito - Cassino")
   .setColor('#2ecc71')
   .setDescription(`<a:verificado_icon1:1245042804133072976> | ${user} Voce depositou ${deposito} OneCoins no saldo do Cassino.`)
   .setFooter({ text: `Comando Executado por ${user.username}` })
    .setTimestamp();

     message.channel.send({ embeds: [embed] });
     db.add(`cassMoney`, deposito);
    db.subtract(`money_${message.guild.id}_${user.id}`, deposito);
  
}