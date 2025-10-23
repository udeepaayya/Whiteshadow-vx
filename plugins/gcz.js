//═══════════════════════════════════════════════//
//                WHITESHADOW-MD                 //
//═══════════════════════════════════════════════//
//  ⚡ Command : .cz / .czinfo / .czdl
//  🎬 Feature : CineSubz Sinhala Subtitle Movie Downloader
//  👑 Developer : Chamod Nimsara (WhiteShadow)
//  📡 API Source : asitha.top (foreign-marna-sithaunarathnapromax)
//═══════════════════════════════════════════════//

const { cmd } = require('../command');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

//────────────────── Search Command (.cz)
cmd({
  pattern: "cz",
  alias: ["cinesubz", "sinhalasub", "moviecz"],
  react: "🎬",
  desc: "Search Sinhala Subtitle Movies & Download via CineSubz API",
  category: "movies",
  use: ".cz <movie name>",
  filename: __filename
},
async (conn, mek, m, { from, args, reply }) => {
  try {
    if (!args[0]) return reply("🕵️‍♂️ *Please enter a movie name to search!*\n📘 Example: .cz new");

    const query = args.join(" ");
    const searchUrl = `https://foreign-marna-sithaunarathnapromax-9a005c2e.koyeb.app/api/cinesubz/search?q=${encodeURIComponent(query)}&apiKey=d3d7e61cc85c2d70974972ff6d56edfac42932d394f7551207d2f6ca707eda56`;

    const res = await fetch(searchUrl);
    const data = await res.json();

    if (!data?.data?.length) return reply("❌ No results found for your search.");

    let msg = `🎬 *CineSubz Sinhala Subtitle Movies* 🎥\n\n🔍 Results for: *${query}*\n───────────────────\n`;

    data.data.slice(0, 10).forEach((movie, i) => {
      msg += `📍 *${i + 1}.* ${movie.title}\n📅 Year: ${movie.year || "Unknown"}\n⭐ ${movie.rating || "N/A"}\n🎞️ Type: ${movie.type}\n🔗 ${movie.link}\n\n`;
    });

    msg += `───────────────────\n💡 *Use:* .czinfo <movie link>\nTo get movie details and download link.`;

    await conn.sendMessage(from, { text: msg }, { quoted: mek });

  } catch (e) {
    console.error(e);
    reply("⚠️ Error fetching CineSubz results!");
  }
});

//────────────────── Movie Info (.czinfo)
cmd({
  pattern: "czinfo",
  alias: ["czdetail", "czmovie"],
  react: "📄",
  desc: "Get full movie details + download link",
  category: "movies",
  use: ".czinfo <CineSubz Movie URL>",
  filename: __filename
},
async (conn, mek, m, { from, args, reply }) => {
  try {
    if (!args[0]) return reply("📎 *Please provide a CineSubz movie link!*\nExample: .czinfo https://cinesubz.net/movies/the-other-2025-sinhala-subtitles/");

    const movieUrl = encodeURIComponent(args[0]);
    const detailUrl = `https://foreign-marna-sithaunarathnapromax-9a005c2e.koyeb.app/api/cinesubz/movie-details?url=${movieUrl}&apiKey=d3d7e61cc85c2d70974972ff6d56edfac42932d394f7551207d2f6ca707eda56`;

    const response = await fetch(detailUrl);
    const data = await response.json();
    const d = data.mainDetails;
    const mov = data.moviedata;

    let caption = `🎬 *${d.maintitle}*\n\n⭐ *IMDb:* ${d.rating?.value || "N/A"} (${d.rating?.count || "?"} votes)\n🎭 *Genres:* ${d.genres?.join(", ") || "Unknown"}\n🕓 *Runtime:* ${d.runtime || "Unknown"}\n🌍 *Country:* ${d.country || "Unknown"}\n📅 *Released:* ${d.dateCreated}\n🎥 *Director:* ${mov.director || "Unknown"}\n\n📝 *Description:*\n${mov.description?.trim() || "No description"}\n\n🔗 *Watch Page:*\n${data.dilinks?.link}\n\n💾 *Use:* .czdl <episode link>\nTo download as MP4 document.`;

    await conn.sendMessage(from, {
      image: { url: d.imageUrl },
      caption
    }, { quoted: mek });

  } catch (err) {
    console.error(err);
    reply("⚠️ Error fetching movie details!");
  }
});

//────────────────── Download Command (.czdl)
cmd({
  pattern: "czdl",
  alias: ["czdownload"],
  react: "⬇️",
  desc: "Download CineSubz movie/episode and send as mp4 document",
  category: "movies",
  use: ".czdl <episode/movie link>",
  filename: __filename
},
async (conn, mek, m, { from, args, reply }) => {
  try {
    if (!args[0]) return reply("🎞️ Please provide a valid *episode/movie link!*");

    const url = encodeURIComponent(args[0]);
    const api = `https://foreign-marna-sithaunarathnapromax-9a005c2e.koyeb.app/api/cinesubz/downloadurl?url=${url}&apiKey=d3d7e61cc85c2d70974972ff6d56edfac42932d394f7551207d2f6ca707eda56`;

    const res = await fetch(api);
    const json = await res.json();

    if (!json?.url) return reply("❌ Download link not found or invalid.");

    reply(`📥 *Downloading movie...*\n\n🎬 *Quality:* ${json.quality}\n💾 *Size:* ${json.size}\n\n⚙️ Please wait until upload completes ⏳`);

    // Download the file
    const response = await fetch(json.url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const tempPath = path.join(__dirname, `../temp/czdl_${Date.now()}.mp4`);
    const fileStream = fs.createWriteStream(tempPath);

    await new Promise((resolve, reject) => {
      response.body.pipe(fileStream);
      response.body.on("error", reject);
      fileStream.on("finish", resolve);
    });

    // Send as document (mp4)
    await conn.sendMessage(from, {
      document: fs.readFileSync(tempPath),
      mimetype: "video/mp4",
      fileName: `WhiteShadow_${json.quality || "Movie"}.mp4`,
      caption: `🎬 *Downloaded via WhiteShadow-MD*\n\n⚡ *Source:* CineSubz\n📦 *Size:* ${json.size}`
    }, { quoted: mek });

    fs.unlinkSync(tempPath);

  } catch (e) {
    console.error(e);
    reply("⚠️ Failed to download or send movie file.");
  }
});
