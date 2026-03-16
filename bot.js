const { Client, GatewayIntentBits } = require("discord.js");
const { Manager } = require("erela.js");
const http = require("http");

const TOKEN = process.env.TOKEN;

const STREAM_URL = "https://drive.google.com/uc?export=download&id=1RbphI_EA_gREPo0fLsXS8jG7Mu8aEVLo";

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

client.once("ready", () => {
  console.log(`✅ Bot online: ${client.user.tag}`);
  manager.init(client.user.id);
});

client.on("raw", (d) => manager.updateVoiceState(d));

manager.on("nodeConnect", () => {
  console.log("✅ Lavalink connected");
});

manager.on("nodeError", (node, error) => {
  console.log("❌ Lavalink error:", error.message);
});

manager.on("trackEnd", (player, track) => {
  player.queue.add(track);
  player.play();
});

client.on("messageCreate", async (message) => {

  if (!message.guild || message.author.bot) return;

  const args = message.content.split(" ");
  const cmd = args.shift();

  if (cmd === "!play") {

    const voice = message.member.voice.channel;

    if (!voice) {
      return message.reply("❌ Bạn phải vào voice trước!");
    }

    const player = manager.create({
      guild: message.guild.id,
      voiceChannel: voice.id,
      textChannel: message.channel.id
    });

    player.connect();

    const res = await manager.search(STREAM_URL, message.author);

    if (!res.tracks.length) {
      return message.reply("❌ Không phát được link MP3.");
    }

    player.queue.add(res.tracks[0]);

    if (!player.playing) {
      player.play();
    }

    message.reply("🎵 Đang phát nhạc (loop vô hạn)");
  }

  if (cmd === "!stop") {

    const player = manager.players.get(message.guild.id);

    if (player) {
      player.destroy();
      message.reply("⛔ Đã dừng nhạc");
    }

  }

});

client.login(TOKEN);


const PORT = process.env.PORT || 10000;

http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Bot running");
}).listen(PORT, () => {
  console.log("🌐 Web server running " + PORT);
});
