const { Client, GatewayIntentBits } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  AudioPlayerStatus
} = require("@discordjs/voice");

// Sử dụng @distube/ytdl-core để tránh lỗi "Could not extract functions"
const ytdl = require("@distube/ytdl-core");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const player = createAudioPlayer();

// Sửa từ "clientReady" thành "ready"
client.once("ready", () => {
  console.log(`✅ Bot đã online với tên: ${client.user.tag}`);
});

// Bắt lỗi cho player để bot không bị crash bất ngờ
player.on('error', error => {
  console.error("❌ Lỗi trình phát nhạc:", error.message);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;

  // Lệnh !play
  if (message.content.startsWith("!play")) {
    const args = message.content.split(" ");
    if (args.length < 2) return message.reply("❌ Bạn phải gửi link YouTube");

    const url = args[1];
    if (!ytdl.validateURL(url)) return message.reply("❌ Link YouTube không hợp lệ");

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply("❌ Bạn phải vào voice trước");

    try {
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator
      });

      // Tạo stream với các option tối ưu hơn
      const stream = ytdl(url, {
        filter: "audioonly",
        highWaterMark: 1 << 25,
        liveBuffer: 20000,
      });

      const resource = createAudioResource(stream);
      
      player.play(resource);
      connection.subscribe(player);

      message.reply("🎵 Đang lấy dữ liệu và phát nhạc...");
    } catch (err) {
      console.error("Lỗi kết nối voice:", err);
      message.reply("❌ Không thể kết nối vào kênh voice");
    }
  }

  // Lệnh !stop
  if (message.content === "!stop") {
    player.stop();
    message.reply("⛔ Đã dừng phát nhạc");
  }

  // Lệnh !leave
  if (message.content === "!leave") {
    const connection = getVoiceConnection(message.guild.id);
    if (connection) {
      connection.destroy();
      message.reply("🚪 Bot đã rời voice");
    } else {
      message.reply("❌ Bot hiện không ở trong kênh voice nào");
    }
  }
});

// Đảm bảo bạn đã cài đặt biến môi trường TOKEN
client.login(process.env.TOKEN);
