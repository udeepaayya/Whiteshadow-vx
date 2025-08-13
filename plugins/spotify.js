const { cmd } = require('../command');
const fetch = require('node-fetch');
const yts = require('yt-search');

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
        const spotifyUrl = q.replace("--ptt", "").replace("-ptt", "").trim();

        await reply("⏳ Processing your track...");

        // 1️⃣ Extract track name from Spotify URL metadata
        let trackName = spotifyUrl.split("/track/")[1]?.split("?")[0] || spotifyUrl;
        trackName = decodeURIComponent(trackName);

        // Optional: You can use Spotify API to get proper track name, artist, etc.
        // Fallback: use URL segment or user-provided query
        console.log("Track search query:", trackName);

        // 2️⃣ Search YouTube
        const search = await yts(trackName);
        if (!search.videos.length) return await reply("❌ No results found on YouTube!");
        const video = search.videos[0];

        await reply("⏳ Downloading audio from YouTube...");

        // 3️⃣ Download audio via API
        const apiUrl = `https://api.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(video.url)}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data.success) return await reply("❌ Failed to download audio from YouTube!");

        // 4️⃣ Send audio to WhatsApp
        await conn.sendMessage(from, {
            audio: { url: data.result.download_url },
            mimetype: 'audio/mpeg',
            ptt: isPTT,
            fileName: `${video.title}.mp3`,
            contextInfo: {
                forwardingScore: 9999,
                isForwarded: true,
                externalAdReply: {
                    title: `Spotify Downloader`,
                    body: `${video.title} | ${video.author.name}\nPowered by WHITESHADOW MD`,
                    mediaType: 1,
                    previewType: 0,
                    renderLargerThumbnail: true,
                    thumbnailUrl: video.thumbnail,
                    sourceUrl: video.url
                }
            }
        }, { quoted: mek });

        await reply(`✅ *${video.title}* downloaded successfully!${isPTT ? " (PTT Voice)" : ""}`);

    } catch (error) {
        console.error(error);
        await reply(`❌ Error: ${error.message}`);
    }
});
