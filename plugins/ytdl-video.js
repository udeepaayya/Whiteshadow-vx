const { cmd } = require('../command');
const axios = require('axios');
const yts = require('yt-search');

cmd({
    pattern: "video",
    alias: ["ytvideo", "ytmp4"],
    use: ".video <name or link>",
    react: "🎬",
    desc: "Search or download YouTube videos",
    category: "downloader",
    filename: __filename
},

async (conn, mek, m, { from, q, reply }) => {
try {
    if (!q) return reply('*Please give me a video name or YouTube link!*');

    let url;
    if (q.includes("youtube.com") || q.includes("youtu.be")) {
        url = q.trim();
    } else {
        const search = await yts(q);
        if (!search || !search.videos || search.videos.length < 1)
            return reply("*❌ No results found!*");
        url = search.videos[0].url;
    }

    // ✅ Use Yupra API
    const api = `https://api.yupra.my.id/api/downloader/ytmp4?url=${encodeURIComponent(url)}`;
    console.log("YT API URL:", api);

    const { data } = await axios.get(api);

    if (!data || data.status !== 200 || !data.result) {
        console.log("API RESPONSE:", data);
        return reply("*❌ Failed to fetch video!*");
    }

    const info = data.result;
    const video = info.formats[0]; // default 240p/360p
    const title = info.title;
    const downloadUrl = video.url;
    const quality = video.qualityLabel || "Unknown";
    const duration = Math.round(video.approxDurationMs / 1000) || "N/A";
    const thumb = `https://img.youtube.com/vi/${url.split('v=')[1]}/hqdefault.jpg`;

    // 🖼 Send video info + thumbnail
    await conn.sendMessage(from, {
        image: { url: thumb },
        caption: `🎬 *${title}*\n\n💾 Quality: ${quality}\n⌛ Duration: ${duration}s\n\n⚡ Powered by *WhiteShadow-MD*`
    }, { quoted: mek });

    // 🎥 Send video directly
    await conn.sendMessage(from, {
        video: { url: downloadUrl },
        caption: `▶️ *${title}*`
    }, { quoted: mek });

} catch (e) {
    console.error("PLUGIN ERROR:", e);
    reply("*⚠️ Error fetching video!*");
}
});
