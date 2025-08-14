const { cmd } = require('../command');
const yts = require('yt-search');
const fetch = require('node-fetch');

cmd({
    pattern: "ytmp4x",
    alias: ["videox"],
    desc: "Download YouTube videos with reply choice system.",
    react: "🎥",
    category: "download",
    filename: __filename
},
async (conn, mek, m, {
    from, q, pushname, reply
}) => {
    try {
        if (!q) {
            return reply("❌ *Please provide a YouTube link or search title!*\n\n_Example:_ `.darama Believer`");
        }

        // Search video
        const search = await yts(q);
        if (!search.videos || search.videos.length === 0) {
            return reply("⚠️ *No matching videos found!*");
        }

        const data = search.videos[0];
        const url = data.url;

        // Send details
        let caption = `
╭───────────────⭓
│   *🎥 VIDEO FOUND 🎥*
│───────────────
│ *📌 Title:* ${data.title}
│ *⏳ Duration:* ${data.timestamp}
│ *👁 Views:* ${data.views}
│ *📅 Uploaded:* ${data.ago}
│ *🔗 Link:* ${data.url}
╰───────────────⭓

💬 *Reply with:*
1️⃣ for Video
2️⃣ for Document
        `;

        await conn.sendMessage(from, { image: { url: data.thumbnail }, caption }, { quoted: mek });

        // Wait for user reply
        const choice = await new Promise((resolve) => {
            conn.ev.on('messages.upsert', function onMessage(u) {
                const msg = u.messages[0];
                if (!msg.key.fromMe && msg.key.remoteJid === from && msg.message?.conversation) {
                    const text = msg.message.conversation.trim();
                    if (text === "1" || text === "2") {
                        conn.ev.off('messages.upsert', onMessage);
                        resolve(text);
                    }
                }
            });
        });

        // Download from API
        const apiUrl = `https://api.giftedtech.web.id/api/download/dlmp4?apikey=gifted&url=${encodeURIComponent(url)}`;
        const res = await fetch(apiUrl);
        const json = await res.json();

        if (!json.success || !json.result?.download_url) {
            return reply("❌ *Video download failed! Try again later.*");
        }

        // Send in selected format
        if (choice === "1") {
            await conn.sendMessage(from, {
                video: { url: json.result.download_url },
                mimetype: "video/mp4",
                caption: `✅ *Here’s your video!*\n\n> _WHITESHADOW-MD Official Drop_`
            }, { quoted: mek });
        } else if (choice === "2") {
            await conn.sendMessage(from, {
                document: { url: json.result.download_url },
                mimetype: "video/mp4",
                fileName: `${json.result.title || "video"}.mp4`,
                caption: "*© WHITESHADOW-MD*"
            }, { quoted: mek });
        }

    } catch (err) {
        console.error(err);
        reply(`⚠️ _Hi ${pushname}, an error occurred. Please try again later._`);
    }
});
