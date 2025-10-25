const { cmd } = require('../command');
const axios = require('axios');
const fetch = require('node-fetch');

const API_KEY = "d3d7e61cc85c2d70974972ff6d56edfac42932d394f7551207d2f6ca707eda56";

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

    reply("🔎 Searching CineSubz...");

    // 1️⃣ Search API
    const search = await axios.get(`https://foreign-marna-sithaunarathnapromax-9a005c2e.koyeb.app/api/cinesubz/search?q=${encodeURIComponent(q)}&apiKey=${API_KEY}`);
    if (!search.data || !search.data.data || search.data.data.length === 0) return reply("❌ No results found!");

    let movies = search.data.data.slice(0, 8); // Top 8 results
    let msg = `🎬 *CineSubz Movie Search*\n\n`;
    movies.forEach((mv, i) => {
      msg += `*${i + 1}.* ${mv.title} (${mv.type})\nRating: ${mv.rating || 'N/A'}\nYear: ${mv.year}\n\n`;
    });
    msg += "_Reply with the number to view movie info_\n\n⚡ Powered by WhiteShadow-MD";

    await conn.sendMessage(from, { text: msg }, { quoted: mek });

    // Wait for user reply with number
    conn.ev.once('messages.upsert', async (data) => {
      const selected = data.messages[0].message?.conversation;
      if (!selected) return;
      const num = parseInt(selected);
      if (isNaN(num) || num < 1 || num > movies.length) return reply("❌ Invalid number!");

      const movie = movies[num - 1];
      reply(`📑 Fetching info for *${movie.title}*...`);

      // 2️⃣ Movie Details API
      const info = await axios.get(`https://foreign-marna-sithaunarathnapromax-9a005c2e.koyeb.app/api/cinesubz/movie-details?url=${encodeURIComponent(movie.link)}&apiKey=${API_KEY}`);
      const det = info.data.mainDetails;

      let caption = `🎬 *${det.maintitle}*\n🗓️ ${det.dateCreated}\n🎞️ ${det.runtime}\nCountry: ${det.country}\nGenres: ${det.genres.join(", ")}\n\nDescription:\n${movie.description || ''}\n\n_Reply "download" to get 720p movie_\n\n⚡ Powered by WhiteShadow-MD`;

      await conn.sendMessage(from, {
        image: { url: det.imageUrl || movie.imageSrc },
        caption: caption
      }, { quoted: mek });

      // Wait for user to reply "download"
      conn.ev.once('messages.upsert', async (data2) => {
        const msg2 = data2.messages[0].message?.conversation?.toLowerCase();
        if (!msg2 || !msg2.includes("download")) return;

        reply(`📥 Preparing 720p download for *${det.maintitle}*...`);

        // 3️⃣ Download URL API
        const dl = await axios.get(`https://foreign-marna-sithaunarathnapromax-9a005c2e.koyeb.app/api/cinesubz/downloadurl?url=${encodeURIComponent(movie.link)}&apiKey=${API_KEY}`);
        const fileUrl = dl.data?.url;
        const size = dl.data?.size || "Unknown";
        const quality = dl.data?.quality || "720p";

        if (!fileUrl) return reply("❌ Download link not found!");

        // Check if file is under 2GB
        const head = await fetch(fileUrl, { method: 'HEAD' });
        const contentLength = head.headers.get('content-length');
        const fileSizeMB = contentLength ? (contentLength / (1024 * 1024)).toFixed(2) : size.replace(' GB', '') * 1024;

        if (fileSizeMB <= 2048) {
          reply(`📤 Sending *${det.maintitle}* (${fileSizeMB} MB)...`);
          await conn.sendMessage(from, {
            document: { url: fileUrl },
            fileName: `${det.maintitle}.mp4`,
            mimetype: "video/mp4",
            caption: `🎬 *${det.maintitle}* (${quality})\n⚡ Powered by WhiteShadow-MD`
          }, { quoted: mek });
        } else {
          reply(`⚠️ File too large (${fileSizeMB}MB)\n📎 Download manually:\n${fileUrl}\n\n⚡ Powered by WhiteShadow-MD`);
        }
      });
    });

  } catch (e) {
    console.error(e);
    reply("⚠️ *Error!* Something went wrong.");
  }
});
