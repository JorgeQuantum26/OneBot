module.exports = {
    name: 'stop',
    description: 'Para a música e sai do canal',
    execute(message) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return message.channel.send('Você precisa estar em um canal de voz para parar a música.');
        }

        voiceChannel.leave();
        message.channel.send('Música parada e saí do canal de voz.');
    }
};