const Discord = require("discord.js");
const cpuStat = require("cpu-stat");
const fs = require("fs");
const os = require('os');
const db = require('../systems/firestore');
exports.run = async (client, message, args) => {

  // Função para formatar a memória em MB ou GB conforme necessário
    function formatMemory(memoryInMB) {
      if (memoryInMB >= 1024) {
        return `${(memoryInMB / 1024).toFixed(2)} GB`;
      }
      return `${memoryInMB.toFixed(2)} MB`;
    }
  
  let user = message.author;
  
     let ban = await db.fetch(`banido_${user.id}`);

const embed1 = new Discord.EmbedBuilder()
  .setTitle(`ERRO - BLACKLIST`)
  .setColor('Random')
  .setDescription(`${message.author}, Você foi banido! ¯\_(ツ)_/¯\n\nVocê está na minha Blacklist e não pode usar meus comandos, Será que é tão difícil assim seguir as regras?\n\nCaso você ache que seu banimento foi injusto (Concerteza não foi), você pode entrar em Contato com a Equipe Do OneBot\n\nAo entrar em contato conosco, aguarde que logo iremos resolver seu problema, caso você tenha sido banido(a) injustamente iremos resolver, caso contrário você permanecerá banido(a)\n\nFormas de suporte:\n\n[Servidor, Suporte mais rápido.](https://discord.gg/sVkB8dtKp7)\n[Site(Use para suporte via EMAIL)](https://equipeonebot.wixsite.com/websiteonebot)`)
  if(ban >= 1) return message.channel.send({ embeds: [embed1] })
cpuStat.usagePercent(function(err, percent, seconds) {

  const totalMemoryMB = os.totalmem() / 1024 / 1024; // Convertendo de bytes para MB
    const freeMemoryMB = os.freemem() / 1024 / 1024; // Convertendo de bytes para MB
    const usedMemoryMB = totalMemoryMB - freeMemoryMB; // Memória usada em MB
    const usedMemoryPercentage = (usedMemoryMB / totalMemoryMB) * 100; // Porcentagem de memória usada
  
  
  const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
  const commandCount = commandFiles.length;
  
  const embed = new Discord.EmbedBuilder()
 .setColor(Math.floor(Math.random() * 0xffffff))
 .setTitle(`Minhas Informações`)
 .setDescription(`Olá ${message.author} Abaixo você verá minhas informações! E obrigado por me utilizar.
Sistema Anti-Spam Automático: 
<:off:806557496969789480>
Sistema Do Bot: <:manuteno:1011055405151047730>
(Um pouco instável para o Mega Update)`)

.addFields({ name: '<:jornal_icon:1245048926487187466> |Versão:', value: `1.6.0 (beta)`, inline: true })
.addFields({ name: '<a:developer_2:1019045495492050954>|Meu Developer:', value: 'vlad_dracull', inline: true })
.addFields({ name: '<:ping:1020302394464157717>|Meu Ping:', value: `${client.ws.ping}ms`, inline: true })
    .addFields({ name: '<:mundo_icon:1245046923556032574>|**Estou em**:', value: `${client.guilds.cache.size} Servidores!`, inline: true })
.addFields({ name: '<:user:1019271077890887781> |**Gerenciando**: ', value: `${client.users.cache.size} Usúarios`, inline: true })
.addFields({ name: '<:chat:1019045418509795338>|Estou observando:', value: `${client.channels.cache.size} Chat's`, inline: true })  .addFields({ name: '<:javascript:1245036377154785381> **|**Linguagem:**', value: `Sou Desenvolvido Em [JavaScript](https://pt.wikipedia.org/wiki/JavaScript) Utilizando <:js:1029940174316126289> [Node.js](https://pt.wikipedia.org/wiki/Node.js)`, inline: true }) .addFields({ name: '<:discordJS_icon:1245035915433349140> **|**Discord.js:', value: `v12.5.3`, inline: true })
.addFields({ name: '<:replit_Icon:805405717427126332>|**Hospedagem**:', value: `[Square Cloud](https://squarecloud.app/)`, inline: true })
.addFields({ name: 'Comandos', value: `Possuo ${commandCount} comandos`, inline: true })
.addFields({ name: '<:developer_icon:1196780422781218826>|**Equipe de Desenvolvimento**:', value: `\`\`\`Vlad II Dracull#3843 (Criador | Equipe de Scripters)\nVini_.x#5166 (Desenvolvedor Nível 4 | Supervisiona Os Desenvolvedores)\nRush#2325 (Desenvolvedor Nível 2 | Responsável por dar Blacklist em usuários que descumprem regras)\nSerhGamerYt#8648 (Desenvolvedor Nível 1 | Equipe de Scripters)\`\`\``, inline: true })
.addFields({ name: 'Memória Total:', value: formatMemory(totalMemoryMB), inline: true })
.addFields({ name: 'Memória Usada:', value: formatMemory(usedMemoryMB), inline: true })
.addFields({ name: 'Memória Livre:', value: formatMemory(freeMemoryMB), inline: true })
.addFields({ name: 'Porcentagem de Memória Usada:', value: `${usedMemoryPercentage.toFixed(2)}%`, inline: true })
.addFields({ name: 'CPU Usada:', value: `${percent.toFixed(2)}%`, inline: true })
.addFields({ name: '<:Info_Icon:806691789523517502>|Meus Links', value: `=========================`, inline: true })
.addFields({ name: 'Precisa de ajuda? Entre no meu server de suporte', value: `[Servidor de suporte](https://discord.gg/6VHqJqHC92)`, inline: true })

  .addFields({ name: 'Website:', value: `[Clique aqui!](https://equipeonebot.wixsite.com/websiteonebot)`, inline: true })
    
.addFields({ name: '<:icon_bot:1031263130262700072>|Me adicione no seu servidor', value: `[Me adicione clicando aqui](https://discordapp.com/oauth2/authorize?client_id=806321120713768991&scope=bot&permissions=2146958847https://discordapp.com/oauth2/authorize?client_id=806321120713768991&scope=bot&permissions=2146958847)`, inline: true })
.setFooter({ text: `Informações Requisitadas Por ${message.author.username}` })
.setTimestamp();
message.channel.send({ embeds: [embed] })

})
}