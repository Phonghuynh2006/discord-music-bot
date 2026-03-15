const { Client, GatewayIntentBits } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
} = require("@discordjs/voice");

const ytdl = require("@distube/ytdl-core");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// Đây là mảng JSON Cookie bạn vừa cung cấp
const YOUTUBE_COOKIES = [
  { "domain": ".youtube.com", "expirationDate": 1806573672, "hostOnly": false, "httpOnly": false, "name": "__Secure-1PAPISID", "path": "/", "sameSite": "unspecified", "secure": true, "session": false, "storeId": "0", "value": "vzBfi_Iw-GoSD_-J/AWsby0PmUuOMtIijH", "id": 1 },
  { "domain": ".youtube.com", "expirationDate": 1806573672, "hostOnly": false, "httpOnly": true, "name": "__Secure-1PSID", "path": "/", "sameSite": "unspecified", "secure": true, "session": false, "storeId": "0", "value": "g.a0007AjYgFEWyGiaydXaKiUCh5xC5-RRq3l3W8WokB4bnwbboGHL37Z03yoXAl1zqDNXy_uUnAACgYKAbESARYSFQHGX2MiGTTs0jCXFamfGxYV5zrtzhoVAUF8yKp6T825CFV9h_E_7TsUeXOo0076", "id": 2 },
  { "domain": ".youtube.com", "expirationDate": 1805108274.176311, "hostOnly": false, "httpOnly": true, "name": "__Secure-1PSIDCC", "path": "/", "sameSite": "unspecified", "secure": true, "session": false, "storeId": "0", "value": "AKEyXzUPv-qOnM2k1DSrvV7jXXffpCNZ2mQwLn_e9eZYsY5zQhIQ5hNHtgObFZX-MG0NAfj0yg", "id": 3 },
  { "domain": ".youtube.com", "expirationDate": 1805107611, "hostOnly": false, "httpOnly": true, "name": "__Secure-1PSIDTS", "path": "/", "sameSite": "unspecified", "secure": true, "session": false, "storeId": "0", "value": "sidts-CjQBBj1CYlMflS3XO98sy-XN44w4vM62OcxyQpCP0Y1SjiElCqfXGyyJHVD-Fsdso57gq1dsEAA", "id": 4 },
  { "domain": ".youtube.com", "expirationDate": 1806578215, "hostOnly": false, "httpOnly": false, "name": "__Secure-3PAPISID", "path": "/", "sameSite": "no_restriction", "secure": true, "session": false, "storeId": "0", "value": "vzBfi_Iw-GoSD_-J/AWsby0PmUuOMtIijH", "id": 5 },
  { "domain": ".youtube.com", "expirationDate": 1806578215, "hostOnly": false, "httpOnly": true, "name": "__Secure-3PSID", "path": "/", "sameSite": "no_restriction", "secure": true, "session": false, "storeId": "0", "value": "g.a0007AjYgFEWyGiaydXaKiUCh5xC5-RRq3l3W8WokB4bnwbboGHLcA52R4nzKAprRPOt-GesVQACgYKAZgSARYSFQHGX2Mi71ZY-TPBLi5Xw6sx3SAYQxoVAUF8yKpgndoUfF3yWXjcUpMDyYBC0076", "id": 6 },
  { "domain": ".youtube.com", "expirationDate": 1805108274.176509, "hostOnly": false, "httpOnly": true, "name": "__Secure-3PSIDCC", "path": "/", "sameSite": "no_restriction", "secure": true, "session": false, "storeId": "0", "value": "AKEyXzXk_1SAnDmJmJPO_QTwKFHxOwuE7XD8ryxNKmP6y7VFg3Q6kYNsElooMC5OqeQ3f_ZeTRA", "id": 7 },
  { "domain": ".youtube.com", "expirationDate": 1805107611, "hostOnly": false, "httpOnly": true, "name": "__Secure-3PSIDTS", "path": "/", "sameSite": "no_restriction", "secure": true, "session": false, "storeId": "0", "value": "sidts-CjQBBj1CYlMflS3XO98sy-XN44w4vM62OcxyQpCP0Y1SjiElCqfXGyyJHVD-Fsdso57gq1dsEAA", "id": 8 },
  { "domain": ".youtube.com", "expirationDate": 1806326093, "hostOnly": false, "httpOnly": true, "name": "__Secure-YENID", "path": "/", "sameSite": "lax", "secure": true, "session": false, "storeId": "0", "value": "13.YTE=C6sWOeW8m3r_dYo8pGahUWc4-uN7R5eja2adkr8wdHl9SMYeAjQY0IxMTdggnWTZXVlVmzMTlz-eO0Oau9WxWKLJshDaYHdWLJP6tY3f8TO1lu2la4shsyOBqDXZeXBA9vZGUB1MmZAXPYwFnDYh_RBs_Do819SIgmRsveYdEopF_nOleN6_f6yi4bUTkeHJkn18Yb2myGUghN_YbKp_UonO1OaQRcR9m9_fhWKEZNxT2b2G8fIdsrWr5oo1U45lZxU8RBQehWS0RAOMHW-ZXnLZinq8K_-HWnc8SU5jvclx_D2pg8-AvaxH5D0lUMpaKR8psbotAFg3Th28do9oJw", "id": 9 },
  { "domain": ".youtube.com", "expirationDate": 1800420374, "hostOnly": false, "httpOnly": true, "name": "LOGIN_INFO", "path": "/", "sameSite": "no_restriction", "secure": true, "session": false, "storeId": "0", "value": "AFmmF2swRgIhAOmZ2NsMARmrvr67sut3wH5BzvcaXiokI4yHen1QJTGIAiEAvNq-2AWRmAcI0lx3IWCRLGiwLEmbtZ6fu9DHNK6cnyI:QUQ3MjNmeEJZcG5nSVFfc1lFV1p1SXR6eW40SVNFR1dnbEFiT2g0dk9vVC1EYUl6aDdoY055Q0JjejBQYU1XTWczVFFObHFpYTBYUzZCNE83dkFlV1VsWTI4bURHbUNFblBkc0NNTVVvbEJHZnFjX2M4c0l3MlpWTXhEaTIxZTBubjR5cktsbU9naUdJOXJHMEN6Z3lmZTJOMzR0aGU5S2Rn", "id": 15 },
  { "domain": ".youtube.com", "expirationDate": 1808132243.475038, "hostOnly": false, "httpOnly": false, "name": "PREF", "path": "/", "sameSite": "unspecified", "secure": true, "session": false, "storeId": "0", "value": "f4=4000000&tz=Asia.Bangkok&f7=100&f5=20000&hl=vi", "id": 16 },
  { "domain": ".youtube.com", "expirationDate": 1806573672, "hostOnly": false, "httpOnly": false, "name": "SAPISID", "path": "/", "sameSite": "unspecified", "secure": true, "session": false, "storeId": "0", "value": "vzBfi_Iw-GoSD_-J/AWsby0PmUuOMtIijH", "id": 17 },
  { "domain": ".youtube.com", "expirationDate": 1806573672, "hostOnly": false, "httpOnly": true, "name": "SSID", "path": "/", "sameSite": "unspecified", "secure": true, "session": false, "storeId": "0", "value": "A_J9dZ_6d9j2FpvIh", "id": 20 }
];

