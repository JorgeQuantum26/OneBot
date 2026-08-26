const cooldowns = {}

const ms = require("ms")


    if(!cooldowns[message.author.id]) cooldowns[message.author.id] = {
        lastCmd: null
      }
let ultimoCmd = cooldowns[message.author.id].lastCmd 
     let timeout = 0
    if (ultimoCmd !== null && timeout- (Date.now() - ultimoCmd) > 0) {
let time = ms(timeout - (Date.now() - ultimoCmd)); 
let resta = [time.seconds, 'segundos']
 
if(resta[0] == 0) resta = ['alguns', 'millisegundos']
if(resta[0] == 1) resta = [time.seconds, 'segundo']
const aguarde = new Discord.EmbedBuilder()
  .setTitle(':negado: Muita Calma nessa hora amigão !!!')
  .setColor('#000001')
  .setDescription(`**Por favor ${message.author}, espere **\`${time}\`** para executar outro comando**`)
        message.channel.send({ embeds: [aguarde] }).then(msg=> {
    msg.delete({ timeout: 0 });
        })
       return;
    } else {
                 cooldowns[message.author.id].lastCmd = Date.now() 
    }
    