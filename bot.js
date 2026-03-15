const { Client, GatewayIntentBits } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  entersState,
  VoiceConnectionStatus
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
  console.log("Bot đã online!");
});

client.on("messageCreate", async (message) => {

  if (message.author.bot) return;

  if (message.content.startsWith("!play")) {

    const args = message.content.split(" ");
    const url = args[1];

    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel) {
      return message.reply("❌ Bạn phải vào voice trước!");
    }

    if (!url) {
      return message.reply("❌ Bạn phải gửi link nhạc!");
    }

    try {

      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator
      });

      await entersState(connection, VoiceConnectionStatus.Ready, 20000);

      const stream = await play.stream(url);

      const resource = createAudioResource(stream.stream, {
        inputType: stream.type
      });

      player.play(resource);
      connection.subscribe(player);

      message.reply("🎵 Đang phát nhạc...");

    } catch (err) {
      console.log(err);
      message.reply("❌ Lỗi khi phát nhạc");
    }

  }

});

client.login(process.env.TOKEN);
