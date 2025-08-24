import { cmd } from '../command.js';
import axios from 'axios';

// Temp store for chat pending video selection
const pendingVideos = {};

cmd({
    pattern: "videox",
    desc: "Download YouTube video with selectable quality",
    category: "media",
}, async (conn, mek, m, { reply }) => {
    try {
        const url = m.text.split(" ")[1];
        if (!url) return reply("❌ Please provide a YouTube link!");

        // Get video info (API call)
        const apiRes = await axios.get(`https://api.agatz.xyz/api/ytinfo?url=${encodeURIComponent(url)}`);
        const data = apiRes.data;

        // Save pending chat info
        pendingVideos[m.chat] = {
            videoId: data.id,
            qualities: data.qualities // array like ['360p','480p','720p','1080p']
        };

        // Build caption
        let caption = `🎬 *${data.title}*\n\n${data.description}\n\nSelect quality:\n`;
        data.qualities.forEach((q, i) => {
            caption += `${i+1}. ${q}\n`;
        });
        caption += `\nPowered by WHITESHADOW MD 👑️`;

        // Send thumbnail + caption
        await conn.sendFile(m.chat, data.thumbnail, "thumb.jpg", caption, m);
    } catch (e) {
        console.log(e);
        reply("❌ Failed to fetch video info.");
    }
});

// Listen for replies for quality selection
cmd({
    pattern: ".*",
    desc: "Catch quality selection",
    category: "media",
}, async (conn, mek, m, { reply }) => {
    const chatPending = pendingVideos[m.chat];
    if (!chatPending) return; // no pending video

    const choice = parseInt(m.text);
    if (!choice || choice < 1 || choice > chatPending.qualities.length) return;

    const selectedQuality = chatPending.qualities[choice-1];

    // Download URL API (example)
    const videoRes = await axios.get(`https://api.agatz.xyz/api/ytmp4?url=https://youtu.be/${chatPending.videoId}&quality=${selectedQuality}`);
    const videoUrl = videoRes.data.url;

    // Send video with caption
    await conn.sendFile(m.chat, videoUrl, `${chatPending.videoId}.mp4`, `🎬 Video in ${selectedQuality}\nPowered by WHITESHADOW MD 👑️`, m);

    // Remove pending
    delete pendingVideos[m.chat];
});
