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
}, async (conn, m, mek, { from, q }) => {
    try {
        if (!q) return m.reply("❌ Please provide a YouTube video name or URL!");

        m.reply("⏳ Searching video...");

        let videoUrl = q;

        // If not direct YouTube URL, search
        if (!q.match(/(youtube\.com|youtu\.be)/)) {
            const search = await yts(q);
            if (!search.videos.length) return m.reply("❌ No results found!");
            videoUrl = search.videos[0].url;
        }

        // API call (replace APIKEY)
        const apiUrl = `https://gtech-api-xtp1.onrender.com/api/video/yt?apikey=APIKEY&url=${encodeURIComponent(videoUrl)}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data.status || !data.result?.media) {
            return m.reply("❌ Failed to fetch video!");
        }

        const { title, thumbnail, video_url, video_url_hd, channel, description } = data.result.media;

        // Send info + instructions
        await m.reply(
`🎬 *${title}*
📺 ${channel}
\n${description.substring(0, 200)}...
\nReply:
*1* - HD (1080p)
*2* - SD (720p)`
        );

        // Wait for next message from same user for choice
        conn.on("messages.upsert", async ({ messages }) => {
            let msg = messages[0];
            if (!msg.message || !msg.key.fromMe) return;
            if (msg.key.remoteJid !== from) return;

            let choice = msg.message.conversation?.trim();
            let downloadLink;
            if (choice === "1") downloadLink = video_url_hd;
            else if (choice === "2") downloadLink = video_url;
            else return;

            if (!downloadLink) return m.reply("❌ This quality is not available!");

            await conn.sendMessage(from, {
                video: { url: downloadLink },
                mimetype: "video/mp4",
                caption: `✅ Downloaded: *${title}*`
            }, { quoted: m });
        });

    } catch (error) {
        console.error(error);
        m.reply(`❌ Error: ${error.message}`);
    }
});
