const axios = require('axios');
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
async (conn, mek, m, { from, sender, reply }) => {
    try {
        // 🔗 Video URL (must be under 16s, square, with audio)
        const videoUrl = 'https://files.catbox.moe/h6d32b.mp4';

        // ⬇️ Download video as buffer
        const response = await axios.get(videoUrl, { responseType: 'arraybuffer' });
        const videoBuffer = Buffer.from(response.data, 'binary');

        // 🌀 Send video as round "video note"
        await conn.sendMessage(from, {
            video: videoBuffer,
            mimetype: 'video/mp4',
            ptt: true // 👈 this is what makes it a video note (round)
        }, { quoted: mek });

        // 🧾 After that, send caption message
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

    } catch (e) {
        console.error("Alive Error:", e);
        reply(`❌ Error: ${e.message}`);
    }
});
