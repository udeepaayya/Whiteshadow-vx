//=====================================
// 😂 WhiteShadow-MD XVideos Plugin (XNXX Style Reply)
// 👨‍💻 Developer: Chamod Nimsara
//=====================================

const { cmd } = require('../command');
const { fetchJson } = require('../lib/functions');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const pendingSearch = new Map(); // track search selection
const pendingQuality = new Map(); // track quality selection

cmd({
  pattern: "xvideo",
  alias: ["xv", "xvid"],
  desc: "Search meme/funny videos and download (XNXX style reply)",
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

    // Take top 3 results
    const results = searchRes.result.slice(0, 3);

    let listMsgText = "⬤───〔 *😂 WhiteShadow-MD Meme Video Search* 〕───⬤\n\n";
    results.forEach((r, i) => {
      listMsgText += `*${i + 1} | ${r.title}*\nDuration: ${r.duration}\n\n`;
    });
    listMsgText += "🔢 Reply 1/2/3 to select video.\n";

    const listMsg = await conn.sendMessage(from, { text: listMsgText }, { quoted: mek });
    const listMsgId = listMsg.key.id;

    // Store pending search
    pendingSearch.set(from, { results, listMsgId });
    setTimeout(() => pendingSearch.delete(from), 30000);

  } catch (e) {
    console.log(e);
    reply("⚠️ Something went wrong while searching meme video! 😢");
  }
});

// ================================
// Global listener for search selection
// ================================
conn.ev.on('messages.upsert', async (msgUpdate) => {
  try {
    const messages = msgUpdate.messages;
    if (!messages?.[0]) return;
    const message = messages[0];
    const chatId = message.key.remoteJid;
    const text = message.message?.conversation?.trim();
    if (!text) return;

    // ===================== Search selection =====================
    if (pendingSearch.has(chatId)) {
      const pending = pendingSearch.get(chatId);
      if (message.key.participant && message.key.participant !== pending.from) return;
      const index = parseInt(text) - 1;
      if (isNaN(index) || index < 0 || index >= pending.results.length) {
        return conn.sendMessage(chatId, { text: "❌ Invalid number, reply 1/2/3." }, { quoted: message });
      }

      const chosen = pending.results[index];
      pendingSearch.delete(chatId);

      // Downloader API
      const downloaderRes = await fetchJson(`https://api.nekolabs.my.id/downloader/xvideos?url=${encodeURIComponent(chosen.url)}`);
      if (!downloaderRes?.success) return conn.sendMessage(chatId, { text: "⚠️ Error fetching video links." }, { quoted: message });

      const vids = downloaderRes.result.videos || {};
      const keys = Object.keys(vids).filter(k => k !== 'HLS'); // low/high only

      if (keys.length === 0) return conn.sendMessage(chatId, { text: "⚠️ No downloadable qualities available." }, { quoted: message });

      let qualityMsg = `🎬 *${chosen.title}*\n⏱️ Duration: ${chosen.duration}\n\nReply to choose quality:\n`;
      keys.forEach((k, i) => {
        const label = k === 'low' ? '360p (Low)' : 'high' ? '720p/1080p (High)' : k;
        qualityMsg += `${i + 1}️⃣ ${label}\n`;
      });

      const qualityMsgSent = await conn.sendMessage(chatId, { text: qualityMsg }, { quoted: message });
      const qualityMsgId = qualityMsgSent.key.id;

      // Store pending quality
      pendingQuality.set(chatId, { vids, keys, qualityMsgId });
      setTimeout(() => pendingQuality.delete(chatId), 30000);

      return;
    }

    // ===================== Quality selection =====================
    if (pendingQuality.has(chatId)) {
      const pending = pendingQuality.get(chatId);
      if (message.key.participant && message.key.participant !== pending.from) return;
      if (message.message?.extendedTextMessage?.contextInfo?.stanzaId !== pending.qualityMsgId) return;

      const index = parseInt(text) - 1;
      if (isNaN(index) || index < 0 || index >= pending.keys.length) {
        return conn.sendMessage(chatId, { text: "❌ Invalid number for quality." }, { quoted: message });
      }

      const chosenKey = pending.keys[index];
      let urlToDownload = pending.vids[chosenKey];
      pendingQuality.delete(chatId);

      // Download to temp file
      const tmpFile = path.join(__dirname, `temp_${Date.now()}.mp4`);
      const writer = fs.createWriteStream(tmpFile);
      const response = await axios({ url: urlToDownload, method: 'GET', responseType: 'stream' });
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      // Send video
      await conn.sendMessage(chatId, {
        video: { url: tmpFile },
        caption: `✅ Download ready (${chosenKey})\n*WhiteShadow-MD — Fun Meme*`
      }, { quoted: message });

      // Delete temp file
      fs.unlinkSync(tmpFile);

      return;
    }

  } catch (e) {
    console.log('Global reply handler error', e);
  }
});
