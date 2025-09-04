const { cmd } = require('../command');
const yts = require('yt-search');
const fetch = require('node-fetch');

cmd({
    pattern: "ytmp4x",
    alias: ["videox"],
    desc: "Download YouTube videos with quality choice.",
    react: "🎥",
    category: "download",
    filename: __filename
},
async (conn, mek, m, { from, q, pushname, reply }) => {
    try {
        if (!q) return reply("❌ *Please provide a YouTube link or search title!*\n\n_Example:_ `.ytmp4x Believer`");

        // Search YouTube
        const search = await yts(q);
        if (!search.videos || search.videos.length === 0) return reply("⚠️ *No matching videos found!*");

        const data = search.videos[0];
        const url = data.url;

        // First API Call
        const apiUrl = `https://www.dark-yasiya-api.site/download/ytmp4?url=${encodeURIComponent(url)}&quality=360`;
        const res = await fetch(apiUrl);
        const json = await res.json();

        if (!json.status || !json.result) return reply("❌ *Video download failed! Try again later.*");

        const video = json.result.data;
        const qualities = json.result.download.availableQuality;

        // Send details
        let caption = `
╭───────────────⭓
│   *🎥 VIDEO FOUND 🎥*
│───────────────
│ *📌 Title:* ${video.title}
│ *⏳ Duration:* ${video.timestamp}
│ *👁 Views:* ${video.views}
│ *📅 Uploaded:* ${video.ago}
│ *🔗 Link:* ${video.url}
╰───────────────⭓

💬 *Reply with a number to choose quality:*
${qualities.map((q, i) => `${i + 1}️⃣ ${q}p`).join("\n")}
        `;

        await conn.sendMessage(from, { image: { url: video.thumbnail }, caption }, { quoted: mek });

        // Wait for reply
        const choice = await new Promise((resolve) => {
            conn.ev.on('messages.upsert', function onMessage(u) {
                const msg = u.messages[0];
                if (!msg.key.fromMe && msg.key.remoteJid === from && msg.message?.conversation) {
                    const text = msg.message.conversation.trim();
                    const index = parseInt(text);
                    if (index >= 1 && index <= qualities.length) {
                        conn.ev.off('messages.upsert', onMessage);
                        resolve(qualities[index - 1]);
                    }
                }
            });
        });

        // API Call with selected quality
        const dlUrl = `https://www.dark-yasiya-api.site/download/ytmp4?url=${encodeURIComponent(url)}&quality=${choice}`;
        const dlRes = await fetch(dlUrl);
        const dlJson = await dlRes.json();

        if (!dlJson.status || !dlJson.result?.download?.url) {
            return reply("❌ *Download link not available for that quality.*");
        }

        const fileUrl = dlJson.result.download.url;
        const filename = dlJson.result.download.filename || `${video.title}.mp4`;

        // Send video
        await conn.sendMessage(from, {
            video: { url: fileUrl },
            mimetype: "video/mp4",
            fileName: filename,
            caption: `✅ *Here’s your video in ${choice}p!*\n\n> _WHITESHADOW-MD Official Drop_`
        }, { quoted: mek });

    } catch (err) {
        console.error(err);
        reply(`⚠️ _Hi ${pushname}, an error occurred. Please try again later._`);
    }
});
