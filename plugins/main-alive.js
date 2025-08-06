const axios = require("axios");
const { cmd } = require('../command');
const os = require("os");
const { runtime } = require('../lib/functions');
const config = require('../config');

cmd({
    pattern: "alive",
    alias: ["status", "online", "a"],
    desc: "Check bot is alive or not",
    category: "main",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        // 1️⃣ - Download the video
        const videoUrl = "https://files.catbox.moe/h6d32b.mp4"; // must be square + audio
        const response = await axios.get(videoUrl, { responseType: "arraybuffer" });
        const videoBuffer = Buffer.from(response.data, "binary");

        // 2️⃣ - Send the circular video note
        await conn.sendMessage(from, {
            video: videoBuffer,
            mimetype: "video/mp4",
            ptt: true  // ✅ This makes it a video note (circular)
        }, { quoted: mek });

        // 3️⃣ - Send the alive message afterward
        const status = `
╭───〔 *🤖 ${config.BOT_NAME} STATUS* 〕───◉
│✨ *Bot is Active & Online!*
│🧠 *Owner:* ${config.OWNER_NAME}
│⚡ *Version:* 4.0.0
│📝 *Prefix:* [${config.PREFIX}]
│📳 *Mode:* [${config.MODE}]
│💾 *RAM:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${(os.totalmem() / 1024 / 1024).toFixed(2)}MB
│🖥️ *Host:* ${os.hostname()}
│⌛ *Uptime:* ${runtime(process.uptime())}
╰────────────────────◉
> ${config.DESCRIPTION}`;

        await conn.sendMessage(from, {
            image: { url: config.ALIVE_IMG },
            caption: status
        }, { quoted: mek });

    } catch (err) {
        console.error(err);
        reply("❌ Error sending video note.");
    }
});
