const Discord = require("discord.js");

module.exports = {
	name: 'restart',
	category: 'owner',
	run: async (client, message, args) => {

let embed1 = new Discord.EmbedBuilder()
    .setColor('Random')
    .setTitle(`Erro!`)
    .setDescription(`<a:nao:868232161289986128>**|**${message.author}, Você não tem permissão para Executar este comando. Pois apenas meu Criador pode executar este comando.`)
    .setFooter({ text: `© Staff OneBot` })
    .setTimestamp();
    
		if (message.author.id !== '758473669658935328') {
			return message.channel.send({ embeds: [embed1] });
		}
		message.channel.send('Você deseja efetuar essa ação?');

    if(args[0] == 'Sim') {
      await message.channel.send(`Bot Reiniciado com Sucesso!`)
    
		return process.exit();
    }

    if(args[0] == 'Não') return message.channel.send(`Comando cancelado.`)	.then(message => message.delete({ timeout: 5000 }))
	
    
  },
};