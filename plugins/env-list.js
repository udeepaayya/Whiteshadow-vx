// inside your env command file
const fs = require('fs');
const path = require('path');
const config = require('../config');
const { cmd } = require('../command');

const envPath = path.join(__dirname, "../.env");

function updateEnvVariable(key, value) {
    let env = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
    const regex = new RegExp(`^${key}=.*`, "m");

    if (regex.test(env)) env = env.replace(regex, `${key}=${value}`);
    else env += `\n${key}=${value}`;

    fs.writeFileSync(envPath, env, 'utf8');
    require('dotenv').config({ path: envPath });

    delete require.cache[require.resolve('../config')];
    Object.assign(config, require('../config'));
}

function isEnabled(value) {
    return value && value.toString().toLowerCase() === "true";
}

cmd({
    pattern: "env",
    alias: ["config", "settings"],
    desc: "Bot config control panel via reply menu (ENV based)",
    category: "owner",
    react: "⚙️",
    filename: __filename
}, async (conn, mek, m, { from, reply, isOwner, isCreator }) => {
    if (!isOwner && !isCreator) return reply("🚫 *Owner Only Command!*");

    const menu = `┏─〔 *Whiteshadow ENV PANEL* 〕──⊷
┇๏ *1. ᴀᴜᴛᴏ ғᴇᴀᴛᴜʀᴇs*
┇๏ 1.2 - ᴀᴜᴛᴏ_ʀᴇᴀᴄᴛ (${isEnabled(config.AUTO_REACT) ? "✅" : "❌"})
┗──────────────⊷
┏──────────────⊷
┇๏ *2. sᴇᴄᴜʀɪᴛʏ*
┇๏ 2.1 - ᴀɴᴛɪ_ʟɪɴᴋ (${isEnabled(config.ANTI_LINK) ? "✅" : "❌"})
┇๏ 2.2 - ᴀɴᴛɪ_ʙᴀᴅ (${isEnabled(config.ANTI_BAD) ? "✅" : "❌"})
┇๏ 2.3 - ᴅᴇʟᴇᴛᴇ_ʟɪɴᴋs (${isEnabled(config.DELETE_LINKS) ? "✅" : "❌"})
┗──────────────⊷
┏──────────────⊷
┇๏ *3. sᴛᴀᴛᴜs sʏsᴛᴇᴍ*
┇๏ 3.1 - ᴀᴜᴛᴏ_sᴛᴀᴛᴜs_sᴇᴇɴ (${isEnabled(config.AUTO_STATUS_SEEN) ? "✅" : "❌"})
┇๏ 3.2 - ᴀᴜᴛᴏ_sᴛᴀᴛᴜs_ʀᴇᴘʟʏ (${isEnabled(config.AUTO_STATUS_REPLY) ? "✅" : "❌"})
┇๏ 3.3 - ᴀᴜᴛᴏ_sᴛᴀᴛᴜs_ʀᴇᴀᴄᴛ (${isEnabled(config.AUTO_STATUS_REACT) ? "✅" : "❌"})
┗──────────────⊷
┏──────────────⊷
┇๏ *4. ᴄᴏʀᴇ*
┇๏ 4.1 - ᴀʟᴡᴀʏs_ᴏɴʟɪɴᴇ (${isEnabled(config.ALWAYS_ONLINE) ? "✅" : "❌"})
┇๏ 4.2 - ʀᴇᴀᴅ_ᴍᴇssᴀɢᴇ (${isEnabled(config.READ_MESSAGE) ? "✅" : "❌"})
┇๏ 4.3 - ʀᴇᴀᴅ_ᴄᴍᴅ (${isEnabled(config.READ_CMD) ? "✅" : "❌"})
┇๏ 4.4 - ᴘᴜʙʟɪᴄ_ᴍᴏᴅᴇ (${isEnabled(config.PUBLIC_MODE) ? "✅" : "❌"})
┗──────────────⊷
┏──────────────⊷
┇๏ *5. ᴛʏᴘɪɴɢ/ʀᴇᴄᴏʀᴅɪɴɢ*
┇๏ 5.1 - ᴀᴜᴛᴏ_ᴛʏᴘɪɴɢ (${isEnabled(config.AUTO_TYPING) ? "✅" : "❌"})
┇๏ 5.2 - ᴀᴜᴛᴏ_ʀᴇᴄᴏʀᴅɪɴɢ (${isEnabled(config.AUTO_RECORDING) ? "✅" : "❌"})
┗──────────────⊷

_ʀᴇᴘʟʏ ᴛᴏ ᴛᴏɢɢʟᴇ ᴏɴ/ᴏғғ_`;

    const fakeVCard = {
        key: {
            fromMe: false,
            participant: "0@s.whatsapp.net",
            remoteJid: "status@broadcast"
        },
        message: {
            contactMessage: {
                displayName: "Whiteshadow Ai",
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;;;\nFN:Whiteshadow Ai\nitem1.TEL;waid=${config.OWNER_NUMBER}:+${config.OWNER_NUMBER}\nitem1.X-ABLabel:Owner\nEND:VCARD`
            }
        }
    };

    const sent = await conn.sendMessage(from, {
        image: { url: config.MENU_IMAGE_URL || "https://files.catbox.moe/tbdd5d.jpg" },
        caption: menu,
        contextInfo: { mentionedJid: [m.sender], forwardingScore: 999, isForwarded: true }
    }, { quoted: fakeVCard });

    const messageID = sent.key.id;

    const map = {
        "1.2": "AUTO_REACT",
        "2.1": "ANTI_LINK", "2.2": "ANTI_BAD", "2.3": "DELETE_LINKS",
        "3.1": "AUTO_STATUS_SEEN", "3.2": "AUTO_STATUS_REPLY", "3.3": "AUTO_STATUS_REACT",
        "4.1": "ALWAYS_ONLINE", "4.2": "READ_MESSAGE", "4.3": "READ_CMD", "4.4": "PUBLIC_MODE",
        "5.1": "AUTO_TYPING", "5.2": "AUTO_RECORDING"
    };

    const toggleSetting = (key) => {
        const current = isEnabled(config[key]);
        updateEnvVariable(key, current ? "false" : "true");
        return `✅ *${key}* ɪs ɴᴏᴡ sᴇᴛ ᴛᴏ: *${!current ? "ON" : "OFF"}*`;
    };

    const handler = async ({ messages }) => {
        const msg = messages[0];
        if (!msg?.message) return;

        const quoted = msg.message.extendedTextMessage?.contextInfo;
        if (!quoted || quoted.stanzaId !== messageID) return;

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
        const key = map[text.trim()];
        if (!key) return conn.sendMessage(from, { text: "Reply with a valid option like 1.2, 2.1, etc." }, { quoted: msg });

        const res = toggleSetting(key);
        await conn.sendMessage(from, { text: res }, { quoted: fakeVCard });
        conn.ev.off("messages.upsert", handler);
    };

    conn.ev.on("messages.upsert", handler);
    setTimeout(() => conn.ev.off("messages.upsert", handler), 60_000);
});