const player = createAudioPlayer();

client.once("clientReady", () => {
  console.log(`✅ Bot online: ${client.user.tag}`);
});

player.on('error', error => {
  console.error("❌ Lỗi Player:", error.message);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;

  if (message.content.startsWith("!play")) {
    const args = message.content.split(" ");
    const url = args[1];

    if (!url || !ytdl.validateURL(url)) {
      return message.reply("❌ Link YouTube lỏ rồi bạn ơi!");
    }

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply("❌ Bạn phải vào phòng voice đã!");

    try {
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator
      });

      // Cấu hình mới nhất sử dụng agent để xử lý cookie JSON
      const agent = ytdl.createAgent(YOUTUBE_COOKIES);
      const stream = ytdl(url, {
        filter: "audioonly",
        highWaterMark: 1 << 25,
        agent: agent // Truyền agent đã chứa cookie vào đây
      });

      const resource = createAudioResource(stream);
      player.play(resource);
      connection.subscribe(player);

      message.reply("🎵 Đang lấy nhạc, đợi xíu nha...");
    } catch (err) {
      console.error(err);
      message.reply("❌ Không phát được, có thể YouTube chặn IP server rồi!");
    }
  }

  if (message.content === "!stop") {
    player.stop();
    message.reply("⛔ Đã dừng nhạc!");
  }

  if (message.content === "!leave") {
    const connection = getVoiceConnection(message.guild.id);
    if (connection) connection.destroy();
    message.reply("🚪 Bot đã rời phòng!");
  }
});

client.login(process.env.TOKEN);
