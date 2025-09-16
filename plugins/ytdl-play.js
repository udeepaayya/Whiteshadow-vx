const { cmd } = require('../command');
const fetch = require('node-fetch');
const yts = require('yt-search'); // search support

cmd({
    pattern: "play2",
    alias: ["ytplay2", "music2"],
    react: "🎶",
    desc: "Download YouTube audio using GTech API",
    category: "download",
    use: ".play2 <song name or YouTube URL>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply("❌ Please provide a song name or YouTube URL!");

        await reply("⏳ Searching and fetching audio...");

        let videoUrl = q;

        // If not a YouTube URL, search first
        if (!q.match(/(youtube\.com|youtu\.be)/)) {
            const search = await yts(q);
            if (!search.videos.length) return await reply("❌ No results found!");
            videoUrl = search.videos[0].url;
        }

        // API call (replace APIKEY with your valid key)
        const apiUrl = `https://gtech-api-xtp1.onrender.com/api/audio/yt?apikey=APIKEY&url=${encodeURIComponent(videoUrl)}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data.status || !data.result || !data.result.media) {
            return await reply("❌ Failed to fetch audio!");
        }

        const { title, thumbnail, audio_url, channel, description } = data.result.media;

        // --- Fake vCard (phone: +213 797 06 97 00) ---
        // NOTE: waid should be digits only (countrycode + number, no plus or spaces)
        const waidNumber = '213797069700'; // derived from +213 797 06 97 00 (no +, no spaces)
        const vcard = `BEGIN:VCARD
VERSION:3.0
N:;White Shadow;;;
FN:White Shadow
ORG:WhiteShadow;
TEL;type=CELL;waid=${waidNumber}:+213797069700
END:VCARD`;

        // Send vCard as contact (quoted to the incoming message)
        await conn.sendMessage(from, {
            contacts: {
                displayName: "White Shadow",
                contacts: [{ displayName: "White Shadow", vcard }]
            }
        }, { quoted: mek });

        // Send details with cover
        await conn.sendMessage(from, {
            image: { url: thumbnail },
            caption: `🎶 *${title}*\n📺 ${channel}\n\n${description ? description.substring(0, 200) + '...' : ''}`
        }, { quoted: mek });

        // Send audio file
        await conn.sendMessage(from, {
            audio: { url: audio_url },
            mimetype: 'audio/mpeg',
            ptt: false
        }, { quoted: mek });

        await reply(`✅ *${title}* downloaded successfully!`);

    } catch (error) {
        console.error(error);
        await reply(`❌ Error: ${error.message}`);
    }
});
