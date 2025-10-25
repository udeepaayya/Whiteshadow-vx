const { cmd } = require('../command');
const axios = require('axios');
const fetch = require('node-fetch');

const footer = "> ⚡ Powered by WhiteShadow-MD";

cmd({
  pattern: "cz",
  alias: ["czmovie", "cinesubz"],
  desc: "Search Sinhala Sub movies (CineSubz API)",
  category: "movie",
  react: "🎬",
  use: ".cz <movie name>",
  filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
  try {
    if (!q) return reply("🎬 *Please enter a movie name!*\nExample: .cz Titanic");

    const searchRes = await axios.get(`https://foreign-marna-sithaunarathnapromax-9a005c2e.koyeb.app/api/cinesubz/search?q=${encodeURIComponent(q)}&apiKey=d3d7e61cc85c2d70974972ff6d56edfac42932d394f7551207d2f6ca707eda56`);
    const searchData = searchRes.data.data;

    if (!searchData || searchData.length === 0) return reply("❌ No results found!");

    let listMsgText = `🎬 *CineSubz Movie Search Results*\n\n`;
    searchData.slice(0, 8).forEach((movie, i) => {
      listMsgText += `*${i + 1}.* ${movie.title}\n🗓️ ${movie.year}\n🎞️ ${movie.type}\n\n`;
    });
    listMsgText += `_Reply with number to view info_\n\n${footer}`;

    const listMsg = await conn.sendMessage(from, { text: listMsgText }, { quoted: mek });
    const listMsgId = listMsg.key.id;

    conn.ev.on("messages.upsert", async (update) => {
      const msg = update?.messages?.[0];
      if (!msg?.message) return;

      const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
      const isReplyToList = msg?.message?.extendedTextMessage?.contextInfo?.stanzaId === listMsgId;
      if (!isReplyToList) return;

      const index = parseInt(text.trim()) - 1;
      if (isNaN(index) || index < 0 || index >= searchData.length) return reply("❌ Invalid number!");

      const movie = searchData[index];
      await reply(`📑 Fetching info for *${movie.title}*...`);

      const infoRes = await axios.get(`https://foreign-marna-sithaunarathnapromax-9a005c2e.koyeb.app/api/cinesubz/movie-details?url=${encodeURIComponent(movie.link)}&apiKey=d3d7e61cc85c2d70974972ff6d56edfac42932d394f7551207d2f6ca707eda56`);
      const det = infoRes.data.mainDetails;

      const caption = `🎬 *${det.maintitle}*\n🗓️ ${det.dateCreated || 'Unknown'}\n🎞️ ${movie.type}\n🌐 ${det.country || 'N/A'}\n📄 ${det.genres?.join(", ") || 'Unknown'}\n⏱️ ${det.runtime || 'N/A'}\n\n_Reply "1" to download 720p_\n\n${footer}`;

      const infoMsg = await conn.sendMessage(from, {
        image: { url: det.imageUrl || movie.imageSrc },
        caption: caption
      }, { quoted: mek });
      const infoMsgId = infoMsg.key.id;

      conn.ev.on("messages.upsert", async (dlUpdate) => {
        const dlMsg = dlUpdate?.messages?.[0];
        if (!dlMsg?.message) return;

        const dlText = dlMsg.message?.conversation || dlMsg.message?.extendedTextMessage?.text;
        const isReplyToInfo = dlMsg?.message?.extendedTextMessage?.contextInfo?.stanzaId === infoMsgId;
        if (!isReplyToInfo) return;

        if (dlText.trim() !== "1") return reply("❌ Invalid input. Reply with 1 to download.");

        const dlRes = await axios.get(`https://foreign-marna-sithaunarathnapromax-9a005c2e.koyeb.app/api/cinesubz/downloadurl?url=${encodeURIComponent(movie.link)}&apiKey=d3d7e61cc85c2d70974972ff6d56edfac42932d394f7551207d2f6ca707eda56`);
        const fileUrl = dlRes.data.url;
        const fileSize = dlRes.data.size;

        await reply(`📥 Download ready: *${det.maintitle}* (${fileSize})`);
        await conn.sendMessage(from, {
          document: { url: fileUrl },
          fileName: `${det.maintitle}.mp4`,
          mimetype: "video/mp4",
          caption: `🎬 *${det.maintitle}* (720p)\n${footer}`
        }, { quoted: dlMsg });
      });
    });

  } catch (e) {
    console.error(e);
    reply("⚠️ *Error!* Something went wrong.");
  }
});
