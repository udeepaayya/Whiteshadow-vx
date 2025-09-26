const config = require('../config');
const { cmd } = require('../command');

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
            return reply("🚫 *Owner Only!* You are not authorized to view bot configurations.");
        }

        const check = (value) => value && value.toString().toLowerCase() === "true" ? "✅" : "❌";

        let envSettings = `
╭───〔 ⚙️ *${config.BOT_NAME} SETTINGS* 〕───❏
│
├─ 🤖 *BOT INFO*
│   • Name       : ${config.BOT_NAME}
│   • Prefix     : ${config.PREFIX}
│   • Owner      : ${config.OWNER_NAME}
│   • Number     : ${config.OWNER_NUMBER}
│   • Mode       : ${config.MODE.toUpperCase()}
│
├─ ⚡ *CORE SETTINGS*
│   • Public Mode : ${check(config.PUBLIC_MODE)}
│   • Always Online : ${check(config.ALWAYS_ONLINE)}
│   • Read Msgs   : ${check(config.READ_MESSAGE)}
│   • Read Cmds   : ${check(config.READ_CMD)}
│
├─ 🤖 *AUTOMATION*
│   • Auto Reply   : ${check(config.AUTO_REPLY)}
│   • Auto React   : ${check(config.AUTO_REACT)}
│   • Custom React : ${check(config.CUSTOM_REACT)}
│   • React Emojis : ${config.CUSTOM_REACT_EMOJIS}
│   • Auto Sticker : ${check(config.AUTO_STICKER)}
│   • Auto Voice   : ${check(config.AUTO_VOICE)}
│
├─ 📢 *STATUS SETTINGS*
│   • Status Seen  : ${check(config.AUTO_STATUS_SEEN)}
│   • Status Reply : ${check(config.AUTO_STATUS_REPLY)}
│   • Status React : ${check(config.AUTO_STATUS_REACT)}
│   • Status Msg   : ${config.AUTO_STATUS_MSG}
│
├─ 🛡️ *SECURITY*
│   • Anti-Link    : ${check(config.ANTI_LINK)}
│   • Anti-Bad     : ${check(config.ANTI_BAD)}
│   • Anti-VV      : ${check(config.ANTI_VV)}
│   • Delete Links : ${check(config.DELETE_LINKS)}
│
├─ 🎨 *MEDIA*
│   • Alive Img    : ${config.ALIVE_IMG}
│   • Menu Img     : ${config.MENU_IMAGE_URL}
│   • Alive Msg    : ${config.LIVE_MSG}
│   • Sticker Pack : ${config.STICKER_NAME}
│
├─ ⏳ *MISC*
│   • Auto Typing  : ${check(config.AUTO_TYPING)}
│   • Auto Record  : ${check(config.AUTO_RECORDING)}
│   • Anti-Del Path: ${config.ANTI_DEL_PATH}
│   • Dev Number   : ${config.DEV}
│
╰───〔 ${config.DESCRIPTION} 〕───❏
`;

        await conn.sendMessage(
            from,
            {
                image: { url: config.MENU_IMAGE_URL },
                caption: envSettings.trim(),
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true
                }
            },
            { quoted: mek }
        );

        // Optional welcome tone
        await conn.sendMessage(
            from,
            {
                audio: { url: 'https://files.catbox.moe/mpt43m.mp3' },
                mimetype: 'audio/mp4',
                ptt: true
            },
            { quoted: mek }
        );

    } catch (error) {
        console.error('Env command error:', error);
        reply(`❌ Error displaying config: ${error.message}`);
    }
});
