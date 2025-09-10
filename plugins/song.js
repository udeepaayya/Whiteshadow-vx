const { cmd } = require('../command')
const fetch = require('node-fetch')
const yts = require('yt-search')

cmd({
  pattern: "song",
  alias: ["play", "mp3"],
  react: "🎶",
  desc: "Download YouTube song (Audio) via Delirius API",
  category: "download",
  use: ".song <query>",
  filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
  try {
    if (!q) return reply("⚠️ Please provide a song name or YouTube link.");

    let ytUrl = q;
    if (!q.includes("youtube.com") && !q.includes("youtu.be")) {
      const search = await yts(q);
      if (!search?.all?.length) return reply("❌ No results found on YouTube.");
      ytUrl = search.all[0].url;
    }

    const apiUrl = `https://delirius-apiofc.vercel.app/download/ytmp3?url=${encodeURIComponent(ytUrl)}`;
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (!data?.status || !data?.data?.download?.url) {
      return reply("❌ Song not found or API error. Try again later.");
    }

    const meta = data.data;
    const dl = meta.download;

    // thumbnail buffer
    let buffer;
    try {
      const thumbRes = await fetch(meta.image_max_resolution || meta.image);
      buffer = Buffer.from(await thumbRes.arrayBuffer());
    } catch {
      buffer = null;
    }

    // caption card
    const caption = `
╔═══════════════
🎶 *Now Playing*
╠═══════════════
🎵 *Title:* ${meta.title}
👤 *Artist:* ${meta.author}
⏱ *Duration:* ${meta.duration || "N/A"} sec
👁 *Views:* ${meta.views || "N/A"}
👍 *Likes:* ${meta.likes || "N/A"}
💬 *Comments:* ${meta.comments || "N/A"}
🔗 [Watch on YouTube](https://youtu.be/${meta.id})
╠═══════════════
⚡ Powered by *Whiteshadow MD*
╚═══════════════
`;

    // send info card
    await conn.sendMessage(from, {
      image: buffer,
      caption
    }, { quoted: mek });

    // send audio file
    await conn.sendMessage(from, {
      audio: { url: dl.url },
      mimetype: "audio/mpeg",
      fileName: dl.filename || `${meta.title}.mp3`
    }, { quoted: mek });

  } catch (err) {
    console.error("song cmd error:", err);
    reply("⚠️ An error occurred while processing your request.");
  }
});
