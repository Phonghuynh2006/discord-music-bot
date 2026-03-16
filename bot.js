const ffmpeg = require("ffmpeg-static");
process.env.FFMPEG_PATH = ffmpeg;

const { Client, GatewayIntentBits } = require("discord.js");
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, StreamType } = require("@discordjs/voice");
const http = require("http");

const TOKEN = process.env.TOKEN;

const STREAM_URL = "https://dl.dropboxusercontent.com/scl/fi/gcxxdr46j0349wk2wafmt/NH-C-CHILL.mp3";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

let player;

client.once("clientReady", () => {
  console.log("✅ Bot online: " + client.user.tag);
});

client.on("messageCreate", async (message) => {

  if (!message.guild || message.author.bot) return;

  if (message.content === "!play") {

    const voice = message.member.voice.channel;

    if (!voice) {
      return message.reply("❌ Bạn phải vào voice trước!");
    }

    const connection = joinVoiceChannel({
      channelId: voice.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator
    });

    player = createAudioPlayer();

    const resource = createAudioResource(STREAM_URL, {
      inputType: StreamType.Arbitrary,
      inlineVolume: true
    });

    player.play(resource);

    connection.subscribe(player);

    player.on("error", console.error);

    player.on(AudioPlayerStatus.Idle, () => {
      const newResource = createAudioResource(STREAM_URL, {
        inputType: StreamType.Arbitrary,
        inlineVolume: true
      });
      player.play(newResource);
    });

    message.reply("🎵 Đang phát MP3 (loop vô hạn)");
  }

  if (message.content === "!stop") {
    if (player) {
      player.stop();
      message.reply("⛔ Đã dừng nhạc");
    }
  }

});

client.login(TOKEN);

const PORT = process.env.PORT || 8080;

http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Bot running");
}).listen(PORT, () => {
  console.log("🌐 Web server running " + PORT);
});
