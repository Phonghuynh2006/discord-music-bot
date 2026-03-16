const { Client, GatewayIntentBits } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  StreamType,
  AudioPlayerStatus
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

async function playRadio(connection, url) {

  const stream = await play.stream(url);

  const resource = createAudioResource(stream.stream, {
    inputType: StreamType.Opus
  });

  player.play(resource);
  connection.subscribe(player);

  player.on(AudioPlayerStatus.Idle, () => {
    playRadio(connection, url); // phát lại 24/7
  });

}

client.on("messageCreate", async (message) => {

  if (message.author.bot) return;

  // RADIO
  if (message.content === "!radio") {

    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel) {
      return message.reply("❌ Bạn phải vào voice trước");
    }

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator
    });

    const radioURL = "https://www.youtube.com/live/jfKfPfyJRdk"; // lofi 24/7

    try {

      await playRadio(connection, radioURL);

      message.reply("📻 Radio đang phát 24/7");

    } catch (err) {

      console.log(err);
      message.reply("❌ Không phát được radio");

    }

  }

  if (message.content === "!stop") {

    player.stop();
    message.reply("⛔ Đã dừng radio");

  }

  if (message.content === "!leave") {

    const connection = getVoiceConnection(message.guild.id);

    if (connection) connection.destroy();

    message.reply("🚪 Bot đã rời voice");

  }

});

client.login(process.env.TOKEN);
