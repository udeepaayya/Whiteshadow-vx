const { cmd } = require("../command");
const axios = require("axios");

cmd({
  pattern: "video",
  desc: "Download YouTube video",
  react: "🎬",
  async handler(m, { sock, text }) {
    if (!text) return m.reply("❌ Please provide a YouTube link!");

    try {
      const api = `https://api.yupra.my.id/api/downloader/ytmp4?url=${encodeURIComponent(text)}`;
      const res = await axios.get(api);
      const data = res.data;

      if (!data.result || data.status !== 200) return m.reply("❌ Video not found!");

      const video = data.result.formats[0]; // pick 240p version
      const title = data.result.title;
      const videoUrl = video.url;

      await sock.sendMessage(
        m.chat,
        {
          video: { url: videoUrl },
          caption: `🎬 *${title}*\n💾 Quality: ${video.qualityLabel}\n⚡ Powered by WhiteShadow-MD`,
        },
        { quoted: m }
      );
    } catch (err) {
      console.log("Video plugin error:", err);
      m.reply("❌ Failed to fetch or send video!");
    }
  },
});
