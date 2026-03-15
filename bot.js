const { Client, GatewayIntentBits } = require("discord.js");
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require("@discordjs/voice");
const play = require("play-dl");
const ffmpeg = require("ffmpeg-static");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.once("ready", () => {
  console.log("Bot đã online!");
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith("!play")) {

    const args = message.content.split(" ");
    const url = args[1];

    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel) {
      return message.reply("Bạn phải vào voice trước!");
    }

    if (!url) {
      return message.reply("Bạn phải gửi link nhạc!");
    }

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator
    });

    const stream = await play.stream(url);

    const resource = createAudioResource(stream.stream, {
      inputType: stream.type,
      inlineVolume: true
    });

    const player = createAudioPlayer();

    connection.subscribe(player);
    player.play(resource);

    message.reply("🎵 Đang phát nhạc...");
  }
});

client.login(process.env.TOKEN);
