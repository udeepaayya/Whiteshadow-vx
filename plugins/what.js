const { cmd } = require('../command');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');
const yts = require('yt-search');

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

async function fetchThumbnail(title) {
    try {
        const r = await yts(title);
        const vid = r.videos.length > 0 ? r.videos[0] : null;
        if (vid) return vid.thumbnail;
        return 'https://i.ibb.co/0t9y7jk/music.png'; // default
    } catch {
        return 'https://i.ibb.co/0t9y7jk/music.png';
    }
}

cmd({
    pattern: "whatmusic",
    alias: ["whatsong"],
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

        // Upload to Catbox
        const catboxUrl = await uploadToCatbox(filePath);

        // Call Zenzzx API
        const resp = await fetch(`https://api.zenzxz.my.id/tools/whatmusic?url=${encodeURIComponent(catboxUrl)}`);
        if (!resp.ok) return reply(`❌ API Error: ${resp.status}`);
        const data = await resp.json();
        if (!data?.status || !data?.title) return reply(data?.error || "Song not found.");

        const { title = '-', artists = '-' } = data;

        // Fetch thumbnail from YouTube
        const thumbnail = await fetchThumbnail(`${title} ${artists}`);

        // Stylish WhatsApp card
        const message = {
            image: { url: thumbnail },
            caption: `
┏━━━━━━━━━━━━━━━┓
🎶 *Song Recognition* 🎶
┗━━━━━━━━━━━━━━━┛

🎼 *Title*  : ${title}
🎤 *Artist* : ${artists}
🔗 *Link*   : ${catboxUrl}

✨💫 Sparkling vibes for your music ✨💫
> Powered by *WhiteShadow* 〽️D
──────────────────────────
`
        };

        await conn.sendMessage(from, message, { quoted: mek });
        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (e) {
        console.log("WHATMUSIC ERROR:", e);
        reply(`❌ Error: ${e.message || e}`);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
    } finally {
        if (filePath) { try { fs.unlinkSync(filePath) } catch {} }
    }
});
