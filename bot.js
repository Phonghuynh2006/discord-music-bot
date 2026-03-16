const express = require("express");
const app = express();

app.get("/", (req, res) => {
res.send("Bot is running");
});

app.listen(3000, () => {
console.log("🌐 Web server running");
});

const { Client, GatewayIntentBits } = require("discord.js");
const {
joinVoiceChannel,
createAudioPlayer,
createAudioResource,
getVoiceConnection,
StreamType
} = require("@discordjs/voice");

const { spawn } = require("child_process");
const ffmpeg = require("ffmpeg-static");

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

// RADIO
if (message.content === "!radio") {

```
const voiceChannel = message.member.voice.channel;

if (!voiceChannel) {
  return message.reply("❌ Bạn phải vào voice trước");
}

const connection = joinVoiceChannel({
  channelId: voiceChannel.id,
  guildId: message.guild.id,
  adapterCreator: message.guild.voiceAdapterCreator
});

const radioURL = "http://ice1.somafm.com/groovesalad-128-mp3";

const ffmpegProcess = spawn(ffmpeg, [
  "-re",
  "-i", radioURL,
  "-analyzeduration", "0",
  "-loglevel", "0",
  "-f", "s16le",
  "-ar", "48000",
  "-ac", "2",
  "pipe:1"
]);

const resource = createAudioResource(ffmpegProcess.stdout, {
  inputType: StreamType.Raw
});

player.play(resource);
connection.subscribe(player);

message.reply("📻 Radio đang phát 24/7");
```

}

// STOP
if (message.content === "!stop") {
player.stop();
message.reply("⛔ Đã dừng radio");
}

// LEAVE
if (message.content === "!leave") {

```
const connection = getVoiceConnection(message.guild.id);

if (connection) connection.destroy();

message.reply("🚪 Bot đã rời voice");
```

}

});

client.login(process.env.TOKEN);
