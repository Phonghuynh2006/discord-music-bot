const { Client, GatewayIntentBits } = require('discord.js');
const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource,
    entersState,
    VoiceConnectionStatus,
    AudioPlayerStatus
} = require('@discordjs/voice');
const ytdl = require('ytdl-core');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log(`Bot đã online: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (!message.content.startsWith('!play')) return;

    try {
        const url = message.content.split(' ')[1];
        if (!url) return message.reply('Thiếu link nhạc!');

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.reply('Bạn phải vào voice!');

        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator
        });

        // Đợi bot connect voice
        await entersState(connection, VoiceConnectionStatus.Ready, 30000);

        const stream = ytdl(url, { filter: 'audioonly', quality: 'highestaudio' });

        const player = createAudioPlayer();
        const resource = createAudioResource(stream);

        player.play(resource);
        connection.subscribe(player);

        player.on(AudioPlayerStatus.Idle, () => {
            connection.destroy();
        });

        message.reply('Đang phát nhạc 🎵');

    } catch (err) {
        console.error(err);
        message.reply('Lỗi khi phát nhạc!');
    }
});

process.on('unhandledRejection', console.error);

client.login(process.env.TOKEN);
