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
        // waid must be digits only (no +, no spaces)
        const waidNumber = '213797069700'; // from +213 797 06 97 00
        const displayName = 'White Shadow';
        const vcard = `BEGIN:VCARD
VERSION:3.0
N:;${displayName};;;
FN:${displayName}
ORG:WhiteShadow;
TEL;type=CELL;waid=${waidNumber}:+213797069700
item1.X-ABLabel:Owner
END:VCARD`;

        // Construct a quoted fake message object (so other messages appear quoted with this contact card)
        const quotedFake = {
            key: {
                fromMe: false,
                // participant can stay "0@s.whatsapp.net"
                participant: "0@s.whatsapp.net",
                // use the same remoteJid as the chat we're sending to
                remoteJid: from
            },
            message: {
                contactMessage: {
                    displayName: displayName,
                    vcard
                }
            }
        };

        // Optionally: first send the contact card itself (so it appears as a standalone vCard message)
        // await conn.sendMessage(from, {
        //     contacts: {
        //         displayName,
        //         contacts: [{ displayName, vcard }]
        //     }
        // }, { quoted: mek });

        // Send details with cover, quoted as the fake vCard (so it shows vCard-style)
        await conn.sendMessage(from, {
            image: { url: thumbnail },
            caption: `🎶 *${title}*\n📺 ${channel}\n\n${description ? description.substring(0, 200) + '...' : ''}`
        }, { quoted: quotedFake });

        // Send audio file, also quoted to the fake vCard
        await conn.sendMessage(from, {
            audio: { url: audio_url },
            mimetype: 'audio/mpeg',
            ptt: false
        }, { quoted: quotedFake });

        // Send a final success text (also quoted to keep same vCard style)
        await conn.sendMessage(from, { text: `✅ *${title}* downloaded successfully!` }, { quoted: quotedFake });

    } catch (error) {
        console.error(error);
        await reply(`❌ Error: ${error.message}`);
    }
});
