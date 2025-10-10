const { cmd } = require('../command');
const axios = require('axios');

cmd({
  pattern: "සින්දු",
  alias: ["ගීත", "ytmp3#"],
  react: "🎶",
  desc: "Search & Download YouTube songs as MP3",
  category: "download",
  use: ".song <name or YouTube link>",
}, async (conn, mek, m, { text, reply }) => {
  try {
    if (!text) return reply("⚠️ *Please enter a song name or YouTube link!* 🎵");

    let ytLink;

    // 🔍 If it's a link, use it directly — else search
    if (text.includes("youtube.com") || text.includes("youtu.be")) {
      ytLink = text;
    } else {
      const searchAPI = `https://api.id.dexter.it.com/search/youtube?q=${encodeURIComponent(text)}`;
      const searchRes = await axios.get(searchAPI);

      if (!searchRes.data.status || searchRes.data.result.length === 0)
        return reply("❌ *No matching song found!* 😔");

      ytLink = searchRes.data.result[0].link;
    }

    // 🎵 Download song
    const dlAPI = `https://apis-starlights-team.koyeb.app/starlight/youtube-mp3?url=${encodeURIComponent(ytLink)}&format=mp3`;
    const dlRes = await axios.get(dlAPI);
    const data = dlRes.data;

    if (!data || !data.dl_url)
      return reply("🚫 *Failed to get download link!*");

    // 💿 Stylish but simple caption
    const caption = `
──────────────────────────────
🎵 *Title:* ${data.title}
🎤 *Artist:* ${data.author}
💽 *Quality:* ${data.quality}
📺 *YouTube:* ${data.url}
──────────────────────────────
💠 *WhiteShadow-MD Music Downloader*
🎧 *Enjoy your vibes!*
──────────────────────────────
`.trim();

    // 🖼️ Send thumbnail + caption
    await conn.sendMessage(m.chat, {
      image: { url: data.thumbnail },
      caption,
    });

    // 🎶 Send MP3 file cleanly (no ad style)
    await conn.sendMessage(
      m.chat,
      {
        audio: { url: data.dl_url },
        mimetype: "audio/mpeg",
        fileName: `${data.title}.mp3`,
      },
      { quoted: mek }
    );

  } catch (err) {
    console.error(err);
    reply("⚠️ *Something went wrong while downloading your song!* 😢");
  }
});
