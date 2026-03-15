const { Client, GatewayIntentBits } = require("discord.js");
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require("@discordjs/voice");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.once("clientReady", () => {
  console.log("Bot đã online!");
});

client.on("messageCreate", async (message) => {

  if (message.content === "!chill") {

    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel) {
      return message.reply("Vào voice trước!");
    }

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator
    });

    const player = createAudioPlayer();

    const resource = createAudioResource(
      "https://stream.zeno.fm/f3wvbbqmdg8uv"
    );

    player.play(resource);
    connection.subscribe(player);

    message.reply("🎧 Đang phát nhạc chill 24/7");
  }

});

client.login(process.env.TOKEN);
