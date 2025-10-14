//=====================================
// 🤣 WhiteShadow-MD Meme Video Plugin (Fun + Reply Number Quality)
// 👨‍💻 Developer: Chamod Nimsara
//=====================================

const { cmd } = require('../command');
const axios = require('axios');

const pendingReplies = new Map(); // map<chatId, { from, mapping, vids, timeoutId }>

cmd({
  pattern: "xvideo",
  alias: ["xv", "xvid"],
  desc: "Search meme/funny videos and choose quality (1/2/3)",
  category: "fun",
  react: "😂",
  use: ".xvideo <keyword>",
  filename: __filename
}, async (conn, mek, m, { text, reply }) => {
  try {
    if (!text) return reply("🔎 *Enter a keyword!* Example: `.xvideo indian funny`");

    await reply(`🔍 Searching for: *${text}* ...`);

    // Step 1: Search API
    const searchRes = await axios.get(`https://api.nekolabs.my.id/discovery/xvideos/search?q=${encodeURIComponent(text)}`, { timeout: 10000 });
    if (!searchRes.data?.success || !searchRes.data.result?.length) 
      return reply("😅 No meme/funny video found!");

    const result = searchRes.data.result[0]; // take first result

    // Step 2: Downloader API
    const downloaderRes = await axios.get(`https://api.nekolabs.my.id/downloader/xvideos?url=${encodeURIComponent(result.url)}`, { timeout: 10000 });
    if (!downloaderRes.data?.success) return reply("⚠️ Error fetching video links.");

    const vids = downloaderRes.data.result.videos || {};
    const keys = Object.keys(vids);
    if (keys.length === 0) return reply("⚠️ No downloadable qualities available.");

    // Build mapping for reply numbers
    const preferOrder = ['low','high','HLS'];
    const ordered = preferOrder.filter(k => keys.includes(k)).concat(keys.filter(k => !preferOrder.includes(k)));
    const mapping = {};
    let menuText = `⬤───〔 *😂 WhiteShadow-MD Meme Video* 〕───⬤\n\n🎬 *Title:* ${result.title}\n⏱️ *Duration:* ${result.duration}\n\nChoose quality:\n`;
    ordered.forEach((k, idx) => {
      const num = idx + 1;
      mapping[String(num)] = k;
      const label = k === 'low' ? '360p (Low)' : k === 'high' ? '720p/1080p (High)' : k === 'HLS' ? 'HLS (Stream)' : k;
      menuText += `${num}️⃣ ${label}\n`;
    });
    menuText += `\nReply with the number (1/2/3) within 30s to get the video.`;

    // Send thumbnail + menu
    await conn.sendMessage(m.chat, {
      image: { url: result.cover },
      caption: menuText,
      contextInfo: {
        externalAdReply: {
          title: result.title,
          body: `${result.artist || 'Unknown'} • Meme/Funny`,
          thumbnailUrl: result.cover,
          sourceUrl: result.url,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: mek });

    // Store pending reply
    if (pendingReplies.has(m.chat)) {
      clearTimeout(pendingReplies.get(m.chat).timeoutId);
      pendingReplies.delete(m.chat);
    }

    const timeoutId = setTimeout(() => pendingReplies.delete(m.chat), 30000);
    pendingReplies.set(m.chat, { from: m.sender, mapping, vids, timeoutId });

  } catch (e) {
    console.log(e);
    reply("⚠️ Something went wrong while searching meme video! 😢");
  }
});

// Listener for user's number reply
conn.ev.on('messages.upsert', async (msgUpdate) => {
  try {
    const messages = msgUpdate.messages;
    if (!messages?.[0]) return;
    const message = messages[0];
    if (!message.message?.conversation) return;

    const chatId = message.key.remoteJid;
    const text = message.message.conversation.trim();
    if (!pendingReplies.has(chatId)) return;

    const pending = pendingReplies.get(chatId);
    if (message.key.participant && message.key.participant !== pending.from && message.key.remoteJid !== pending.from) return;

    if (!pending.mapping[text]) {
      await conn.sendMessage(chatId, { text: '❌ Invalid choice. Reply with the number shown (1/2/3).' }, { quoted: message });
      return;
    }

    const chosenKey = pending.mapping[text];
    const urlToSend = pending.vids[chosenKey];
    clearTimeout(pending.timeoutId);
    pendingReplies.delete(chatId);

    if (chosenKey.toLowerCase().includes('hls') || urlToSend.endsWith('.m3u8')) {
      await conn.sendMessage(chatId, { text: `🔗 *Streaming Link (${chosenKey})*\n${urlToSend}\n\n(Use HLS player)` }, { quoted: message });
      return;
    }

    await conn.sendMessage(chatId, {
      document: { url: urlToSend },
      mimetype: 'video/mp4',
      fileName: `meme_${Date.now()}.mp4`,
      caption: `✅ Download ready (${chosenKey})\n*WhiteShadow-MD — Fun Meme*`
    }, { quoted: message });

  } catch (e) {
    console.log('Reply handler error', e);
  }
});
