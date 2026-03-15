const { Client, GatewayIntentBits } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  StreamType
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

client.once("ready", () => {
  console.log("✅ Bot đã online!");
});

client.on("messageCreate", async (message) => {

  if (message.author.bot) return;

  // PLAY
  if (message.content.startsWith("!play")) {

    const url = message.content.split(" ")[1];

    if (!url) return message.reply("❌ Gửi link YouTube");

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
        quality: "highestaudio"
      });

      const resource = createAudioResource(stream, {
        inputType: StreamType.Arbitrary
      });

      player.play(resource);
      connection.subscribe(player);

      message.reply("🎵 Đang phát nhạc...");

    } catch (err) {

      console.log(err);
      message.reply("❌ Không phát được");

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
