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
const http = require("http");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const player = createAudioPlayer({
  behaviors: {
    noSubscriber: NoSubscriberBehavior.Play
  }
});

client.once("ready", () => {
  console.log(`✅ Bot online: ${client.user.tag}`);
});

player.on("error", error => {
  console.error("❌ Player error:", error.message);
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
        selfDeaf: true
      });

      // reconnect nếu voice bị rớt
      connection.on("stateChange", (oldState, newState) => {
        if (newState.status === "disconnected") {
          try {
            connection.rejoin();
            console.log("🔄 Reconnecting voice...");
          } catch {
            connection.destroy();
          }
        }
      });

      await entersState(connection, VoiceConnectionStatus.Ready, 60000);

      const stream = ytdl(url, {
        filter: "audioonly",
        quality: "highestaudio",
        highWaterMark: 1 << 25,
        dlChunkSize: 0
      });

      const resource = createAudioResource(stream);

      player.play(resource);
      connection.subscribe(player);

      message.reply("🎵 Đang phát nhạc...");

    } catch (err) {
      console.error("VOICE ERROR:", err);
      message.reply("❌ Không phát được audio!");
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
