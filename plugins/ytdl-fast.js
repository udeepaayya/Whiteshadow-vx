
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

    let buffer;
    try {
      const thumbRes = await fetch(meta.thumbnail || meta.image);
      buffer = Buffer.from(await thumbRes.arrayBuffer());
    } catch {
      buffer = null;
    }

    // 🔹 Fancy font / Unicode box
    const caption = `
╔═══════════════
🎶 𝓝𝓸𝔀 𝓟𝓵𝓪𝔂𝓲𝓷𝓰 🎶
╠═══════════════
🎵 𝕋𝕚𝕥𝕝𝕖: *${meta.title}*
👤 𝔸𝕣𝕥𝕚𝕤𝕥: *${meta?.author?.name || "Unknown"}*
⏱ 𝔻𝕦𝕣𝕒𝕥𝕚𝕠𝕟: *${meta?.timestamp || "N/A"}*
👁 𝕍𝕚𝕖𝕨𝕤: *${meta?.views?.toLocaleString() || "N/A"}*
🔗 [𝕎𝕒𝕥𝕔𝕙 𝕠𝕟 𝕐𝕋](${meta.url})
╠═══════════════
⚡ 𝓟𝓸𝔀𝓮𝓻𝓮𝓭 𝓫𝔂 *Whiteshadow MD*
╚═══════════════
`;

    // 🔹 Send styled details card
    await conn.sendMessage(from, {
      image: buffer,
      caption: caption
    }, { quoted: mek });

    // 🔹 Then auto-send the audio
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
      
