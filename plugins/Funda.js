//=====================================
// 🤣 WhiteShadow-MD Meme Video Picker (quality selector)
// 👨‍💻 Developer: Chamod Nimsara
//=====================================

const { cmd } = require('../command');
const axios = require('axios');

const pendingReplies = new Map(); // map<chatId, { from, mapping, timeoutId }>

cmd({
  pattern: "memex",
  alias: ["memevid", "funvid"],
  desc: "Search meme videos and choose quality (1/2/3)",
  category: "fun",
  react: "😂",
  use: ".memex <keyword>",
  filename: __filename
}, async (conn, mek, m, { text, reply }) => {
  try {
    if (!text) return reply("🎬 *Enter a keyword!* Example: `.memex indian funny`");

    await reply(`🔍 Searching for: *${text}* ...`);

    const searchRes = await axios.get(`https://api.nekolabs.my.id/discovery/xvideos/search?q=${encodeURIComponent(text)}`, { timeout: 10000 });
    if (!searchRes.data || !searchRes.data.success || !searchRes.data.result || searchRes.data.result.length === 0)
      return reply("😅 No results found for that keyword.");

    const result = searchRes.data.result[0]; // take first result
    const downloaderRes = await axios.get(`https://api.nekolabs.my.id/downloader/xvideos?url=${encodeURIComponent(result.url)}`, { timeout: 10000 });
    if (!downloaderRes.data || !downloaderRes.data.success) return reply("⚠️ Error fetching video URLs.");

    const vids = downloaderRes.data.result.videos || {};
    // build mapping from numbers to available qualities
    const keys = Object.keys(vids); // e.g. ['low','high','HLS']
    if (keys.length === 0) return reply("⚠️ No downloadable qualities available.");

    // Create ordered list: prefer low, high, HLS ordering if present
    const preferOrder = ['low','medium','high','HLS'];
    const ordered = preferOrder.filter(k => keys.includes(k)).concat(keys.filter(k => !preferOrder.includes(k)));

    // construct menu text with numbers
    let menu = `⬤───〔 *😂 WhiteShadow-MD Meme Picker* 〕───⬤\n\n🎬 *Title:* ${result.title}\n⏱️ *Duration:* ${result.duration}\n\nChoose quality to download:\n\n`;
    const mapping = {}; // number -> key
    ordered.forEach((k, idx) => {
      const num = idx + 1;
      mapping[String(num)] = k;
      // try to show friendly label
      const label = k === 'low' ? '360p (low)' : k === 'high' ? '720p/1080p (high)' : k === 'HLS' ? 'HLS (stream)' : k;
      menu += `${num}️⃣ ${label}\n`;
    });
    menu += `\nReply with the number (e.g. 1) within 30s to get the file.`;

    // send cover + menu
    await conn.sendMessage(m.chat, {
      image: { url: result.cover },
      caption: menu,
      contextInfo: {
        externalAdReply: {
          title: result.title,
          body: `${result.artist || 'Unknown'} • Meme`,
          thumbnailUrl: result.cover,
          sourceUrl: result.url,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: mek });

    // setup pending reply for this chat (single active per chat)
    if (pendingReplies.has(m.chat)) {
      clearTimeout(pendingReplies.get(m.chat).timeoutId);
      pendingReplies.delete(m.chat);
    }

    const timeoutId = setTimeout(() => {
      pendingReplies.delete(m.chat);
    }, 30000);

    pendingReplies.set(m.chat, { from: m.sender, mapping, vids, timeoutId });

  } catch (e) {
    console.log(e);
    reply("⚠️ Something went wrong while searching meme videos.");
  }
});

// global listener for user's numeric reply
// make sure this file runs once (your bot may already have a similar global listener — avoid duplicates)
conn = (typeof conn !== 'undefined') ? conn : null;
if (conn) {
  try {
    conn.ev.on('messages.upsert', async (msgUpdate) => {
      try {
        const messages = msgUpdate.messages;
        if (!messages || !messages[0]) return;
        const message = messages[0];
        if (!message.message || !message.message.conversation) return;

        const chatId = message.key.remoteJid;
        const text = message.message.conversation.trim();
        if (!pendingReplies.has(chatId)) return;

        const pending = pendingReplies.get(chatId);
        // only accept from same user who initiated
        if (message.key.participant && message.key.participant !== pending.from && message.key.remoteJid !== pending.from) {
          // ignore others
          return;
        }
        // sometimes m.sender differs; best-effort: allow same participant or same sender
        // check mapping validity
        if (!pending.mapping || Object.keys(pending.mapping).length === 0) {
          // reconstruct mapping from pending.vids keys
          const keys = Object.keys(pending.vids);
          const preferOrder = ['low','medium','high','HLS'];
          const ordered = preferOrder.filter(k => keys.includes(k)).concat(keys.filter(k => !preferOrder.includes(k)));
          const mapping = {};
          ordered.forEach((k, idx) => mapping[String(idx+1)] = k);
          pending.mapping = mapping;
        }

        if (!pending.mapping[text]) {
          // if user sent something else, ignore or send hint
          await conn.sendMessage(chatId, { text: '❌ Invalid choice. Reply with the number shown (e.g. 1).' }, { quoted: message });
          return;
        }

        const chosenKey = pending.mapping[text];
        const urlToSend = pending.vids[chosenKey];

        // clear pending
        clearTimeout(pending.timeoutId);
        pendingReplies.delete(chatId);

        // If HLS send as text link (can't send m3u8 as document reliably)
        if (chosenKey.toLowerCase().includes('hls') || (typeof urlToSend === 'string' && urlToSend.endsWith('.m3u8'))) {
          await conn.sendMessage(chatId, {
            text: `🔗 *Streaming Link (${chosenKey})*\n${urlToSend}\n\n(Use a player that supports HLS)`
          }, { quoted: message });
          return;
        }

        // Otherwise try to send as document (so it downloads)
        await conn.sendMessage(chatId, {
          document: { url: urlToSend },
          mimetype: 'video/mp4',
          fileName: `meme_${Date.now()}.mp4`,
          caption: `✅ Download ready (${chosenKey})\n*WhiteShadow-MD — Fun Mode*`
        }, { quoted: message });

      } catch (e) {
        console.log('reply-listener error', e);
      }
    });
  } catch (e) {
    console.log('failed to attach messages.upsert listener', e);
  }
} else {
  // If conn is not defined in this scope, your bot system likely attaches listeners elsewhere.
  // Ensure a similar messages.upsert listener exists in your main bot file that uses pendingReplies Map.
}
