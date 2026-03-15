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

const play = require("play-dl");
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

client.once("clientReady", () => {
  console.log(`✅ Bot online: ${client.user.tag}`);
});

player.on("error", error => {
  console.error("Player error:", error.message);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;

  const args = message.content.split(" ");
  const command = args[0];

  if (command === "!play") {

    const url = args[1];

    if (!url) {
      return message.reply("❌ Vui lòng nhập link YouTube.");
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

      await entersState(connection, VoiceConnectionStatus.Ready, 60000);

      const stream = await play.stream(url);

      const resource = createAudioResource(stream.stream, {
        inputType: stream.type
      });

      player.play(resource);
      connection.subscribe(player);

      message.reply("🎵 Đang phát nhạc...");

    } catch (err) {

      console.error("VOICE ERROR:", err);
      message.reply("❌ Không phát được nhạc.");

    }
  }

  if (command === "!stop") {
    player.stop();
    message.reply("⛔ Đã dừng nhạc!");
  }

  if (command === "!leave") {

    const connection = getVoiceConnection(message.guild.id);

    if (connection) {
      connection.destroy();
    }

    message.reply("🚪 Bot đã rời phòng voice.");
  }
});

client.login(process.env.TOKEN);



// Web server để Render detect port
const PORT = process.env.PORT || 10000;

http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Bot is running");
}).listen(PORT, "0.0.0.0", () => {
  console.log("🌐 Web server running on port " + PORT);
});
