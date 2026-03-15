const { Client, GatewayIntentBits } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection
} = require("@discordjs/voice");

const play = require("play-dl");

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

  // PLAY YOUTUBE
  if (message.content.startsWith("!play")) {

    const args = message.content.split(" ");
    const url = args[1];

    if (!url) {
      return message.reply("❌ Bạn phải dán link YouTube");
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

      const stream = await play.stream(url);

      const resource = createAudioResource(stream.stream, {
        inputType: stream.type
      });

      player.play(resource);
      connection.subscribe(player);

      message.reply("🎵 Đang phát nhạc...");

    } catch (err) {
      console.log(err);
      message.reply("❌ Không phát được link này");
    }

  }

  // STOP
  if (message.content === "!stop") {

    player.stop();

    message.reply("⛔ Đã dừng nhạc");

  }

  // LEAVE
  if (message.content === "!leave") {

    const connection = getVoiceConnection(message.guild.id);

    if (connection) {
      connection.destroy();
    }

    message.reply("🚪 Bot đã rời voice");

  }

});

client.login(process.env.TOKEN);
