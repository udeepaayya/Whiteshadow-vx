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
        const videoUrl = 'https://files.catbox.moe/h6d32b.mp4';

        // 📦 Download from URL
        const response = await axios.get(videoUrl, { responseType: 'arraybuffer' });
        const videoBuffer = Buffer.from(response.data, 'binary');

        // 🎥 Send as a round video note
        await conn.sendMessage(from, {
            video: videoBuffer,
            mimetype: 'video/mp4',
            ptt: true,          // makes it round-style
            gifPlayback: true   // optional playback hint
        }, { quoted: mek });

        // 🧾 Build status message
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

        // 🖼️ Send status image + caption
        await conn.sendMessage(from, {
            image: { url: config.ALIVE_IMG },
            caption: status,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 1000,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363317972190466@newsletter',
                    newsletterName: '👾ᏔᎻᎥᏆᎬՏᎻᎪᎠᎾᏇ ᎷᎠ👾',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Alive Error:", e);
        reply(`Error occurred: ${e.message}`);
    }
});
