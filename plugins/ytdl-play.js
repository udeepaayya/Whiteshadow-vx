const { cmd } = require('../command');
const fetch = require('node-fetch');

cmd({
  pattern: "play2",
  desc: "Download YouTube audio",
  category: "download",
  filename: __filename
}, async (conn, m, mek, { from, q }) => {
  try {
    if (!q) return m.reply("❌ Please provide a YouTube URL or search query!");

    // API Call
    let api = `https://gtech-api-xtp1.onrender.com/api/audio/yt?apikey=APIKEY&url=${encodeURIComponent(q)}`;
    let res = await fetch(api);
    let data = await res.json();

    if (!data.status || !data.result?.media?.audio_url) {
      return m.reply("❌ Failed to fetch audio!");
    }

    let media = data.result.media;

    await m.reply("⏳ Downloading audio...");

    await conn.sendMessage(from, {
      audio: { url: media.audio_url },
      mimetype: "audio/mpeg",
      fileName: `${media.title}.mp3`,
      contextInfo: {
        externalAdReply: {
          title: media.title,
          body: media.channel || "YouTube Audio",
          thumbnailUrl: media.thumbnail,
          mediaType: 1,
          mediaUrl: q,
          sourceUrl: q
        }
      }
    }, { quoted: m });

    await m.reply(`✅ *${media.title}* downloaded successfully!`);

  } catch (e) {
    console.error(e);
    m.reply("❌ Error: " + e.message);
  }
});
