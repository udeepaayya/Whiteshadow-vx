/**
  ✧ yts2 - youtube search plugin ✧
  ✦ Developer: Chamod Nimsara (WhiteShadow)
  ✦ API: https://whiteshadow-yts.vercel.app/?q=
  ✦ Type: ESM Compatible Plugin
**/
const { cmd } = require('../command');
const config = require('../config');
const fetch = require('node-fetch');
const https = require('https');

const ws_footer = config.FOOTER || "© WhiteShadow-MD ❤️";

cmd({
  pattern: "yts2",
  alias: ["ytsearch2"],
  react: "🎬",
  desc: "Search YouTube (API) & download audio",
  category: "download",
  use: ".yts2 <song name>",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  try {
    if (!q) return await reply("❌ Please enter a song name!");

    // API call to your YTS API
    const apiUrl = `https://whiteshadow-yts.vercel.app/?q=${encodeURIComponent(q)}`;
    const agent = new https.Agent({ rejectUnauthorized: false });
    const res = await fetch(apiUrl, { agent });
    const data = await res.json();

    if (!data.success || !data.videos || data.videos.length === 0)
      return await reply("⚠️ No results found!");

    // Filter only video type
    const videos = data.videos.filter(v => v.type === "video").slice(0, 8);

    let msg = `🎬 *Search Results for:* ${q}\n\n`;
    videos.forEach((v, i) => {
      msg += `*${i+1} |* ${v.name}\n`;
    });
    msg += `\n🪄 Reply with number (1-${videos.length}) to get details & download.\n\n${ws_footer}`;

    const sent = await conn.sendMessage(from, { text: msg }, { quoted: mek });
    const msgId = sent.key.id;

    // Wait for reply to select video
    conn.ev.on("messages.upsert", async (update) => {
      const msgObj = update.messages?.[0];
      if (!msgObj?.message) return;

      const text = msgObj.message.conversation || msgObj.message?.extendedTextMessage?.text;
      const isReply = msgObj.message?.extendedTextMessage?.contextInfo?.stanzaId === msgId;
      if (!isReply) return;

      const index = parseInt(text.trim()) - 1;
      if (isNaN(index) || index < 0 || index >= videos.length)
        return await reply("❌ Invalid number!", msgObj);

      const chosen = videos[index];
      const thumbnail = chosen.thumbnail.replace(/\[|\]/g, "");
      const caption =
`🎵 *${chosen.name}*
👤 Channel: ${chosen.author}
👁️ Views: ${chosen.views}
🕒 Duration: ${chosen.duration}
📅 Published: ${chosen.published}

🔗 ${chosen.url}

⏬ Reply 1 to download audio MP3

${ws_footer}`;

      const infoMsg = await conn.sendMessage(from, { image: { url: thumbnail }, caption }, { quoted: msgObj });
      const infoMsgId = infoMsg.key.id;

      conn.ev.on("messages.upsert", async (replyUpdate) => {
        const rMsg = replyUpdate.messages?.[0];
        if (!rMsg?.message) return;

        const replyTxt = rMsg.message.conversation || rMsg.message?.extendedTextMessage?.text;
        const isReplyToInfo = rMsg.message?.extendedTextMessage?.contextInfo?.stanzaId === infoMsgId;
        if (!isReplyToInfo) return;

        if (replyTxt.trim() !== "1") return await conn.sendMessage(from, { text: "❌ Reply 1 to download audio." }, { quoted: rMsg });

        await conn.sendMessage(from, { text: "⏳ Fetching audio link..." }, { quoted: rMsg });

        // Use your Koyeb API for audio
        const audioApi = `https://foreign-marna-sithaunarathnapromax-9a005c2e.koyeb.app/api/ytapi?url=${encodeURIComponent(chosen.url)}&fo=2&qu=144&apiKey=d3d7e61cc85c2d70974972ff6d56edfac42932d394f7551207d2f6ca707eda56`;
        const res2 = await fetch(audioApi, { agent });
        const audioData = await res2.json();

        if (!audioData.downloadData || !audioData.downloadData.url)
          return await reply("⚠️ Audio download link not found!", rMsg);

        const downloadUrl = audioData.downloadData.url;
        const title = chosen.name.length > 40 ? chosen.name.slice(0, 40) + "..." : chosen.name;

        await conn.sendMessage(from, {
          audio: { url: downloadUrl },
          mimetype: "audio/mpeg",
          fileName: `${title}.mp3`,
          ptt: false,
          caption: `🎧 *${chosen.name}*\n> ${ws_footer}`
        }, { quoted: rMsg });
      });
    });

  } catch (err) {
    console.error(err);
    await reply(`❌ Error: ${err.message}`);
  }
});
