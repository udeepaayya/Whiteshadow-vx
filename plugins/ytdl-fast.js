const { cmd } = require('../command');
const fetch = require('node-fetch');
const yts = require('yt-search');

cmd({
    pattern: "video2",
    alias: ["ytvideo2", "vid2"],
    react: "🎥",
    desc: "Download YouTube video using GTech API",
    category: "download",
    use: ".video2 <song name or YouTube URL>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply("❌ Please provide a YouTube video name or URL!");

        await reply("⏳ Searching video...");

        let videoUrl = q;

        // Search if not direct URL
        if (!q.match(/(youtube\.com|youtu\.be)/)) {
            const search = await yts(q);
            if (!search.videos.length) return await reply("❌ No results found!");
            videoUrl = search.videos[0].url;
        }

        // API call (replace APIKEY with your key)
        const apiUrl = `https://gtech-api-xtp1.onrender.com/api/video/yt?apikey=APIKEY&url=${encodeURIComponent(videoUrl)}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data.status || !data.result || !data.result.media) {
            return await reply("❌ Failed to fetch video!");
        }

        const { title, thumbnail, video_url, video_url_hd, channel, description } = data.result.media;

        // Send preview with options
        const caption = `🎬 *${title}*\n📺 ${channel}\n\n${description.substring(0, 200)}...\n\nReply:\n*1* - HD (1080p)\n*2* - SD (720p)`;
        const msg = await conn.sendMessage(from, {
            image: { url: thumbnail },
            caption
        }, { quoted: mek });

        // Wait for user reply (1 or 2)
        conn.ev.once('messages.upsert', async ({ messages }) => {
            const selected = messages[0]?.message?.conversation?.trim();
            if (!selected) return;

            let downloadLink;
            if (selected === "1") {
                downloadLink = video_url_hd;
            } else if (selected === "2") {
                downloadLink = video_url;
            } else {
                return await reply("❌ Invalid choice! Reply with 1 (HD) or 2 (SD).");
            }

            await conn.sendMessage(from, {
                video: { url: downloadLink },
                mimetype: "video/mp4",
                caption: `✅ Downloaded: *${title}*`
            }, { quoted: mek });
        });

    } catch (error) {
        console.error(error);
        await reply(`❌ Error: ${error.message}`);
    }
});
