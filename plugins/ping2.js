const config = require('../config');
const { cmd } = require('../command');
const fetch = require("node-fetch");

const fetchBuffer = async (url) => {
    const res = await fetch(url);
    return await res.buffer();
};

cmd({
    pattern: "ping2",
    alias: ["speed2", "pong2"],
    use: '.ping2',
    desc: "Speed test with WhatsApp group style preview",
    category: "main",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, sender }) => {
    try {
        const startTime = Date.now();

        const emojis = ['🔥', '⚡', '🚀', '💨', '🎯', '🎉', '🌟', '💥', '🕐', '🔹', '💎', '🏆', '🎶', '🌠', '🌀', '🔱', '🛡️', '✨'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

        // Speed calculation
        const ping = Date.now() - startTime;

        // Status label
        let badge = '🐢 Slow', color = '🔴';
        if (ping <= 150) {
            badge = '🚀 Super Fast';
            color = '🟢';
        } else if (ping <= 300) {
            badge = '⚡ Fast';
            color = '🟡';
        } else if (ping <= 600) {
            badge = '⚠️ Medium';
            color = '🟠';
        }

        const text = `> *WHITESHADOW-MD ʀᴇsᴘᴏɴsᴇ: ${ping} ms ${randomEmoji}*\n> *sᴛᴀᴛᴜs: ${color} ${badge}*\n> *ᴠᴇʀsɪᴏɴ: ${config.version}*`;

        // Send group style preview with speed result
        await conn.sendMessage(from, {
            text: `Powering Smart Automation\n\n${text}`,
            contextInfo: {
                externalAdReply: {
                    title: "White Shadow ✅", // group name with verified tick
                    body: "Official WhatsApp Group",
                    mediaType: 1,
                    thumbnail: await fetchBuffer("https://files.catbox.moe/fyr37r.jpg"), // group DP
                    renderLargerThumbnail: true,
                    sourceUrl: "https://chat.whatsapp.com/BjdjD499cvGCAWECAskPqY?mode=ac_t" // group link
                },
                mentionedJid: [sender]
            }
        }, { quoted: mek });

    } catch (err) {
        console.error("❌ Error in ping2 command:", err);
        conn.sendMessage(from, { text: `⚠️ Error: ${err.message}` }, { quoted: mek });
    }
});
