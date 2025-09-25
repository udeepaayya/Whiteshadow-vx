const axios = require("axios");
const yts = require("yt-search");
const { cmd } = require("../command");

cmd({
  pattern: "video",
  alias: ["ytmp4", "ytvid"],
  desc: "Download YouTube video (auto 720p) using ZenzzXD API",
  category: "download",
  react: "📥",
  filename: __filename,
},
async (conn, m, { args }) => {
  let query = args.join(" ").trim();
  if (!query) return m.reply("⚠️ Usage: .video <youtube-url | search query>");

  let ytUrl = query;

  // 🔹 If not a YouTube link → search first result
  if (!query.includes("youtube.com") && !query.includes("youtu.be")) {
    try {
      let search = await yts(query);
      if (!search || !search.all || !search.all.length) return m.reply("❌ No results found on YouTube.");
      ytUrl = search.all[0].url;
      await m.reply(`🔎 Found: *${search.all[0].title}*\n\n⏳ Fetching video...`);
    } catch (err) {
      return m.reply("🚫 Error while searching YouTube.");
    }
  } else {
    await m.reply("⏳ Fetching video...");
  }

  const api = `https://api.zenzxz.my.id/downloader/ytmp4?url=${encodeURIComponent(ytUrl)}`;

  try {
    const { data } = await axios.get(api, { timeout: 30000 });
    if (!data || !data.status || !data.download_url) {
      return m.reply("❌ Failed to fetch video.");
    }

    const { title, thumbnail, format, download_url, duration } = data;

    const caption = `🎬 *${title}*\n📀 Quality: ${format}\n⏱ Duration: ${duration}s\n\n✅ Powered by WhiteShadow-MD`;

    try {
      // Try send as video
      await conn.sendMessage(m.chat, {
        video: { url: download_url },
        caption,
        mimetype: "video/mp4",
        fileName: `${title}.mp4`,
        thumbnail: await axios.get(thumbnail, { responseType: "arraybuffer" }).then(r => Buffer.from(r.data))
      }, { quoted: m });
    } catch (err) {
      // Fallback → send as document
      await conn.sendMessage(m.chat, {
        document: { url: download_url },
        caption,
        mimetype: "video/mp4",
        fileName: `${title}.mp4`,
        thumbnail: await axios.get(thumbnail, { responseType: "arraybuffer" }).then(r => Buffer.from(r.data))
      }, { quoted: m });
    }
  } catch (e) {
    console.error("video cmd error =>", e?.message || e);
    return m.reply("🚫 Error while fetching video.");
  }
});
