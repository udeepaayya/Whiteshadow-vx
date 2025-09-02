
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
  desc: "Download YouTube song (Audio)",
  category: "download",
  use: ".song <query>",
  filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
  try {
    if (!q) return reply("⚠️ Please provide a song name or YouTube link.");

    const apiUrl = `https://izumiiiiiiii.dpdns.org/downloader/play?query=${encodeURIComponent(q)}`;
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (!data.status || !data.result?.downloads) {
      return reply("❌ Song not found or API error.");
    }

    const song = data.result.metadata;
    const downloadUrl = data.result.downloads;

    await conn.sendMessage(from, {
      audio: { url: downloadUrl },
      mimetype: "audio/mpeg",
      fileName: `${song.title}.mp3`,
      contextInfo: {
        externalAdReply: {
          title: song.title.length > 25 ? song.title.substring(0, 22) + "..." : song.title,
          body: `🎤 ${song.author?.name || "Unknown"} • ⏱ ${song.timestamp}`,
          thumbnailUrl: song.thumbnail,
          sourceUrl: song.url,
          mediaUrl: song.url,
          mediaType: 1,
          showAdAttribution: true,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: mek });

  } catch (err) {
    console.error(err);
    reply("⚠️ An error occurred while processing your request.");
  }
});
