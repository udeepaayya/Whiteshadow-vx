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
        const status = `
╭───────────────◉
│ *🤖 ${config.BOT_NAME} STATUS*
├───────────────◉
│✨ Bot is Active & Online!
│🧠 Owner: ${config.OWNER_NAME}
│⚡ Version: 4.0.0
│📝 Prefix: [${config.PREFIX}]
│📳 Mode: [${config.MODE}]
│💾 RAM: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${(os.totalmem() / 1024 / 1024).toFixed(2)}MB
│🖥️ Host: ${os.hostname()}
│⌛ Uptime: ${runtime(process.uptime())}
╰────────────────◉
> ${config.DESCRIPTION}

*Reply with:*
1️⃣ Ping
2️⃣ Menu
`;

        await conn.sendMessage(from, {
            image: { url: config.ALIVE_IMG },
            caption: status,
            footer: `© ${config.BOT_NAME} 2025`,
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

        await conn.sendMessage(from, {
            audio: { url: "https://files.catbox.moe/6figid.mp3" },
            mimetype: 'audio/mpeg',
            ptt: false
        }, { quoted: mek });

        // Now await user reply only once, using conn's message listener with a promise
        const filter = (message) => {
            if (!message.message) return false;
            if (message.key.remoteJid !== from) return false;
            if (message.key.fromMe) return false;
            const text = message.message.conversation || message.message.extendedTextMessage?.text || "";
            return ["1", "2"].includes(text.trim());
        };

        const replyMsg = await new Promise((resolve) => {
            const handler = (chatUpdate) => {
                const msg = chatUpdate.messages[0];
                if (filter(msg)) {
                    conn.ev.off('messages.upsert', handler);
                    resolve(msg);
                }
            };
            conn.ev.on('messages.upsert', handler);

            // Timeout after 30 seconds to avoid hanging promise
            setTimeout(() => {
                conn.ev.off('messages.upsert', handler);
                resolve(null);
            }, 30000);
        });

        if (!replyMsg) return; // no reply received in time

        const replyText = (replyMsg.message.conversation || replyMsg.message.extendedTextMessage?.text).trim();

        if (replyText === "1") {
            await conn.sendMessage(from, { text: "⚡ Checking ping..." });
            await conn.sendMessage(from, { text: ".ping" });
        } else if (replyText === "2") {
            await conn.sendMessage(from, { text: "📜 Opening Menu..." });
            await conn.sendMessage(from, { text: ".menu" });
        }

    } catch (e) {
        console.error("Alive Error:", e);
        reply(`❌ Error: ${e.message}`);
    }
});
