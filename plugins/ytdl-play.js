const { cmd } = require('../command');
const fetch = require('node-fetch');

cmd({
    pattern: "yt2",
    alias: ["play2", "music"],
    react: "🎵",
    desc: "Download audio from YouTube",
    category: "download",
    use: ".yt2 <song name or url>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply("❌ Please provide a song name or YouTube URL!");

        await reply("⏳ Searching and downloading audio...");

        // API Call
        const apiUrl = `https://api.nekolabs.my.id/downloader/youtube/play/v1?q=${encodeURIComponent(q)}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data.status || !data.result) return await reply("❌ Failed to fetch audio!");

        const { title, channel, duration, cover, url } = data.result.metadata;
        const downloadUrl = data.result.downloadUrl;

        // Send song details with cover
        await conn.sendMessage(from, {
            image: { url: cover },
            caption: `🎶 *${title}*\n📺 ${channel}\n⏱️ ${duration}\n🔗 ${url}`
        }, { quoted: mek });

        // Send audio file
        await conn.sendMessage(from, {
            audio: { url: downloadUrl },
            mimetype: 'audio/mpeg',
            ptt: false
        }, { quoted: mek });

        await reply(`✅ *${title}* downloaded successfully!`);

    } catch (error) {
        console.error(error);
        await reply(`❌ Error: ${error.message}`);
    }
});
