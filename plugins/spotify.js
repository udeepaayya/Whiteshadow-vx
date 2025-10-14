//=====================================
// 🎵 WhiteShadow-MD Spotify Plugin (Fixed)
// 👨‍💻 Developer: Chamod Nimsara
// ⚙️ API: https://izumiiiiiiii.dpdns.org
//=====================================

const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "spotify",
    alias: ["spot", "spplay"],
    desc: "Download or preview Spotify songs easily",
    category: "music",
    react: "🎧",
    use: ".spotify <song name>",
    filename: __filename
}, async (conn, mek, m, { text, reply }) => {
    try {
        if (!text) return reply("🎶 *Please enter a song name!*\n\n💡 Example: *.spotify Kamak Na*")

        const apiUrl = `https://izumiiiiiiii.dpdns.org/downloader/spotifyplay?query=${encodeURIComponent(text)}`
        const res = await axios.get(apiUrl, { timeout: 10000 }).catch(() => null)
        
        if (!res || !res.data || !res.data.status) {
            return reply("⚠️ *Song not found or API unreachable!* 😢\nTry again in a few seconds.")
        }

        const song = res.data.result
        const duration = (song.duration_ms / 1000 / 60).toFixed(2)

        const caption = `
⬤───〔 *🎧 WhiteShadow-MD Spotify Player* 〕───⬤

🎵 *Title:* ${song.title}
🎤 *Artist(s):* ${song.artists}
💽 *Album:* ${song.album}
📅 *Released:* ${song.release_date}
⏱️ *Duration:* ${duration} min

🌐 *Spotify Link:* [Click Here](${song.external_url})
⬇️ *Download (MP3):* [Get Song](${song.download})

*🧠 Powered by WhiteShadow-MD x Izumi*
`

        // Send image + caption
        await conn.sendMessage(m.chat, {
            image: { url: song.image },
            caption,
            contextInfo: {
                externalAdReply: {
                    title: `🎵 ${song.title}`,
                    body: `${song.artists} • Spotify`,
                    thumbnailUrl: song.image,
                    sourceUrl: song.external_url,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: mek })

        // Send preview audio (if available)
        if (song.preview_url) {
            await conn.sendMessage(m.chat, {
                audio: { url: song.preview_url },
                mimetype: 'audio/mpeg',
                ptt: false,
                fileName: `${song.title}.mp3`
            }, { quoted: mek })
        } else {
            await reply("🎧 *No preview available for this song!*")
        }

    } catch (e) {
        console.log(e)
        reply("⚠️ *Something went wrong while fetching Spotify song!* 😢\nPlease check your connection or API status.")
    }
})
