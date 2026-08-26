// Importe as dependências necessárias
const { inspect } = require("util");
const Discord = require("discord.js");

// ...

// Dentro do seu arquivo de comandos (onde você lida com os comandos do bot)
module.exports = {
  name: "eval",
  description: "Executa código JavaScript.",
  run: async (client, message, args) => {
    // Verifique se o autor da mensagem é um administrador (você pode personalizar essa verificação)
    if (message.author.id !== "758473669658935328") {
      return message.channel.send("Você não tem permissão para usar este comando.");
    }

    try {
      // Obtenha o código a ser avaliado (remova o prefixo do comando)
      const code = args.join(" ");

      // Avalie o código
      let result = await eval(code);

      // Formate o resultado para exibição (usando util.inspect para objetos complexos)
      result = inspect(result, { depth: 0 });

      // Envie o resultado de volta ao canal
      const embed = new Discord.EmbedBuilder()
        .setDescription(`Entrada:\n\`\`\`js\n${code}\`\`\`\nResultado:\n\`\`\`js\n${result}\`\`\``);
      message.channel.send({ embeds: [embed] });
    } catch (error) {
      // Em caso de erro, envie uma mensagem de erro
      message.channel.send(`Ocorreu um erro:\n\`\`\`js\n${error}\`\`\``);
    }
  }
};
