//=====================================
// 😂 WhiteShadow-MD XVideos Plugin
// 👨‍💻 Developer: Chamod Nimsara
// Description: Search meme/funny videos & reply-number quality download
//=====================================

const { cmd } = require('../command');
const { fetchJson } = require('../lib/functions');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Global map to track pending replies
const pendingReplies = new Map();

cmd({
  pattern: "xvideo",
  alias: ["xv", "xvid"],
  desc: "Search meme/funny videos and download (1/2/3 reply)",
  category: "fun",
  react: "😂",
  use: ".xvideo <keyword>",
  filename: __filename
}, async (conn, mek, m, { text, from, reply }) => {
  try {
    if (!text) return reply("🔎 *Enter a keyword!* Example: `.xvideo indian funny`");

    await reply(`🔍 Searching for: *${text}* ...`);

    // Step 1: Search API
    const searchRes = await fetchJson(`https://api.nekolabs.my.id/discovery/xvideos/search?q=${encodeURIComponent(text)}`);
    if (!searchRes?.success || !searchRes.result?.length) 
      return reply("😅 No meme/funny video found!");

    const result = searchRes.result[0];

    // Step 2: Downloader API
    const downloaderRes = await fetchJson(`https://api.nekolabs.my.id/downloader/xvideos?url=${encodeURIComponent(result.url)}`);
    if (!downloaderRes?.success) return reply("⚠️ Error fetching video links.");

    const vids = downloaderRes.result.videos || {};
    const keys = Object.keys(vids);
    if (keys.length === 0) return reply("⚠️ No downloadable qualities available.");

    // Build mapping for reply numbers
    const preferOrder = ['low','high','HLS'];
    const ordered = preferOrder.filter(k => keys.includes(k)).concat(keys.filter(k => !preferOrder.includes(k)));
    const mapping = {};
    let menuText = `⬤───〔 *😂 WhiteShadow-MD Meme Video* 〕───⬤\n\n🎬 *Title:* ${result.title}\n⏱️ *Duration:* ${result.duration}\n\nReply with number to choose quality:\n`;
    ordered.forEach((k, idx) => {
      const num = idx + 1;
      mapping[String(num)] = k;
      const label = k === 'low' ? '360p (Low)' : k === 'high' ? '720p/1080p (High)' : k === 'HLS' ? 'HLS (Stream)' : k;
      menuText += `${num}️⃣ ${label}\n`;
    });
    menuText += `\nReply within 30s to get video.`;

    // Send thumbnail + menu
    await conn.sendMessage(from, {
      image: { url: result.cover },
      caption: menuText,
    }, { quoted: mek });

    // Store pending reply
    if (pendingReplies.has(from)) {
      clearTimeout(pendingReplies.get(from).timeoutId);
      pendingReplies.delete(from);
    }
    const timeoutId = setTimeout(() => pendingReplies.delete(from), 30000);
    pendingReplies.set(from, { vids, mapping, from, timeoutId, title: result.title });

  } catch (e) {
    console.log(e);
    reply("⚠️ Something went wrong while searching meme video! 😢");
  }
});

// ================================
// Single global listener for replies
// ================================
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
    if (message.key.participant && message.key.participant !== pending.from) return;

    if (!pending.mapping[text]) {
      await conn.sendMessage(chatId, { text: '❌ Invalid choice. Reply with the number shown.' }, { quoted: message });
      return;
    }

    const chosenKey = pending.mapping[text];
    let urlToDownload = pending.vids[chosenKey];

    clearTimeout(pending.timeoutId);
    pendingReplies.delete(chatId);

    // HLS stream send as link
    if (chosenKey.toLowerCase().includes('hls') || urlToDownload.endsWith('.m3u8')) {
      await conn.sendMessage(chatId, { text: `🔗 *Streaming Link (${chosenKey})*\n${urlToDownload}\n\n(Use HLS player)` }, { quoted: message });
      return;
    }

    // Download video to temp folder
    const tmpFile = path.join(__dirname, `temp_${Date.now()}.mp4`);
    const writer = fs.createWriteStream(tmpFile);
    const response = await axios({ url: urlToDownload, method: 'GET', responseType: 'stream' });
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    // Send downloaded video
    await conn.sendMessage(chatId, {
      video: { url: tmpFile },
      caption: `✅ Download ready (${chosenKey})\n*WhiteShadow-MD — Fun Meme*`
    }, { quoted: message });

    // Delete temp file
    fs.unlinkSync(tmpFile);

  } catch (e) {
    console.log('Reply handler error', e);
  }
});
