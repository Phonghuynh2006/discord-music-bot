const express = require("express");
const app = express();

// Web server (tránh sleep VPS)
app.get("/", (req, res) => {
  res.send("Bot is running");
});

app.listen(3000, () => {
  console.log("🌐 Web server running");
});

// ================= DISCORD =================

const { Client, GatewayIntentBits } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  StreamType,
  AudioPlayerStatus
} = require("@discordjs/voice");

const { spawn } = require("child_process");
const ffmpeg = require("ffmpeg-static");

// Tạo client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// Tạo player
const player = createAudioPlayer();

// Khi bot online
client.once("ready", () => {
  console.log("✅ Bot đã online!");
});

// ================= MESSAGE =================

client.on("messageCreate", async (message) => {
  try {
    if (message.author.bot) return;

    // ================= RADIO =================
    if (message.content === "!radio") {
      const voiceChannel = message.member?.voice?.channel;

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

      player.on(AudioPlayerStatus.Idle, () => {
        console.log("🔁 Restart radio...");
      });

      return message.reply("📻 Radio đang phát 24/7");
    }

    // ================= STOP =================
    if (message.content === "!stop") {
      player.stop();
      return message.reply("⛔ Đã dừng radio");
    }

    // ================= LEAVE =================
    if (message.content === "!leave") {
      const connection = getVoiceConnection(message.guild.id);

      if (connection) {
        connection.destroy();
      }

      return message.reply("🚪 Bot đã rời voice");
    }

  } catch (err) {
    console.error("❌ Lỗi:", err);
    message.reply("⚠️ Bot bị lỗi!");
  }
});

// ================= LOGIN =================

client.login(process.env.TOKEN);
