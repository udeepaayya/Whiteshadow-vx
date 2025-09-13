// commands/env.js
const fs = require('fs');
const path = require('path');
const config = require('../config');
const { cmd } = require('../command'); // assumes cmd.ev exists and command registration works like your project

const envPath = path.join(__dirname, "../.env");

function updateEnvVariable(key, value) {
    let env = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
    const regex = new RegExp(`^${key}=.*`, "m");

    if (regex.test(env)) {
        env = env.replace(regex, `${key}=${value}`);
    } else {
        // ensure trailing newline
        if (env.length && env[env.length - 1] !== '\n') env += '\n';
        env += `${key}=${value}\n`;
    }

    fs.writeFileSync(envPath, env, 'utf8');

    // Reload dotenv and config
    require('dotenv').config({ path: envPath });

    // Clear config cache and merge new config values into current config object
    try {
        delete require.cache[require.resolve('../config')];
        const newConfig = require('../config');
        Object.keys(newConfig).forEach(k => { config[k] = newConfig[k]; });
    } catch (e) {
        console.error('Failed to reload config:', e);
    }
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
},
async (conn, mek, m, { from, reply, isOwner, isCreator }) => {
    try {
        // permit either owner flag depending on your framework
        if (!isOwner && !isCreator) return reply("🚫 *Owner Only Command!*");

        // Build menu (you can expand this map/menu as needed)
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

_ʀᴇᴘʟʏ ᴛᴏ ᴛʜɪs ᴍᴇssᴀɢᴇ ᴡɪᴛʜ: 1.2, 2.1, 4.4, ᴇᴛᴄ ᴛᴏ ᴛᴏɢɢʟᴇ_`;

        // fake vCard (preserve style per your request)
        const fakeVCard = {
            key: {
                fromMe: false,
                participant: "0@s.whatsapp.net",
                remoteJid: "status@broadcast"
            },
            message: {
                contactMessage: {
                    displayName: "Whiteshadow Ai",
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;;;\nFN:Whiteshadow Ai\nitem1.TEL;waid=${config.OWNER_NUMBER || '94704896880'}:+${config.OWNER_NUMBER ? config.OWNER_NUMBER.replace(/^/, '') : '94 70 489 6880'}\nitem1.X-ABLabel:Owner\nEND:VCARD`
                }
            }
        };

        // send menu image + caption, quoted as fake vCard (so menu reply will reference that)
        const sent = await conn.sendMessage(from, {
            image: { url: config.MENU_IMAGE_URL || "https://files.catbox.moe/tbdd5d.jpg" },
            caption: menu,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: fakeVCard });

        const messageID = sent.key && sent.key.id ? sent.key.id : (sent.key ? sent.key.id : null);

        // helper: toggle mapping
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

        // event handler - listens for replies quoting our sent message
        const handler = async ({ messages }) => {
            try {
                const incoming = messages[0];
                if (!incoming || !incoming.message) return;

                // get referenced stanzaId (the message we quoted when replying)
                const quoted = incoming.message.extendedTextMessage && incoming.message.extendedTextMessage.contextInfo;
                const quotedId = quoted && (quoted.stanzaId || quoted.id || quoted.quotedMessageId);

                // Some libs store the quoted message id under different keys; also compare remoteJid
                if (!messageID) return; // safety
                if (quotedId && quotedId !== messageID) return;

                // Only accept replies from the same chat and owner
                const senderId = incoming.key && incoming.key.participant ? incoming.key.participant : incoming.key.remoteJid;
                // optional: check sender is owner/creator (some frameworks provide metadata). We'll trust isOwner/isCreator flags earlier.

                const text = incoming.message.conversation ||
                             (incoming.message.extendedTextMessage && incoming.message.extendedTextMessage.text) ||
                             "";

                if (!text) return;

                const key = map[text.trim()];
                if (!key) {
                    // send help text (quote the incoming message)
                    await conn.sendMessage(from, { text: "ʀᴇᴘʟʏ ᴡɪᴛʜ ᴀ valid option like: 1.2, 2.1, 4.4, etc." }, { quoted: incoming });
                    return;
                }

                const res = toggleSetting(key);

                // reply with result and show brief updated value
                await conn.sendMessage(from, { text: res }, { quoted: fakeVCard });

                // Optionally: send updated small status of that specific setting
                await conn.sendMessage(from, {
                    text: `Current value for ${key}: ${isEnabled(config[key]) ? "✅ ON" : "❌ OFF"}`
                }, { quoted: fakeVCard });

                // unregister handler after successful toggle (so it doesn't keep toggling)
                if (cmd && cmd.ev && typeof cmd.ev.off === 'function') {
                    cmd.ev.off("messages.upsert", handler);
                }
            } catch (err) {
                console.error('Env handler error:', err);
            }
        };

        // attach handler and auto-remove after 60s (same behavior as earlier snippet)
        if (cmd && cmd.ev && typeof cmd.ev.on === 'function') {
            cmd.ev.on("messages.upsert", handler);
            setTimeout(() => {
                try { cmd.ev.off("messages.upsert", handler); } catch (e) { /* ignore */ }
            }, 60_000);
        } else {
            // fallback: if no event emitter, inform user
            await conn.sendMessage(from, { text: "⚠️ Env reply-menu not available (cmd.ev missing)." }, { quoted: fakeVCard });
        }

    } catch (error) {
        console.error('Env command error:', error);
        reply && reply(`❌ Error displaying config: ${error.message}`);
    }
});
