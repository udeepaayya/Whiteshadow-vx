const axios = require("axios");
const { cmd } = require("../command");

cmd({
  pattern: "video",
  alias: ["ytmp4", "ytvideo"],
  desc: "Download YouTube video with auto quality & limit bypass",
  react: "🎥",
  category: "download",
  filename: __filename,
},
async (conn, m, { args }) => {
  if (!args[0]) return m.reply("⚠️ Please provide a YouTube link!");

  const url = args[0];
  let videoData;

  try {
    // 🔹 First API
    let res = await axios.get(`https://api.agatz.xyz/api/ytmp4?url=${url}`);
    videoData = res.data.result;
  } catch (e) {
    try {
      // 🔹 Fallback API
      let res2 = await axios.get(`https://api.nekolabs.my.id/downloader/ytmp4?url=${url}`);
      videoData = res2.data.result;
    } catch (err) {
      return m.reply("❌ Failed to fetch. Try another link or later.");
    }
  }

  if (!videoData || !videoData.download_url) return m.reply("❌ Video not found.");

  let { title, size, download_url, thumbnail } = videoData;
  let fileSizeMB = parseFloat(size);

  try {
    if (fileSizeMB <= 90) {
      // Small file → send as video preview
      await conn.sendMessage(m.chat, {
        video: { url: download_url },
        caption: `🎬 *${title}*\n📦 Size: ${size}\n\n✅ Powered by WhiteShadow-MD`,
        thumbnail: await axios.get(thumbnail, { responseType: "arraybuffer" }).then(r => Buffer.from(r.data)),
        mimetype: "video/mp4"
      }, { quoted: m });
    } else {
      // Large file → send as document
      await conn.sendMessage(m.chat, {
        document: { url: download_url },
        fileName: `${title}.mp4`,
        mimetype: "video/mp4",
        caption: `🎬 *${title}*\n📦 Size: ${size}\n\n⚡ Sent as Document (Limit bypass)\n✅ Powered by WhiteShadow-MD`
      }, { quoted: m });
    }
  } catch (err) {
    return m.reply("❌ Error while sending video. File may be too large.");
  }
});
