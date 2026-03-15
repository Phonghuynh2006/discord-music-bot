const { Client, GatewayIntentBits } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection
} = require("@discordjs/voice");

const ytdl = require("ytdl-core");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const player = createAudioPlayer();

client.once("clientReady", () => {
  console.log("✅ Bot đã online!");
});

client.on("messageCreate", async (message) => {

  if (message.author.bot) return;

  // PLAY
  if (message.content.startsWith("!play")) {

    const args = message.content.split(" ");

    if (args.length < 2) {
      return message.reply("❌ Bạn phải gửi link YouTube");
    }

    const url = args[1];

    if (!ytdl.validateURL(url)) {
      return message.reply("❌ Link YouTube không hợp lệ");
    }

    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel) {
      return message.reply("❌ Bạn phải vào voice trước");
    }

    try {

      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator
      });

      const stream = ytdl(url, {
        filter: "audioonly",
        highWaterMark: 1 << 25
      });

      const resource = createAudioResource(stream);

      player.play(resource);
      connection.subscribe(player);

      message.reply("🎵 Đang phát nhạc");

    } catch (err) {

      console.log("Lỗi phát nhạc:", err);
      message.reply("❌ Không phát được link");

    }

  }

  // STOP
  if (message.content === "!stop") {

    player.stop();
    message.reply("⛔ Đã dừng");

  }

  // LEAVE
  if (message.content === "!leave") {

    const connection = getVoiceConnection(message.guild.id);

    if (connection) connection.destroy();

    message.reply("🚪 Bot đã rời voice");

  }

});

client.login(process.env.TOKEN);
