const { cmd } = require('../command');
const DY_SCRAP = require('@dark-yasiya/scrap');
const dy_scrap = new DY_SCRAP();
const fetch = require('node-fetch');

function replaceYouTubeID(url) {
    const regex = /(?:youtube\.com\/(?:.*v=|.*\/)|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

// Dummy Spotify metadata extractor (or use Spotify API if available)
async function getSpotifyTrackName(spotifyUrl) {
    try {
        const trackId = spotifyUrl.split("/track/")[1]?.split("?")[0];
        return decodeURIComponent(trackId || spotifyUrl);
    } catch { return spotifyUrl; }
}

cmd({
    pattern: "spotifydl",
    alias: ["spotify", "spt"],
    react: "🎧",
    desc: "Download audio from Spotify track URL (YouTube fallback)",
    category: "download",
    use: ".spotifydl <Spotify URL> [--ptt]",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply("❌ Please provide a Spotify track URL!");
        const isPTT = q.includes("--ptt") || q.includes("-ptt");
        const input = q.replace("--ptt","").replace("-ptt","").trim();

        // 1️⃣ Extract track name from Spotify URL
        const trackName = await getSpotifyTrackName(input);

        // 2️⃣ Search YouTube
        const searchResults = await dy_scrap.ytsearch(trackName);
        if (!searchResults?.results?.length) return await reply("❌ No results found on YouTube!");
        const video = searchResults.results[0];
        const videoUrl = `https://youtube.com/watch?v=${video.videoId}`;

        let info = `🍄 *SPOTIFY → YOUTUBE DOWNLOADER* 🍄\n\n` +
            `🎵 *Title:* ${video.title || "Unknown"}\n` +
            `⏳ *Duration:* ${video.timestamp || "Unknown"}\n` +
            `👀 *Views:* ${video.views || "Unknown"}\n` +
            `🌏 *Release Ago:* ${video.ago || "Unknown"}\n` +
            `👤 *Author:* ${video.author?.name || "Unknown"}\n` +
            `🖇 *Url:* ${videoUrl || "Unknown"}\n\n` +
            `🔽 Reply with your choice:\n> 1 Audio 🎵\n> 2 Document 📁\n\n` +
            `${config.FOOTER || "Powered by WHITESHADOW MD ❤️"}`;

        const sentMsg = await conn.sendMessage(from, { image: { url: video.image }, caption: info }, { quoted: mek });
        const messageID = sentMsg.key.id;
        await conn.sendMessage(from, { react: { text: '🎶', key: sentMsg.key } });

        // 3️⃣ Listen for user reply
        const handler = async (messageUpdate) => {
            try {
                const mekInfo = messageUpdate?.messages[0];
                if (!mekInfo?.message) return;

                const messageType = mekInfo?.message?.conversation || mekInfo?.message?.extendedTextMessage?.text;
                const isReplyToSentMsg = mekInfo?.message?.extendedTextMessage?.contextInfo?.stanzaId === messageID;
                if (!isReplyToSentMsg) return;

                let userReply = messageType.trim();
                let type;

                // Download audio
                const audioData = await dy_scrap.ytmp3(videoUrl);
                const downloadUrl = audioData?.result?.download?.url;
                if (!downloadUrl) return await reply("❌ Download link not found!");

                if (userReply === "1") {
                    type = { audio: { url: downloadUrl }, mimetype: "audio/mpeg", ptt: isPTT };
                } else if (userReply === "2") {
                    type = { document: { url: downloadUrl, fileName: `${video.title}.mp3`, mimetype: "audio/mpeg", caption: video.title } };
                } else {
                    return await reply("❌ Invalid choice! Reply with 1 or 2.");
                }

                await conn.sendMessage(from, type, { quoted: mek });
                await conn.sendMessage(from, { text: '✅ Media Upload Successful ✅', edit: sentMsg.key });
                conn.ev.off('messages.upsert', handler); // remove listener

            } catch (err) {
                console.error(err);
                await reply(`❌ Error processing reply: ${err.message || "Error!"}`);
            }
        };

        conn.ev.on('messages.upsert', handler);

    } catch (error) {
        console.error(error);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        await reply(`❌ Error: ${error.message || "Error!"}`);
    }
});
