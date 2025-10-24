/**
  ✧ yts2 - youtube search plugin ✧
  ✦ Developer: Chamod Nimsara (WhiteShadow)
  ✦ API: https://whiteshadow-yts.vercel.app/?q=
  ✦ Type: ESM Compatible Plugin
**/

const { cmd } = require('../command');
const yts = require('yt-search');

let searchCache = {};

cmd({
  pattern: 'yts2',
  alias: ['ytsearch2'],
  desc: 'Search YouTube and get details by replying with number',
  category: 'download',
  react: '🎬'
}, async (conn, mek, m, { text, from }) => {
  try {
    if (!text) return await conn.sendMessage(from, { text: '🔍 *Please enter a song name.*\nExample: .yts2 lelena' });

    const { videos } = await yts(text);
    if (!videos || videos.length === 0) return await conn.sendMessage(from, { text: '⚠️ No results found.' });

    let msg = `🎬 *Search Results for:* ${text}\n\n`;
    searchCache[from] = videos.slice(0, 8);
    let i = 1;

    for (const v of searchCache[from]) {
      msg += `*${i++}.* ${v.title}\n`;
    }

    msg += `\n🪄 *Reply with number (1-${searchCache[from].length}) to get video details.*`;

    await conn.sendMessage(from, { text: msg }, { quoted: mek });

  } catch (err) {
    console.log(err);
    await conn.sendMessage(from, { text: '⚠️ Error fetching results.' });
  }
});

// detect reply (works in all chats)
cmd({
  on: 'chat-update'
}, async (conn, mek) => {
  try {
    if (!mek.message) return;
    const from = mek.key.remoteJid;
    const msg = mek.message.conversation || mek.message.extendedTextMessage?.text;
    if (!msg || !/^\d+$/.test(msg.trim())) return;
    if (!searchCache[from]) return;

    const index = parseInt(msg.trim()) - 1;
    const video = searchCache[from][index];
    if (!video) return;

    const caption = `🎶 *${video.title}*\n👤 Channel: ${video.author.name}\n👁️ Views: ${video.views}\n🕒 Duration: ${video.timestamp}\n📅 Uploaded: ${video.ago}\n\n🔗 ${video.url}`;

    await conn.sendMessage(from, {
      image: { url: video.thumbnail },
      caption
    }, { quoted: mek });

    delete searchCache[from];

  } catch (err) {
    console.log(err);
  }
});
