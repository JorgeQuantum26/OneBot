const Discord = require("discord.js");
const db = require('../systems/firestore');

exports.run = async (client, message, args) => {

  let user = message.author;

  if (user.id !== "758473669658935328") {
  const erro1 = new Discord.EmbedBuilder()
    .setDescription(`<a:carregando:1246119195901689888>**|** Verificando Permissões de ${user}...`);

  let msg = await message.channel.send({ embeds: [erro1] });

  // Simula a digitação e execução do código de verificação
  setTimeout(async () => {
    let codigoSimulado = "```javascript\n";

    // Simula a digitação do código
    for (let i = 0; i < 3; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Delay de 1 segundo

      codigoSimulado += `console.log('Verificando permissões...');\n`;

      // Simula código intermediário mais complexo
      if (i === 1) {
        codigoSimulado += `
const permissoes = usuario.permissions.toArray();

permissoes.forEach((permissao) => {
  console.log('Permissão: ' + permissao);
});
        \n`;
      }

      msg.edit(erro1.setDescription(codigoSimulado + "```"));
    }

    codigoSimulado += `
if (permissoes.includes(ADMINISTRATOR) && user.id === dev.id) {
  console.log('Usuário é um Desenvolvedor.');
} else {
  console.log('Usuário não é um desenvolvedor.');
}
\`\`\`
`;

    const resultEmbed = new Discord.EmbedBuilder()
      .setDescription(codigoSimulado);

    // Verifica se o usuário tem a permissão de administrador
    
      resultEmbed.addFields({ name: "Resultado", value: "O usuário não possui permissão de Desenvolvedor..", inline: false });

    // Edita a mensagem para mostrar o código simulado e o resultado
    msg.edit({ embeds: [resultEmbed] });
  }, 4000); // 2000ms de atraso para simular verificação
    return;
  }
  
  let money = await db.fetch(`cassMoney`) || 0;
  if(money === null) money = 0;
  let saque = parseInt(args[0]);

  if(money < saque) {
    message.channel.send(`:x:**|** ${user} Valor do saque é maior que o saldo do Cassino disponível! \`\`\`${saque.toLocaleString()}/${money.toLocaleString()}\`\`\``);
    return;
  }

  if(!saque) {
    message.channel.send(`:x:**|** ${user} Você precisa inserir o valor do saque!`);
    return;
  }
  if(isNaN(saque)) {
    message.channel.send(`:x:**|** ${user} Use apenas números válidos!`);
    return;
  }
  if(saque <= 0) {
    message.channel.send(`:x:**|** ${user} Use apenas valores acima de **0**!`);
    return;
  }

  const embed = new Discord.EmbedBuilder()
  .setTitle(`💰 | Cassino - Saque`)
  .setColor('#e67e22')
  .setDescription(`<a:carregando:1246119195901689888> **|** ${user} Realizando saque, aguarde.`);

  let msg = await message.channel.send({ embeds: [embed] });

  setTimeout(async () => {

 
    const embed1 = new Discord.EmbedBuilder()
    .setTitle(`💰 | Cassino - Saque`)
    .setColor('#2ecc71')
    .setDescription(`<a:verificado_icon1:1245042804133072976> **|** ${user} Você sacou **${saque}** OneCoins do Cassino!`)
    .setFooter({ text: `© Cassino - OneBot 2024` })
    .setTimestamp();

     db.subtract(`cassMoney`, saque);
    db.add(`money_${message.guild.id}_${user.id}`, saque);
   
    msg.edit({ embeds: [embed1] })
  }, 5000)
}