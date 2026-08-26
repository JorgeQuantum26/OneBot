const Nuggies = require("nuggies");
const Discord = require("discord.js")

module.exports.run = async (client, message, args) => {
    const options = new Nuggies.dropdownroles().addrole({
        label: 'Hallowen',
        role: '1032055074005983353`',
        emoji: '1019271299811516456'
    }).addrole({
        label: 'mobile',
        role: '1020712694166343780',
        emoji: '📱'
    });

    Nuggies.dropdownroles.create({
        message: message,
        role: options, /*dropdownroles constructor*/ 
        content: new Discord.EmbedBuilder().setTitle('Clique para obter o cargo').setDescription('Dropdown por cargos').setColor('#3498db'),
        channelID: message.channel.id
    });
}

module.exports.config = {
    name: "dd",
    aliases: []
}