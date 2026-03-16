const { Client, GatewayIntentBits } = require("discord.js");
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require("@discordjs/voice");
const http = require("http");

const TOKEN = process.env.TOKEN;

const STREAM_URL = "https://drive.google.com/uc?export=download&id=1RbphI_EA_gREPo0fLsXS8jG7Mu8aEVLo";

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

    const resource = createAudioResource(STREAM_URL);

    player.play(resource);

    connection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => {
      const newResource = createAudioResource(STREAM_URL);
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
