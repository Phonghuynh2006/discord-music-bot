client.on("messageCreate", async (message) => {

  if (message.author.bot) return;

  if (message.content.startsWith("!radio")) {

    const args = message.content.split(" ");
    const url = args[1];

    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel) {
      return message.reply("❌ Bạn phải vào voice trước!");
    }

    if (!url) {
      return message.reply("❌ Dán link YouTube sau lệnh!");
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

      message.reply("🎵 Đang phát radio...");

    } catch (err) {
      console.log(err);
      message.reply("❌ Không phát được link này");
    }

  }

});
