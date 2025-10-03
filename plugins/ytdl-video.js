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
        url = q.trim();
    } else {
        let search = await yts(q);
        if (!search || !search.videos || search.videos.length < 1) 
            return reply("*No results found!*");
        url = search.videos[0].url;
    }

    // API URL
    let api = `https://api.zenzxz.my.id/downloader/ytmp4?url=${encodeURIComponent(url)}`;
    console.log("YT API URL:", api);

    let { data } = await axios.get(api).catch(err => {
        console.log("API ERROR:", err.response ? err.response.data : err.message);
        return {};
    });

    if (!data || !data.status) {
        console.log("API RESPONSE:", data);
        return reply("*❌ Failed to fetch video!*");
    }

    let caption = `🎬 *${data.title}*\n⏱ Duration: ${data.duration}s\n📹 Quality: ${data.format}\n\n🔗 ${data.download_url}`;

    // Send thumbnail + details
    await conn.sendMessage(from, { 
        image: { url: data.thumbnail }, 
        caption: caption 
    }, { quoted: mek });

    // Send video directly
    await conn.sendMessage(from, { 
        video: { url: data.download_url }, 
        caption: `▶️ ${data.title}`
    }, { quoted: mek });

} catch (e) {
    console.log("PLUGIN ERROR:", e);
    reply("*⚠️ Error fetching video!*");
}
});
