
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
    desc: "Download YouTube song", 
    category: "main", 
    use: '.song <query>', 
    filename: __filename 
}, async (conn, mek, m, { from, sender, reply, q }) => { 
    try {
        if (!q) return reply("Please provide a song name or YouTube link.");

        const yt = await ytsearch(q);
        if (!yt.results.length) return reply("No results found!");

        const song = yt.results[0];
        const apiUrl = `https://apis.davidcyriltech.my.id/youtube/mp3?url=${encodeURIComponent(song.url)}`;
        
        const res = await fetch(apiUrl);
        const data = await res.json();

        if (!data?.result?.downloadUrl) return reply("Download failed. Try again later.");

    await conn.sendMessage(from, {
    audio: { url: data.result.downloadUrl },
    mimetype: "audio/mpeg",
    fileName: `${song.title}.mp3`,
    contextInfo: {
        externalAdReply: {
            title: song.title.length > 25 ? `${song.title.substring(0, 22)}...` : song.title,
            body: "Join our WhatsApp Channel",
            mediaType: 1,
            thumbnailUrl: song.thumbnail.replace('default.jpg', 'hqdefault.jpg'),
            sourceUrl: 'https://whatsapp.com/channel/0029Vak4dFAHQbSBzyxlGG13',
            mediaUrl: 'https://whatsapp.com/channel/0029Vak4dFAHQbSBzyxlGG13',
            showAdAttribution: true,
            renderLargerThumbnail: true
        }
    }
}, { quoted: mek });

    } catch (error) {
        console.error(error);
        reply("An error occurred. Please try again.");
    }
});
