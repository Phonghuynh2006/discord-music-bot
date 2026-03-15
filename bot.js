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

// Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// Audio player
const player = createAudioPlayer({
  behaviors: {
    noSubscriber: NoSubscriberBehavior.Play
  }
});

client.once("clientReady", () => {
  console.log(`✅ Bot online: ${client.user.tag}`);
});

// Player events
player.on("error", error => {
  console.error("❌ Player error:", error.message);
});

player.on("stateChange", (oldState, newState) => {
  console.log(`Player: ${oldState.status} -> ${newState.status}`);
});

// Message handler
client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;

  // PLAY COMMAND
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

      // Chờ kết nối voice
      await entersState(connection, VoiceConnectionStatus.Ready, 30000);

      connection.on("stateChange", (oldState, newState) => {
        console.log(`Voice: ${oldState.status} -> ${newState.status}`);
      });

      const stream = ytdl(url, {
        filter: "audioonly",
        quality: "highestaudio",
        highWaterMark: 1 << 26
      });

      const resource = createAudioResource(stream, {
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

  // STOP COMMAND
  if (message.content === "!stop") {
    player.stop();
    message.reply("⛔ Đã dừng nhạc!");
  }

  // LEAVE COMMAND
  if (message.content === "!leave") {
    const connection = getVoiceConnection(message.guild.id);
    if (connection) connection.destroy();
    message.reply("🚪 Bot đã rời phòng voice!");
  }
});

// Login bot
client.login(process.env.TOKEN);

// Web server nhỏ cho Render
const http = require("http");

http.createServer((req, res) => {
  res.write("Bot is running");
  res.end();
}).listen(3000);
