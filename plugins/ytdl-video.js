const { cmd } = require('../command');
const axios = require('axios');
const yts = require('yt-search');

cmd({
    pattern: "video",
    alias: ["ytvideo", "ytmp4"],
    use: ".video <name or link>",
    react: "🎬",
    desc: "Search YouTube video and download first result",
    category: "downloader",
    filename: __filename
},

async(conn, mek, m, { from, q, reply }) => {
try {
    if (!q) return reply('*Please give me a video name or YouTube link!*');

    let url;
    if (q.includes("youtube.com") || q.includes("youtu.be")) {
        // If direct YouTube link
        url = q;
    } else {
        // If keyword search -> get first result
        let search = await yts(q);
        if (!search || !search.videos || search.videos.length < 1) 
            return reply("*No results found!*");
        url = search.videos[0].url;
    }

    // Call API for download
    let api = `https://api.zenzxz.my.id/downloader/ytmp4?url=${encodeURIComponent(url)}`;
    let { data } = await axios.get(api);

    if (!data || !data.status) return reply("*Failed to fetch video!*");

    let caption = `🎬 *${data.title}*\n⏱ Duration: ${data.duration}s\n📹 Quality: ${data.format}\n\n🔗 ${data.download_url}`;

    await conn.sendMessage(from, { 
        image: { url: data.thumbnail }, 
        caption: caption 
    }, { quoted: mek });

    // Send video file directly
    await conn.sendMessage(from, { 
        video: { url: data.download_url }, 
        caption: `▶️ ${data.title}`
    }, { quoted: mek });

} catch (e) {
    console.log(e);
    reply("*Error fetching video!*");
}
});
