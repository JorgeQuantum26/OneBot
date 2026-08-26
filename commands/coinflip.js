{}const Discord = require("discord.js")

exports.run = async (client, message, args) => {
  var array1 = ["cara", "coroa"];

  var rand = Math.floor(Math.random() * array1.length);

  if (!args[0] || (args[0].toLowerCase() !== "cara" && args[0].toLowerCase() !== "coroa")) {
    message.inlineReply("<a:X_Icon:806588437049638992>|Insira cara ou coroa na frente do comando.");
  } 
else if (args[0].toLowerCase() == array1[rand]) {
    message.channel.send("Deu " + array1[rand] + ", você ganhou dessa vez!");
  } 
else if (args[0].toLowerCase() != array1[rand]) {
    message.channel.send("Deu " + array1[rand] + ", você perdeu dessa vez!"
    );
  }
};