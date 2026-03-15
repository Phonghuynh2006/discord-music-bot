const { Client, GatewayIntentBits } = require("discord.js");
const { Manager } = require("erela.js");
const http = require("http");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const manager = new Manager({
  nodes: [
    {
      host: "lavalink-production-4fe4.up.railway.app",
      port: 443,
      password: "youshallnotpass",
      secure: true
    }
  ],
  send(id, payload) {
    const guild = client.guilds.cache.get(id);
    if (guild) guild.shard.send(payload);
  }
});

client.once("clientReady", () => {
  console.log(`✅ Bot online: ${client.user.tag}`);
  manager.init(client.user.id);
});

client.on("raw", (d) => manager.updateVoiceState(d));

client.on("messageCreate", async (message) => {

  if (!message.guild || message.author.bot) return;

  const args = message.content.split(" ");
  const command = args.shift();

  if (command === "!play") {

    const query = args.join(" ");

    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel) {
      return message.reply("❌ Bạn phải vào voice trước!");
    }

    const player = manager.create({
      guild: message.guild.id,
      voiceChannel: voiceChannel.id,
      textChannel: message.channel.id
    });

    player.connect();

    const res = await manager.search(query, message.author);

    if (res.tracks.length === 0) {
      return message.reply("❌ Không tìm thấy bài.");
    }

    player.queue.add(res.tracks[0]);

    if (!player.playing && !player.paused) {
      player.play();
    }

    message.reply("🎵 Đang phát nhạc...");
  }

  if (command === "!stop") {

    const player = manager.players.get(message.guild.id);

    if (player) {
      player.destroy();
    }

    message.reply("⛔ Đã dừng nhạc");
  }

});

client.login(process.env.TOKEN);

// Web server cho Render
const PORT = process.env.PORT || 10000;

http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Bot running");
}).listen(PORT, () => {
  console.log("🌐 Web server running on port " + PORT);
});
