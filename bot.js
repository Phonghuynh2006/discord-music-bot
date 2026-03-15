const { Client, GatewayIntentBits } = require("discord.js");
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require("@discordjs/voice");
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

      const resource = createAudioResource(stream);

      player.play(resource);
      connection.subscribe(player);

      message.reply("🎵 Đang phát nhạc...");

    } catch (err) {
      console.log(err);
      message.reply("❌ Không phát được nhạc");
    }

  }

});

client.login(process.env.TOKEN);
