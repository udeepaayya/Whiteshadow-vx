const { cmd } = require('../command');
const os = require("os");
const { runtime } = require('../lib/functions');
const config = require('../config');
const axios = require("axios");

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
        // ================== Fake Contact Card ==================
        const number = "94704896880";
        const jid = number + "@s.whatsapp.net";

        let thumb = Buffer.from([]);
        try {
            const ppUrl = await conn.profilePictureUrl(jid, "image");
            const ppResp = await axios.get(ppUrl, { responseType: "arraybuffer" });
            thumb = Buffer.from(ppResp.data, "binary");
        } catch (err) {
            console.log("❗ Couldn't fetch profile picture:", err.message);
        }

        const contactCard = {
            key: {
                fromMe: false,
                participant: '0@s.whatsapp.net',
                remoteJid: "status@broadcast"
            },
            message: {
                contactMessage: {
                    displayName: "WHITESHADOW AI ✨",
                    vcard: `BEGIN:VCARD
VERSION:3.0
FN:WHITESHADOW AI ✨
ORG:WHITESHADOW
TEL;type=CELL;type=VOICE;waid=${number}:+94 70 489 6880
END:VCARD`,
                    jpegThumbnail: thumb
                }
            }
        };
        // =======================================================

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

        // 1. Send Video Note first
        await conn.sendMessage(from, {
            video: { url: "https://files.catbox.moe/hlhmjs.mp4" },
            mimetype: "video/mp4",
            ptv: true
        }, { quoted: mek });

        // 2. Alive Image + Status (quoted by contact card)
        await conn.sendMessage(from, {
            image: { url: config.ALIVE_IMG },
            caption: status,
            footer: `© ${config.BOT_NAME} 2025`,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 1000,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363397446799567@newsletter',
                    newsletterName: '👾ᏔᎻᎥᏆᎬՏᎻᎪᎠᎾᏇ ᎷᎠ👾',
                    serverMessageId: 143
                }
            }
        }, { quoted: contactCard });

        // 3. Send Voice/Audio (same style as before)
        await conn.sendMessage(from, {
            audio: { url: "https://files.catbox.moe/6figid.mp3" },
            mimetype: 'audio/mpeg',
            ptt: false
        }, { quoted: contactCard });

        // (Optional: reply filter system 그대로 තියාගන්න)
    } catch (err) {
        console.error("Alive cmd error:", err.message);
        reply(`❌ Error: ${err.message}`);
    }
});
