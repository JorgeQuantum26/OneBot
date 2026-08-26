const Discord = require('discord.js');

exports.run = async (client, message, args) => {


     let ban = await db.fetch(`banido_${user.id}`);

const embed1 = new Discord.EmbedBuilder()
  .setTitle(`ERRO - BLACKLIST`)
  .setColor('Random')
  .setDescription(`${message.author}, Você foi banido! ¯\_(ツ)_/¯\n\nVocê está na minha Blacklist e não pode usar meus comandos, Será que é tão difícil assim seguir as regras?\n\nCaso você ache que seu banimento foi injusto (Concerteza não foi), você pode entrar em Contato com a Equipe Do OneBot\n\nAo entrar em contato conosco, aguarde que logo iremos resolver seu problema, caso você tenha sido banido(a) injustamente iremos resolver, caso contrário você permanecerá banido(a)\n\nFormas de suporte:\n\n[Servidor, Suporte mais rápido.](https://discord.gg/sVkB8dtKp7)\n[Site(Use para suporte via EMAIL)](https://equipeonebot.wixsite.com/websiteonebot)`)
  if(ban >= 1) return message.channel.send({ embeds: [embed1] })  
    if(message.guild.me.hasPermission("MANAGE_MESSAGES"))
    return message.reply(`:x:| Eu não tenho a permissão de **Gerenciar_Mensagens** Para executar este comando`)
  if (!message.member.hasPermission('MANAGE_MESSAGES'))
		return message.reply(
			'<a:X_Icon:806588437049638992>|Voce não tem a permissão de `Gerenciar Mensagens` para usar esse comando'
		);
	const deleteCount = parseInt(args[0], 10);
	if (!deleteCount || deleteCount < 1 || deleteCount > 99)
		return message.reply(
			'<:X_Icon:806588437049638992>|Digite um número de até **99 mensagens** a serem excluídas'
		);

	const fetched = await message.channel.messages.fetch({
		limit: deleteCount + 1
	});
	message.channel.bulkDelete(fetched);
	message.channel
		.send(
			`<a:VerificadoVerdeIcon:806590288424468520>|**${
				args[0]
			} mensagens foram limpas neste chat com sucesso!**`
		)
		.then(msg => msg.delete({ timeout: 5000 }))
		.catch(error =>
			console.log(`Não foi possível deletar mensagens devido a: ${error}`)
		);
};