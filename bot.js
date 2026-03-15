const { Client, GatewayIntentBits } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  entersState,
  VoiceConnectionStatus
} = require("@discordjs/voice");

const ytdl = require("@distube/ytdl-core");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// Cookie YouTube
const YOUTUBE_COOKIES = [
  {"domain":".youtube.com","expirationDate":1806573672,"hostOnly":false,"httpOnly":false,"name":"__Secure-1PAPISID","path":"/","sameSite":"unspecified","secure":true,"session":false,"storeId":"0","value":"vzBfi_Iw-GoSD_-J/AWsby0PmUuOMtIijH"}
];

const player = createAudioPlayer();

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
    if (!voiceChannel) return message.reply("❌ Bạn phải vào phòng voice trước!");

    try {
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator
      });

      await entersState(connection, VoiceConnectionStatus.Ready, 20000);

      const agent = ytdl.createAgent(YOUTUBE_COOKIES);

      const stream = ytdl(url, {
        quality: "highestaudio",
        filter: "audioonly",
        highWaterMark: 1 << 25,
        agent: agent
      });

      const resource = createAudioResource(stream, {
        inlineVolume: true
      });

      player.play(resource);
      connection.subscribe(player);

      message.reply("🎵 Đang phát nhạc...");

    } catch (err) {
      console.error(err);
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
