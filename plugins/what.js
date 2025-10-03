const { cmd } = require('../command');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

function getRandom(ext) {
    return `${Math.floor(Math.random() * 10000)}${ext}`;
}

async function uploadToCatbox(filePath) {
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', fs.createReadStream(filePath));

    const res = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: form });
    if (!res.ok) throw new Error(`Catbox upload failed: ${res.status}`);
    const url = await res.text();
    return url;
}

cmd({
    pattern: "whatmusic",
    alias: ["musikapa"],
    react: "🎵",
    desc: "Identify a song from audio/voice message",
    category: "tools",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
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

        // 🔥 Upload to Catbox
        const catboxUrl = await uploadToCatbox(filePath);

        // 🔥 Call Zenzxz whatmusic API
        const resp = await fetch(`https://api.zenzxz.my.id/tools/whatmusic?url=${encodeURIComponent(catboxUrl)}`);
        if (!resp.ok) return reply(`❌ API Error: ${resp.status}`);
        const data = await resp.json();

        if (!data?.status || !data?.title) return reply(data?.error || "Song not found.");

        const { title = '-', artists = '-' } = data;

        let result = `─── 🎶 *Song Recognition* 🎶 ───\n` +
                     `🎼 Title : ${title}\n` +
                     `🎤 Artist: ${artists}\n` +
                     `🔗 Catbox URL: ${catboxUrl}\n` +
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
