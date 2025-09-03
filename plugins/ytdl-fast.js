
const config = require('../config');
const { cmd } = require('../command');
const { ytsearch } = require('@dark-yasiya/yt-dl.js');
const fetch = require('node-fetch');

// MP4 video download
cmd({ 
    pattern: "mp4", 
    alias: ["video"], 
    react: "🎥", 
    desc: "Download YouTube video", 
    category: "main", 
    use: '.mp4 < Yt url or Name >', 
    filename: __filename 
}, async (conn, mek, m, { from, prefix, quoted, q, reply }) => { 
    try { 
        if (!q) return await reply("Please provide a YouTube URL or video name.");
        
        const yt = await ytsearch(q);
        if (yt.results.length < 1) return reply("No results found!");
        
        let yts = yt.results[0];  
        let apiUrl = `https://apis-keith.vercel.app/download/dlmp4?url=${encodeURIComponent(yts.url)}`;
        
        let response = await fetch(apiUrl);
        let data = await response.json();
        
        if (!data.status || !data.result?.success || !data.result?.data?.downloadUrl) {
            return reply("Failed to fetch the video. Please try again later.");
        }

        let vid = data.result.data;

        let ytmsg = `📹 *Video Downloader*
🎬 *Title:* ${vid.title}
📀 *Format:* ${vid.format}
📡 *Quality:* ${vid.quality}p
⏳ *Duration:* ${vid.duration} sec
🔗 *Link:* ${yts.url}
> Powered By WHITESHADOW-MD 👑️`;

        // Send video directly with caption
        await conn.sendMessage(
            from, 
            { 
                video: { url: vid.downloadUrl }, 
                caption: ytmsg,
                mimetype: "video/mp4",
                thumbnail: await (await fetch(vid.thumbnail)).buffer()
            }, 
            { quoted: mek }
        );

    } catch (e) {
        console.log(e);
        reply("An error occurred. Please try again later.");
    }
});
// MP3 song download 



// 🔹 Unicode / fancy fonts functions
const fonts = [
  text => text.split("").map(c => c ? "𝓂" : c).join(""), // Example fancy
  text => text.split("").map(c => c ? "𝕄" : c).join(""),
  text => text.split("").map(c => c ? "𝔐" : c).join(""),
  text => text.split("").map(c => c ? "Ｍ" : c).join("")
];

function randomFont(text) {
  const fn = fonts[Math.floor(Math.random() * fonts.length)];
  return fn(text);
}

cmd({
  pattern: "song",
  alias: ["play", "mp3"],
  react: "🎶",
  desc: "Download YouTube song (Audio) via izumiii API",
  category: "download",
  use: ".song <query>",
  filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
  try {
    if (!q) return reply("⚠️ Please provide a song name or YouTube link.");

    const apiUrl = `https://izumiiiiiiii.dpdns.org/downloader/play?query=${encodeURIComponent(q)}`;
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (!data?.status || !data?.result?.downloads) {
      return reply("❌ Song not found or API error. Try again later.");
    }

    const meta = data.result.metadata;
    const downloadUrl = data.result.downloads;

    // 🔹 Fetch thumbnail
    let buffer;
    try {
      const thumbRes = await fetch(meta.thumbnail || meta.image);
      buffer = Buffer.from(await thumbRes.arrayBuffer());
    } catch {
      buffer = null;
    }

    // 🔹 Styled boxed caption with random fonts
    const caption = `
╔═══════════════
🎶 ${randomFont("Now Playing")} 🎶
╠═══════════════
🎵 ${randomFont("Title")}: ${meta.title}
👤 ${randomFont("Artist")}: ${meta?.author?.name || "Unknown"}
⏱ ${randomFont("Duration")}: ${meta?.timestamp || "N/A"}
👁 ${randomFont("Views")}: ${meta?.views?.toLocaleString() || "N/A"}
🔗 ${randomFont("Watch on YouTube")}: ${meta.url}
╠═══════════════
⚡ ${randomFont("Powered by Whiteshadow MD")}
╚═══════════════
`;

    // 🔹 Send details card
    await conn.sendMessage(from, {
      image: buffer,
      caption: caption
    }, { quoted: mek });

    // 🔹 Then send audio
    await conn.sendMessage(from, {
      audio: { url: downloadUrl },
      mimetype: "audio/mpeg",
      fileName: `${meta.title.replace(/[\\/:*?"<>|]/g, "").slice(0, 80)}.mp3`
    }, { quoted: mek });

  } catch (err) {
    console.error("song cmd error:", err);
    reply("⚠️ An error occurred while processing your request.");
  }
});
