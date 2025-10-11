const { cmd } = require('../command');
const config = require('../config');
const fetch = require('node-fetch');
const https = require('https');
const yts = require('yt-search');

function extractYouTubeID(url) {
    const regex = /(?:youtube\.com\/(?:.*v=|.*\/)|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

cmd({
    pattern: "songx",
    alias: ["sx", "playx"],
    react: "🎵",
    desc: "Download song from YouTube using Zenzxz API",
    category: "download",
    use: ".songx <text or YouTube URL>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply("❌ Please provide a YouTube URL or search query!");

        let videoUrl;
        if (q.startsWith("https://")) {
            videoUrl = q;
        } else {
            const search = await yts(q);
            if (!search.videos || search.videos.length === 0)
                return await reply("❌ No results found!");
            videoUrl = search.videos[0].url;
        }

        const api = `https://api.zenzxz.my.id/downloader/ytmp3v2?url=${encodeURIComponent(videoUrl)}`;
        const agent = new https.Agent({ rejectUnauthorized: false }); // SSL verify bypass
        const res = await fetch(api, { agent });
        const data = await res.json();

        if (!data.status) return await reply("❌ Failed to fetch audio!");

        const { title, duration, thumbnail, download_url } = data;

        const caption =
`🍄 *𝚂𝙾𝙽𝙶 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁* 🍄

🎵 *Title:* ${title}
⏳ *Duration:* ${duration ? duration + " sec" : "Unknown"}
🖇 *Source:* YouTube

🔽 *Reply with your choice:*
> 1 *Audio Type* 🎧
> 2 *Document Type* 📁

${config.FOOTER || "WHITESHADOW-MD❤️"}`;

        const sent = await conn.sendMessage(from, { image: { url: thumbnail }, caption }, { quoted: mek });
        const messageID = sent.key.id;

        conn.ev.on('messages.upsert', async (msgUpdate) => {
            try {
                const msgObj = msgUpdate.messages[0];
                if (!msgObj?.message) return;

                const textMsg = msgObj.message.conversation || msgObj.message?.extendedTextMessage?.text;
                const isReply = msgObj?.message?.extendedTextMessage?.contextInfo?.stanzaId === messageID;
                if (!isReply) return;

                const userChoice = textMsg.trim();
                const processing = await conn.sendMessage(from, { text: "⏳ Processing..." }, { quoted: mek });

                if (userChoice === "1") {
                    await conn.sendMessage(from, { audio: { url: download_url }, mimetype: "audio/mpeg" }, { quoted: mek });
                    await conn.sendMessage(from, { text: "✅ *Audio sent successfully!*", edit: processing.key });
                } 
                else if (userChoice === "2") {
                    await conn.sendMessage(from, { document: { url: download_url }, fileName: `${title}.mp3`, mimetype: "audio/mpeg", caption: title }, { quoted: mek });
                    await conn.sendMessage(from, { text: "✅ *Document sent successfully!*", edit: processing.key });
                } 
                else {
                    await reply("❌ Invalid choice! Reply with 1 or 2.");
                }

            } catch (err) {
                console.error(err);
                await reply("⚠️ Error while sending audio!");
            }
        });

    } catch (e) {
        console.error(e);
        await reply(`❌ *Error:* ${e.message}`);
    }
});
