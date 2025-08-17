const config = require('../config');
const { cmd } = require('../command');
const { runtime } = require('../lib/functions');
const axios = require('axios');

function isEnabled(value) {
    return value && value.toString().toLowerCase() === "true";
}

cmd({
    pattern: "env",
    alias: ["config", "settings"],
    desc: "Show all bot configuration variables (Owner Only)",
    category: "system",
    react: "⚙️",
    filename: __filename
}, 
async (conn, mek, m, { from, reply, isCreator }) => {
    try {
        if (!isCreator) {
            return reply("🚫 *Owner Only Command!* You're not authorized to view bot configurations.");
        }

        let envSettings = `
╭───『 *${config.BOT_NAME} CONFIG* 』───❏
│
├─❏ *🤖 BOT INFO*
│  ├─∘ *Name:* ${config.BOT_NAME}
│  ├─∘ *Prefix:* ${config.PREFIX}
│  ├─∘ *Owner:* ${config.OWNER_NAME}
│  ├─∘ *Number:* ${config.OWNER_NUMBER}
│  └─∘ *Mode:* ${config.MODE.toUpperCase()}
│
├─❏ *⚙️ CORE SETTINGS*
│  ├─∘ *Public Mode:* ${isEnabled(config.PUBLIC_MODE) ? "✅" : "❌"}
│  ├─∘ *Always Online:* ${isEnabled(config.ALWAYS_ONLINE) ? "✅" : "❌"}
│  ├─∘ *Read Msgs:* ${isEnabled(config.READ_MESSAGE) ? "✅" : "❌"}
│  └─∘ *Read Cmds:* ${isEnabled(config.READ_CMD) ? "✅" : "❌"}
│
├─❏ *🔌 AUTOMATION*
│  ├─∘ *Auto Reply:* ${isEnabled(config.AUTO_REPLY) ? "✅" : "❌"}
│  ├─∘ *Auto React:* ${isEnabled(config.AUTO_REACT) ? "✅" : "❌"}
│  ├─∘ *Custom React:* ${isEnabled(config.CUSTOM_REACT) ? "✅" : "❌"}
│  ├─∘ *React Emojis:* ${config.CUSTOM_REACT_EMOJIS}
│  ├─∘ *Auto Sticker:* ${isEnabled(config.AUTO_STICKER) ? "✅" : "❌"}
│  └─∘ *Auto Voice:* ${isEnabled(config.AUTO_VOICE) ? "✅" : "❌"}
│
├─❏ *📢 STATUS SETTINGS*
│  ├─∘ *Status Seen:* ${isEnabled(config.AUTO_STATUS_SEEN) ? "✅" : "❌"}
│  ├─∘ *Status Reply:* ${isEnabled(config.AUTO_STATUS_REPLY) ? "✅" : "❌"}
│  ├─∘ *Status React:* ${isEnabled(config.AUTO_STATUS_REACT) ? "✅" : "❌"}
│  └─∘ *Status Msg:* ${config.AUTO_STATUS_MSG}
│
├─❏ *🛡️ SECURITY*
│  ├─∘ *Anti-Link:* ${isEnabled(config.ANTI_LINK) ? "✅" : "❌"}
│  ├─∘ *Anti-Bad:* ${isEnabled(config.ANTI_BAD) ? "✅" : "❌"}
│  ├─∘ *Anti-VV:* ${isEnabled(config.ANTI_VV) ? "✅" : "❌"}
│  └─∘ *Del Links:* ${isEnabled(config.DELETE_LINKS) ? "✅" : "❌"}
│
├─❏ *🎨 MEDIA*
│  ├─∘ *Alive Img:* ${config.ALIVE_IMG}
│  ├─∘ *Menu Img:* ${config.MENU_IMAGE_URL}
│  ├─∘ *Alive Msg:* ${config.LIVE_MSG}
│  └─∘ *Sticker Pack:* ${config.STICKER_NAME}
│
├─❏ *⏳ MISC*
│  ├─∘ *Auto Typing:* ${isEnabled(config.AUTO_TYPING) ? "✅" : "❌"}
│  ├─∘ *Auto Record:* ${isEnabled(config.AUTO_RECORDING) ? "✅" : "❌"}
│  ├─∘ *Anti-Del Path:* ${config.ANTI_DEL_PATH}
│  └─∘ *Dev Number:* ${config.DEV}
│
╰───『 *${config.DESCRIPTION}* 』───❏
`;

        // fake vCard
        const fakeVCard = {
            key: {
                fromMe: false,
                participant: "0@s.whatsapp.net",
                remoteJid: "status@broadcast"
            },
            message: {
                contactMessage: {
                    displayName: "Whiteshadow Ai",
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;;;\nFN:Whiteshadow Ai\nitem1.TEL;waid=94704896880:+94 70 489 6880\nitem1.X-ABLabel:Owner\nEND:VCARD`
                }
            }
        };

        // send ENV with fake vCard quoted
        await conn.sendMessage(
            from,
            {
                image: { url: config.MENU_IMAGE_URL },
                caption: envSettings,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true
                }
            },
            { quoted: fakeVCard }
        );

        // extra audio
        await conn.sendMessage(
            from,
            {
                audio: { url: 'https://files.catbox.moe/ypnd2c.mp3' },
                mimetype: 'audio/mp4',
                ptt: true
            },
            { quoted: fakeVCard }
        );

    } catch (error) {
        console.error('Env command error:', error);
        reply(`❌ Error displaying config: ${error.message}`);
    }
});
