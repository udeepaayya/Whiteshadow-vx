/*
* Nama Fitur : Whatmusic
* Type       : Plugin CMD (WHITESHADOW-MD)
* Author     : Agas (Converted by WhiteShadow)
* Desc       : Identify song from audio/voice note
*/

const { cmd } = require('../command');
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// 🔐 Fix SSL certificate issue
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

async function uploadToUguu(filePath) {
    const form = new FormData();
    form.append('files[]', fs.createReadStream(filePath));
    const res = await fetch('https://uguu.se/upload.php', { method: 'POST', body: form });
    if (!res.ok) throw new Error(`Uguu upload failed: ${res.status}`);
    const json = await res.json();
    if (!json.files?.[0]?.url) throw new Error('Uguu response invalid');
    return json.files[0].url;
}

cmd({
    pattern: "whatmusic",
    alias: ["musikapa"],
    react: "🎵",
    desc: "Identify a song from audio/voice message",
    category: "tools",
    filename: __filename
}, 

async (conn, mek, m, { from, q, reply }) => {
    let filePath;
    try {
        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        let qmsg = m.quoted ? m.quoted : m;
        let mime = (qmsg.msg || qmsg).mimetype || '';

        if (!mime || !mime.includes('audio')) {
            return reply(`*Reply to an audio/voice note with .whatmusic*`);
        }

        let media = await qmsg.download();
        if (!media || media.length === 0) return reply("❌ Failed to download audio.");

        filePath = path.join(__dirname, '../tmp/', getRandom('.mp3'));
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, media);

        const fileUrl = await uploadToUguu(filePath);

        const resp = await fetch(`https://api.deline.my.id/tools/whatmusic?url=${encodeURIComponent(fileUrl)}`);
        if (!resp.ok) return reply(`❌ API Error: ${resp.status}`);
        const data = await resp.json();

        if (!data?.status || !data?.result) return reply(data?.error || "Song not found.");

        const { title = '-', artists = '-' } = data.result;

        let result = `─── 🎶 *Song Recognition* 🎶 ───\n` +
                     `🎼 Title : ${title}\n` +
                     `🎤 Artist: ${artists}\n` +
                     `──────────────────────────`;

        await conn.sendMessage(from, { text: result }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (e) {
        console.log("WHATMUSIC ERROR:", e);
        reply(`❌ Error: ${e.message || e}`);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
    } finally {
        if (filePath) { try { fs.unlinkSync(filePath) } catch {} }
    }
});

function getRandom(ext) {
    return `${Math.floor(Math.random() * 10000)}${ext}`;
}
