const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const ytdl = require('ytdl-core');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.on('ready', () => {
    console.log(`Bot đã online: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.content.startsWith('!play')) {
        const url = message.content.split(' ')[1];

        if (!url) return message.reply('Thiếu link nhạc!');

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.reply('Bạn phải vào voice!');

        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator
        });

        const stream = ytdl(url, { filter: 'audioonly' });

        const player = createAudioPlayer();
        const resource = createAudioResource(stream);

        player.play(resource);
        connection.subscribe(player);

        message.reply('Đang phát nhạc 🎵');
    }
});

client.login(process.env.TOKEN);
