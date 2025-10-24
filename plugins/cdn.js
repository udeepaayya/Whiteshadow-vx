/**
  ✧ yts2 - youtube search plugin ✧
  ✦ Developer: Chamod Nimsara (WhiteShadow)
  ✦ API: https://whiteshadow-yts.vercel.app/?q=
  ✦ Type: ESM Compatible Plugin
**/

const { cmd } = require('../command');
const axios = require('axios');

cmd({
  pattern: "yts2",
  alias: ["ytsearch2", "yt2"],
  react: "🔎",
  desc: "Search YouTube videos (WhiteShadow API)",
  category: "download",
  use: ".yts2 <song name>",
  filename: __filename
}, async (conn, mek, m, { text, reply }) => {
  if (!text) return reply("🧠 Use: *.yts2 Lelena*");

  try {
    const { data } = await axios.get(`https://whiteshadow-yts.vercel.app/?q=${encodeURIComponent(text)}`);
    if (!data || !data.videos || data.videos.length === 0)
      return reply("❌ No results found!");

    let list = `🔎 *Search Results for:* ${text}\n\n`;
    let vidList = [];
    let count = 1;

    for (const v of data.videos.filter(v => v.type === "video")) {
      list += `${count}. ${v.name}\n`;
      vidList.push(v);
      count++;
    }

    list += `\n💬 Reply with the number (1-${vidList.length}) to get video details.`;
    const sentMsg = await conn.sendMessage(m.chat, { text: list }, { quoted: mek });

    conn.ev.once('messages.upsert', async (msgEvent) => {
      try {
        const msg = msgEvent.messages[0];
        if (!msg.message || msg.key.remoteJid !== m.chat) return;
        const num = parseInt(msg.message.conversation?.trim() || msg.message.extendedTextMessage?.text?.trim());
        if (!num || num < 1 || num > vidList.length) return;

        const vid = vidList[num - 1];
        const details = `🎵 *${vid.name}*\n📺 *Channel:* ${vid.author}\n👁️ *Views:* ${vid.views}\n⏱️ *Duration:* ${vid.duration}\n📅 *Published:* ${vid.published}\n\n🔗 ${vid.url}`;

        await conn.sendMessage(m.chat, {
          image: { url: vid.thumbnail },
          caption: details
        }, { quoted: mek });
      } catch (err) {
        console.log("Reply handler error:", err);
      }
    });

  } catch (err) {
    console.error(err);
    reply("⚠️ Error fetching results.");
  }
});
