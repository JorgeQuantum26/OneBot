const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');

module.exports = {
    name: 'play',
    description: 'Toca uma música a partir de um link ou nome',
    async execute(message, args) {
        const voiceChannel = message.member.voice.channel;

        if (!voiceChannel) {
            return message.channel.send('Você precisa estar em um canal de voz para tocar música!');
        }

        // Verifica permissões
        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
            return message.channel.send('Eu preciso de permissões para entrar e falar no canal de voz!');
        }

        let songInfo;
        let song;

        if (ytdl.validateURL(args[0])) {
            // Se for uma URL do YouTube
            songInfo = await ytdl.getInfo(args[0]);
            song = { title: songInfo.videoDetails.title, url: songInfo.videoDetails.video_url };
        } else {
            // Se for o nome da música, busca no YouTube
            const searchResult = await ytSearch(args.join(' '));
            if (searchResult.videos.length === 0) {
                return message.channel.send('Nenhum resultado encontrado.');
            }
            song = { title: searchResult.videos[0].title, url: searchResult.videos[0].url };
        }

        const connection = await voiceChannel.join();
        const dispatcher = connection.play(ytdl(song.url, { filter: 'audioonly' }));

        message.channel.send(`Tocando: **${song.title}**`);
        dispatcher.on('finish', () => {
            voiceChannel.leave();
        });
    }
};