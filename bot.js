const { Client, GatewayIntentBits } = require("discord.js");
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require("@discordjs/voice");
const play = require("play-dl");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const player = createAudioPlayer();

client.once("ready", () => {
  console.log("Bot đã online!");
});

client.on("messageCreate", async (message) => {

  if (message.content === "!radio") {

    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel) return message.reply("Vào voice trước!");

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator
    });

    const stream = await play.stream("https://www.youtube.com/watch?v=jfKfPfyJRdk");

    const resource = createAudioResource(stream.stream, {
      inputType: stream.type
    });

    player.play(resource);
    connection.subscribe(player);

    message.reply("🎧 Đang phát radio YouTube 24/7");
  }

});

client.login(process.env.TOKEN);
