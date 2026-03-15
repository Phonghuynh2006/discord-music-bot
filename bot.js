if (message.content.startsWith("!play")) {

  const args = message.content.trim().split(/\s+/);
  const url = args[1];

  if (!url) {
    return message.reply("❌ Bạn phải gửi link YouTube");
  }

  if (!play.yt_validate(url)) {
    return message.reply("❌ Link YouTube không hợp lệ");
  }

  const voiceChannel = message.member.voice.channel;

  if (!voiceChannel) {
    return message.reply("❌ Bạn phải vào voice trước");
  }

  try {

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator
    });

    const stream = await play.stream(url);

    const resource = createAudioResource(stream.stream, {
      inputType: stream.type
    });

    player.play(resource);
    connection.subscribe(player);

    message.reply("🎵 Đang phát nhạc");

  } catch (err) {

    console.log("Lỗi phát nhạc:", err);
    message.reply("❌ Không phát được link");

  }

}
