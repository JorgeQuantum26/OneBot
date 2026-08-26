const Discord = require("discord.js");
const codes = ['JFK-Y5GU-5PWX']

exports.run = async(client, message, args) => {

for (var i = 0; i < codes.length; i++) {   
    if (message.content.includes(`${codes[i]}`)) {   
        // finding index of the code
        const index = codes.indexOf(codes[i]);
        //splicing from array
        codes.splice(index, 1) // splice(index of element, number of elements to delete)   
        const embed = new Discord.EmbedBuilder()
      .setTitle(`**CÓDIGO RESGATADO**`)
      .setDescription(`Parabéns! ${message.author}, você conseguiu resgatar o código com sucesso!`)
      .setFooter({ text: `© OneBot Todos Os direitos reservados!` })
      .setTimestamp();

      message.channel.send({ embeds: [embed] });
   
     break; 
    } 
}
} 