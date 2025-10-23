const { cmd } = require('../command');
const config = require('../config');
const fetch = require('node-fetch');
const https = require('https');
const yts = require('yt-search');

// YouTube ID extract function
function extractYouTubeID(url) {
    const regex = /(?:youtube\.com\/(?:.*v=|.*\/)|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

cmd({
    pattern: "songx",
    alias: ["sx", "playx"],
    react: "🎵",
    desc: "YouTube ගීත ඩවුන්ලෝඩ් කරන්න (Koyeb API සමඟ)",
    category: "download",
    use: ".songx <text or YouTube URL>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply("❌ YouTube URL එකක් හෝ search query එකක් දීන්න!");

        let videoUrl;
        let videoTitle;

        // Search හෝ direct URL
        if (q.startsWith("https://")) {
            videoUrl = q;
            videoTitle = q; // නැතිනම් later replace කරන්න
        } else {
            const search = await yts(q);
            if (!search.videos || search.videos.length === 0)
                return await reply("❌ Results එකක් හමුවුණේ නැහැ!");
            videoUrl = search.videos[0].url;
            videoTitle = search.videos[0].title;
        }

        const videoID = extractYouTubeID(videoUrl);
        const thumbnail = videoID ? `https://img.youtube.com/vi/${videoID}/hqdefault.jpg` : null;

        // Koyeb API call
        const api = `https://foreign-marna-sithaunarathnapromax-9a005c2e.koyeb.app/api/ytapi?url=${encodeURIComponent(videoUrl)}&fo=2&qu=144&apiKey=d3d7e61cc85c2d70974972ff6d56edfac42932d394f7551207d2f6ca707eda56`;
        const agent = new https.Agent({ rejectUnauthorized: false });
        const res = await fetch(api, { agent });
        const data = await res.json();

        if (!data.downloadData || !data.downloadData.url)
            return await reply("❌ Audio එක ලබාගන්න බැරිවිය!");

        const download_url = data.downloadData.url;
        const title = videoTitle.length > 40 ? videoTitle.slice(0, 40) + "..." : videoTitle;

        const caption =
`🍄 *ගීත ඩවුන්ලෝඩර්* 🍄

🎵 *Title:* ${title}
🖇 *Source:* YouTube

🔽 *Reply කරන්න:*
> 1 *Audio Type* 🎧
> 2 *Document Type* 📁

${config.FOOTER || "WHITESHADOW-MD❤️"}`;

        const sent = await conn.sendMessage(from, { image: { url: thumbnail }, caption }, { quoted: mek });
        const messageID = sent.key.id;

        // Reply listener
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
                    await conn.sendMessage(from, { text: "✅ *Audio සාර්ථකව යවා ඇත!*", edit: processing.key });
                } 
                else if (userChoice === "2") {
                    await conn.sendMessage(from, { document: { url: download_url }, fileName: `${title}.mp3`, mimetype: "audio/mpeg", caption: title }, { quoted: mek });
                    await conn.sendMessage(from, { text: "✅ *Document සාර්ථකව යවා ඇත!*", edit: processing.key });
                } 
                else {
                    await reply("❌ වැරදි choice එකක්! 1 හෝ 2 reply කරන්න.");
                }

            } catch (err) {
                console.error(err);
                await reply("⚠️ Audio යැවීමේදී error එකක් සිදු විය!");
            }
        });

    } catch (e) {
        console.error(e);
        await reply(`❌ *Error:* ${e.message}`);
    }
});
