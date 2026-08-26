module.exports = {
    name: 'resume',
    description: 'Resumir a música pausada',
    execute(message) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return message.channel.send('Você precisa estar em um canal de voz para resumir a música.');
        }

        const serverQueue = message.client.queue.get(message.guild.id);
        if (!serverQueue) return message.channel.send('Não há música tocando agora.');

        if (serverQueue.connection.dispatcher) {
            serverQueue.connection.dispatcher.resume();
            message.channel.send('Música retomada.');
        }
    }
};