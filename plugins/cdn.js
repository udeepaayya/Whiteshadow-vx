/**
  ✧ yts2 - youtube search plugin ✧
  ✦ Developer: Chamod Nimsara (WhiteShadow)
  ✦ API: https://whiteshadow-yts.vercel.app/?q=
  ✦ Type: ESM Compatible Plugin
**/


    const { cmd } = require('../command');
const { fetchJson } = require('../lib/functions');
const yts = require('yt-search');

const ws_footer = "> © Powered by WhiteShadow-MD";

cmd({
  pattern: "yts2",
  alias: ["ytsearch2"],
  use: ".yts2 <song name>",
  react: "🎬",
  desc: "Search YouTube videos and download by replying.",
  category: "download",
  filename: __filename
}, async (conn, mek, m, { q, from, reply }) => {

  const react = async (msgKey, emoji) => {
    try {
      await conn.sendMessage(from, {
        react: {
          text: emoji,
          key: msgKey
        }
      });
    } catch (e) {
      console.error("Reaction error:", e.message);
    }
  };

  try {
    if (!q) return await reply("🔍 Please enter a YouTube search term!\nExample: *.yts2 lelena*");

    const search = await yts(q);
    if (!search.videos || search.videos.length === 0) return await reply("⚠️ No results found for your query.");

    let list = "🎬 *WHITE SHADOW YouTube Search Result*\n\n";
    search.videos.slice(0, 8).forEach((v, i) => {
      list += `*${i + 1} | | ${v.title}*\n`;
    });

    const listMsg = await conn.sendMessage(from, {
      text: list + `\n🔢 *Reply below number to select a video.*\n\n${ws_footer}`
    }, { quoted: mek });

    const listMsgId = listMsg.key.id;

    conn.ev.on("messages.upsert", async (update) => {
      const msg = update?.messages?.[0];
      if (!msg?.message) return;

      const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
      const isReplyToList = msg?.message?.extendedTextMessage?.contextInfo?.stanzaId === listMsgId;
      if (!isReplyToList) return;

      const index = parseInt(text.trim()) - 1;
      if (isNaN(index) || index < 0 || index >= search.videos.length) return reply("❌ Invalid number, please select a valid result.");

      await react(msg.key, '✅');
      const chosen = search.videos[index];

      const askType = await conn.sendMessage(from, {
        image: { url: chosen.thumbnail },
        caption:
          `🎶 *YouTube Video Info*\n\n` +
          `📌 *Title:* ${chosen.title}\n` +
          `👤 *Channel:* ${chosen.author.name}\n` +
          `👁️ *Views:* ${chosen.views}\n` +
          `🕒 *Duration:* ${chosen.timestamp}\n` +
          `📅 *Uploaded:* ${chosen.ago}\n\n` +
          `🔢 *Reply below number:*\n\n` +
          `1 | | 🎧 Download MP3\n` +
          `2 | | 🎥 Download MP4\n\n${ws_footer}`
      }, { quoted: msg });

      const typeMsgId = askType.key.id;

      conn.ev.on("messages.upsert", async (tUpdate) => {
        const tMsg = tUpdate?.messages?.[0];
        if (!tMsg?.message) return;

        const tText = tMsg.message?.conversation || tMsg.message?.extendedTextMessage?.text;
        const isReplyToType = tMsg?.message?.extendedTextMessage?.contextInfo?.stanzaId === typeMsgId;
        if (!isReplyToType) return;

        await react(tMsg.key, tText.trim() === "1" ? '🎧' : tText.trim() === "2" ? '🎥' : '❓');

        if (tText.trim() === "1") {
          await conn.sendMessage(from, {
            audio: { url: `https://api.agatz.xyz/api/ytmp3?url=${chosen.url}` },
            mimetype: 'audio/mpeg',
            fileName: `${chosen.title}.mp3`,
            caption: `🎧 *${chosen.title}*\n> ${ws_footer}`
          }, { quoted: tMsg });
        } else if (tText.trim() === "2") {
          await conn.sendMessage(from, {
            video: { url: `https://api.agatz.xyz/api/ytmp4?url=${chosen.url}` },
            caption: `🎥 *${chosen.title}*\n> ${ws_footer}`
          }, { quoted: tMsg });
        } else {
          await conn.sendMessage(from, { text: "❌ Invalid input. Type 1 for MP3 or 2 for MP4." }, { quoted: tMsg });
        }
      });
    });

  } catch (e) {
    console.error(e);
    await reply(`❌ Error: ${e.message}`);
  }
});
