const { cmd } = require('../command')
const fetch = require('node-fetch')
const yts = require('yt-search')

cmd({
  pattern: "song",
  alias: ["play", "mp3"],
  react: "🎶",
  desc: "Download YouTube song (Audio) via PrinceTech API + extra info",
  category: "download",
  use: ".song <query>",
  filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
  try {
    if (!q) return reply("⚠️ Please provide a song name or YouTube link.");

    let ytUrl = q;
    let ytInfo = null;

    // 🔹 If query is not a YouTube link → search
    if (!q.includes("youtube.com") && !q.includes("youtu.be")) {
      const search = await yts(q);
      if (!search?.all?.length) return reply("❌ No results found on YouTube.");
      ytInfo = search.all[0];
      ytUrl = ytInfo.url;
    } else {
      // If direct URL → fetch info too
      const search = await yts({ videoId: q.split("v=")[1] || q.split("/").pop() });
      ytInfo = search;
    }

    // 🔹 Call PrinceTech API
    const apiUrl = `https://api.princetechn.com/api/download/ytmp3?apikey=prince&url=${encodeURIComponent(ytUrl)}`;
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (!data?.success || !data?.result?.download_url) {
      return reply("❌ Song not found or API error. Try again later.");
    }

    const meta = data.result;

    // 🔹 Thumbnail buffer
    let buffer;
    try {
      const thumbRes = await fetch(meta.thumbnail);
      buffer = Buffer.from(await thumbRes.arrayBuffer());
    } catch {
      buffer = null;
    }

    // 🔹 Caption card with extra info
    const caption = `
╔═══════════════
🎶 *Now Playing*
╠═══════════════
🎵 *Title:* ${meta.title}
👤 *Channel:* ${ytInfo?.author?.name || "Unknown"}
⏱ *Duration:* ${ytInfo?.timestamp || "N/A"}
👁 *Views:* ${ytInfo?.views?.toLocaleString() || "N/A"}
👍 *Likes:* ${ytInfo?.ago || "N/A"}
🎧 *Quality:* ${meta.quality}
🔗 [Watch on YouTube](https://youtu.be/${meta.id})
╠═══════════════
⚡ Powered by *Whiteshadow MD*
╚═══════════════
`;

    // 🔹 Send info card
    await conn.sendMessage(from, {
      image: buffer,
      caption
    }, { quoted: mek });

    // 🔹 Send audio file
    await conn.sendMessage(from, {
      audio: { url: meta.download_url },
      mimetype: "audio/mpeg",
      fileName: `${meta.title.replace(/[\\/:*?"<>|]/g, "").slice(0, 80)}.mp3`
    }, { quoted: mek });

  } catch (err) {
    console.error("song cmd error:", err);
    reply("⚠️ An error occurred while processing your request.");
  }
});
