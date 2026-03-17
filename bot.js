import { Client, GatewayIntentBits } from "discord.js";
import { PlayerManager } from "ziplayer";
import { YouTubePlugin } from "@ziplayer/plugin";

// Tạo bot client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Tạo player manager
const manager = new PlayerManager({
  plugins: [new YouTubePlugin()],
});

// Khi bot online
client.once("ready", () => {
  console.log(`✅ Bot ready: ${client.user.tag}`);
});

// Lắng nghe tin nhắn
client.on("messageCreate", async (message) => {
  if (!message.content.startsWith("!play")) return;

  const query = message.content.replace("!play ", "");
  const voiceChannel = message.member.voice.channel;

  if (!voiceChannel) {
    return message.reply("❌ Bạn phải vào voice channel!");
  }

  try {
    // Tạo player
    const player = await manager.create(message.guild.id);

    // Kết nối voice
    await player.connect(voiceChannel);

    // Phát nhạc
    await player.play(query, message.author.id);

    message.reply(`🎶 Đang phát: ${query}`);
  } catch (err) {
    console.error(err);
    message.reply("❌ Lỗi khi phát nhạc!");
  }
});

// Event khi bắt đầu phát
manager.on("trackStart", (player, track) => {
  const channel = player.userdata?.channel;
  console.log(`Now playing: ${track.title}`);
});

// Login bot
client.login("YOUR_BOT_TOKEN");
