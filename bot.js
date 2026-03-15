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

client.once("clientReady", () => {
  console.log("✅ Bot đã online!");
});

client.on("messageCreate", async (message) => {

  if (message.author.bot) return;

if (message.content.startsWith("!play")) {

  const match = message.content.match(/https?:\/\/\S+/);

  if (!match) {
    return message.reply("❌ Bạn phải gửi link YouTube");
  }

  const url = match[0];

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

    console.log("URL nhận được:", url);

    const stream = await play.stream(url);

    const resource = createAudioResource(stream.stream, {
      inputType: stream.type
    });

    player.play(resource);
    connection.subscribe(player);

    message.reply("🎵 Đang phát nhạc");

  } catch (err) {

    console.log("Lỗi phát nhạc:", err);
    message.reply("❌ Không phát được link");

  }

}

  if (message.content === "!stop") {

    player.stop();
    message.reply("⛔ Đã dừng");

  }

  if (message.content === "!leave") {

    const connection = getVoiceConnection(message.guild.id);

    if (connection) connection.destroy();

    message.reply("🚪 Bot đã rời voice");

  }

});

client.login(process.env.TOKEN);
