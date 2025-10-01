const { cmd } = require('../command');
const config = require('../config');

cmd({
    pattern: "owner",
    react: "✅", 
    desc: "Get owner number",
    category: "main",
    filename: __filename
}, 
async (conn, mek, m, { from, reply }) => {
    try {
        const ownerNumber = config.OWNER_NUMBER;
        const ownerName = config.OWNER_NAME;

        const vcard = 'BEGIN:VCARD\n' +
                      'VERSION:3.0\n' +
                      `FN:${ownerName}\n` +  
                      `TEL;type=CELL;type=VOICE;waid=${ownerNumber.replace('+', '')}:${ownerNumber}\n` + 
                      'END:VCARD';

        // 1. Send Video Note (Circular video)
        await conn.sendMessage(from, {
            video: { url: "https://files.catbox.moe/9q44qm.mp4" }, 
            mimetype: "video/mp4",
            ptv: true
        }, { quoted: mek });

        // 2. Send Owner vCard
        await conn.sendMessage(from, {
            contacts: {
                displayName: ownerName,
                contacts: [{ vcard }]
            }
        }, { quoted: mek });

        // 3. Send Image + Caption card
        await conn.sendMessage(from, {
            image: { url: 'https://files.catbox.moe/fyr37r.jpg' }, 
            caption: `╭━━〔 *WHITESHADOW-MD* 〕━━┈⊷
┃◈╭─────────────·๏
┃◈┃• *Here is the owner details*
┃◈┃• *Name* - ${ownerName}
┃◈┃• *Number* ${ownerNumber}
┃◈┃• *Version*: 2.0.0 Beta
┃◈└───────────┈⊷
╰──────────────┈⊷
> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ WHITESHADOW-MD`,
            contextInfo: {
                mentionedJid: [`${ownerNumber.replace('+', '')}@s.whatsapp.net`],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363397446799567@newsletter',
                    newsletterName: 'WHITESHADOW-MD',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

        // 4. Send Voice (PTT)
        await conn.sendMessage(from, {
            audio: { url: 'https://files.catbox.moe/mpt43m.mp3' },
            mimetype: 'audio/mp4',
            ptt: true
        }, { quoted: mek });

    } catch (error) {
        console.error(error);
        reply(`❌ Error: ${error.message}`);
    }
});
