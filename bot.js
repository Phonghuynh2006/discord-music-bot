const { Client, GatewayIntentBits } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  entersState,
  VoiceConnectionStatus,
  NoSubscriberBehavior
} = require("@discordjs/voice");

const ytdl = require("@distube/ytdl-core");
const http = require("http"); // thêm web server

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// Player ổn định hơn
const player = createAudioPlayer({
  behaviors: {
    noSubscriber: NoSubscriberBehavior.Play
  }
});

client.once("clientReady", () => {
  console.log(`✅ Bot online: ${client.user.tag}`);
});

player.on("error", error => {
  console.error("❌ Player error:", error.message);
});

player.on("stateChange", (oldState, newState) => {
  console.log(`Player: ${oldState.status} -> ${newState.status}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;

  if (message.content.startsWith("!play")) {

    const args = message.content.split(" ");
    const url = args[1];

    if (!url || !ytdl.validateURL(url)) {
      return message.reply("❌ Link YouTube không hợp lệ!");
    }

    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel) {
      return message.reply("❌ Bạn phải vào phòng voice trước!");
    }

    try {

      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
        selfDeaf: false
      });

      await entersState(connection, VoiceConnectionStatus.Ready, 60000);

      const stream = ytdl(url, {
        filter: "audioonly",
        quality: "highestaudio",
        highWaterMark: 1 << 25,
        liveBuffer: 4900
      });

      const resource = createAudioResource(stream, {
        inputType: "arbitrary",
        inlineVolume: true
      });

      player.play(resource);
      connection.subscribe(player);

      message.reply("🎵 Đang phát nhạc...");

    } catch (err) {
      console.error("VOICE ERROR:", err);
      message.reply("❌ Không phát được audio từ video!");
    }
  }

  if (message.content === "!stop") {
    player.stop();
    message.reply("⛔ Đã dừng nhạc!");
  }

  if (message.content === "!leave") {
    const connection = getVoiceConnection(message.guild.id);
    if (connection) connection.destroy();
    message.reply("🚪 Bot đã rời phòng voice!");
  }
});

client.login(process.env.TOKEN);

// ===== Web server để Render detect port =====
const PORT = process.env.PORT || 10000;

http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Bot is running");
}).listen(PORT, "0.0.0.0", () => {
  console.log("🌐 Web server running on port " + PORT);
});
