const { cmd } = require('../command');
const axios = require('axios');
const yts = require('yt-search');

cmd({
  pattern: "sindu",
  alias: ["ගීත", "සින්දු"],
  desc: "Download or search YouTube songs in MP3 format",
  category: "download",
  react: "🎧",
  use: ".song <YouTube URL or Name>",
}, async (conn, mek, m, { q, reply }) => {
  try {
    if (!q) return reply("❌ Please provide a YouTube link or song name!");

    let url = q;
    // If not YouTube URL, search it
    if (!q.includes("youtube.com") && !q.includes("youtu.be")) {
      reply("🔍 Searching YouTube...");
      const search = await yts(q);
      if (!search || !search.videos || !search.videos.length)
        return reply("❌ No results found on YouTube!");

      url = search.videos[0].url; // first result link
    }

    const res = await axios.get(
      `https://apis-starlights-team.koyeb.app/starlight/youtube-mp3?url=${encodeURIComponent(url)}&format=mp3`
    );

    const data = res.data;
    if (!data || !data.dl_url) {
      return reply("⚠️ *Something went wrong while downloading your song!* 😢");
    }

    const caption = `
╭─────❖『 *🎵 WhiteShadow-MD* 』❖─────╮
┃  🎶 *Title:* ${data.title}
┃  👤 *Artist:* ${data.author}
┃  📡 *Quality:* ${data.quality}
┃  📺 *URL:* ${data.url}
╰──────────────────────────────╯
`;

    await conn.sendMessage(
      mek.chat,
      {
        image: { url: data.thumbnail },
        caption: caption,
      },
      { quoted: m }
    );

    await conn.sendMessage(
      mek.chat,
      {
        audio: { url: data.dl_url },
        mimetype: "audio/mpeg",
        fileName: `${data.title}.mp3`,
      },
      { quoted: m }
    );

  } catch (e) {
    console.error(e);
    reply("⚠️ *Something went wrong while downloading your song!* 😢");
  }
});
