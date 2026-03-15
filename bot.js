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

// Bạn dán toàn bộ đoạn cookie dài vào giữa dấu backtick `` dưới đây
const MY_YOUTUBE_COOKIE = `LOGIN_INFO=AFmmF2swRgIhAOmZ2NsMARmrvr67sut3wH5BzvcaXiokI4yHen1QJTGIAiEAvNq-2AWRmAcI0lx3IWCRLGiwLEmbtZ6fu9DHNK6cnyI:QUQ3MjNmeEJZcG5nSVFfc1lFV1p1SXR6eW40SVNFR1dnbEFiT2g0dk9vVC1EYUl6aDdoY055Q0JjejBQYU1XTWczVFFObHFpYTBYUzZCNE83dkFlV1VsWTI4bURHbUNFblBkc0NNTVVvbEJHZnFjX2M4c0l3MlpWTXhEaTIxZTBubjR5cktsbU9naUdJOXJHMEN6Z3lmZTJOMzR0aGU5S2Rn; VISITOR_PRIVACY_METADATA=CgJWThIEGgAgNg%3D%3D; PREF=f4=4000000&tz=Asia.Bangkok&f7=100&f5=20000&hl=vi; _gcl_au=1.1.386981947.1771648782; _ga=GA1.1.989992704.1771648783; _ga_VCGEPY40VB=GS2.1.s1771648782$o1$g1$t1771648809$j33$l0$h0; HSID=AkHLKRIWelFWZa3Qz; SSID=A_J9dZ_6d9j2FpvIh; APISID=t2rYz3eiymBLlPL2/A3HfvMhNIqRDP_qBF; SAPISID=vzBfi_Iw-GoSD_-J/AWsby0PmUuOMtIijH; __Secure-1PAPISID=vzBfi_Iw-GoSD_-J/AWsby0PmUuOMtIijH; __Secure-3PAPISID=vzBfi_Iw-GoSD_-J/AWsby0PmUuOMtIijH; SID=g.a0007AjYgFEWyGiaydXaKiUCh5xC5-RRq3l3W8WokB4bnwbboGHL4uEzK3DOtt8jTsItnqNHrAACgYKAeMSARYSFQHGX2Mi-WlXI9IYKn2_ISkAJMWG6BoVAUF8yKoETZUAMbQw4EH1_8xdDufD0076; __Secure-1PSID=g.a0007AjYgFEWyGiaydXaKiUCh5xC5-RRq3l3W8WokB4bnwbboGHL37Z03yoXAl1zqDNXy_uUnAACgYKAbESARYSFQHGX2MiGTTs0jCXFamfGxYV5zrtzhoVAUF8yKp6T825CFV9h_E_7TsUeXOo0076; __Secure-3PSID=g.a0007AjYgFEWyGiaydXaKiUCh5xC5-RRq3l3W8WokB4bnwbboGHLcA52R4nzKAprRPOt-GesVQACgYKAZgSARYSFQHGX2Mi71ZY-TPBLi5Xw6sx3SAYQxoVAUF8yKpgndoUfF3yWXjcUpMDyYBC0076; __Secure-YENID=13.YTE=C6sWOeW8m3r_dYo8pGahUWc4-uN7R5eja2adkr8wdHl9SMYeAjQY0IxMTdggnWTZXVlVmzMTlz-eO0Oau9WxWKLJshDaYHdWLJP6tY3f8TO1lu2la4shsyOBqDXZeXBA9vZGUB1MmZAXPYwFnDYh_RBs_Do819SIgmRsveYdEopF_nOleN6_f6yi4bUTkeHJkn18Yb2myGUghN_YbKp_UonO1OaQRcR9m9_fhWKEZNxT2b2G8fIdsrWr5oo1U45lZxU8RBQehWS0RAOMHW-ZXnLZinq8K_-HWnc8SU5jvclx_D2pg8-AvaxH5D0lUMpaKR8psbotAFg3Th28do9oJw; VISITOR_INFO1_LIVE=inQLobBXZiQ; VISITOR_PRIVACY_METADATA=CgJWThIEGgAgbg%3D%3D; __Secure-YNID=16.YT=0TZoJWlXVwTJqqZs0A2S2G74y-WJVyEv5Agh1upPylPj6RISamN39v21tv_y1r-Z1B-Wxmlh701OVNA4PX-SYmTbzSOpp0IZVATIOelaXc5EJ_0N2_kqjtBlB9pRr5MNFIQLvdqo39KsxrJDEeXOnP6deOg-K5LlH_oHRFkw2UQ7kqvuTQIlhM2AYT3PeI8DpjookVLRyzlFGfEmafAjUBUVBEa2iLkwXxsPhlnsgF6MBN_XM_OVGbeZ8KTxsNcJEdU3Ebzx06u2kZDSeCxt7wgkCuyRn4rozHfZc-DJtdqINM5FI_riLkETuwf81Eu8PyRUHCqXQOk1D4CJ1ilDrw; __Secure-ROLLOUT_TOKEN=CPrbn8nzyJqG_wEQq6W4xqbBkQMY19_6ibWfkwM%3D; YSC=KLfUwrLdKpw; __Secure-1PSIDTS=sidts-CjQBBj1CYlMflS3XO98sy-XN44w4vM62OcxyQpCP0Y1SjiElCqfXGyyJHVD-Fsdso57gq1dsEAA; __Secure-3PSIDTS=sidts-CjQBBj1CYlMflS3XO98sy-XN44w4vM62OcxyQpCP0Y1SjiElCqfXGyyJHVD-Fsdso57gq1dsEAA; SIDCC=AKEyXzXbeUXwa07Ad9gO5iK-PNK6HNebM7sDq8bZBJsTD1edySyw5ZLnbui9kIVJB9blAAmMwWU; __Secure-1PSIDCC=AKEyXzW0RnzmIIRVJh5RZpi-BoxPUtSURitcsA0sOd5wYlpdfkuBbfZcIunWAXc20WInND2qrw; __Secure-3PSIDCC=AKEyXzVrD7Kohhq4FqQfRSUpNBfOjLfY4W-qGmBi4UcaAzYICYbZkxutUWV3E6P-Q3iK461GyZ8`;

const player = createAudioPlayer();

// Đổi lại clientReady theo thông báo của máy chủ bạn
client.once("clientReady", () => {
  console.log(`✅ Bot đã online: ${client.user.tag}`);
});

player.on('error', error => {
  console.error("❌ Lỗi Player:", error.message);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;

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

      const stream = ytdl(url, {
        filter: "audioonly",
        highWaterMark: 1 << 25,
        requestOptions: {
          headers: {
            cookie: MY_YOUTUBE_COOKIE
          }
        }
      });

      const resource = createAudioResource(stream);
      player.play(resource);
      connection.subscribe(player);

      message.reply("🎵 Đang phát nhạc (đã dùng cookie)");
    } catch (err) {
      console.error(err);
      message.reply("❌ Lỗi khi phát nhạc");
    }
  }

  if (message.content === "!stop") {
    player.stop();
    message.reply("⛔ Đã dừng");
  }

  if (message.content === "!leave") {
    const connection = getVoiceConnection(message.guild.id);
    if (connection) connection.destroy();
    message.reply("🚪 Bot đã rời voice");
  }
});

client.login(process.env.TOKEN);
