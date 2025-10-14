//=====================================
// 🎵 WhiteShadow-MD Spotify Plugin
// 🧠 Smart Style by Chamod Nimsara
// ⚙️ API: izumiiiiiiii.dpdns.org
//=====================================

const { cmd } = require('../command')
const axios = require('axios')

cmd({
    pattern: "spotify",
    alias: ["spot", "spplay"],
    desc: "Download Spotify track info & audio",
    category: "music",
    react: "🎧",
    use: ".spotify <song name>",
    filename: __filename
}, async (conn, mek, m, { text, reply }) => {
    try {
        if (!text) return reply("🎶 *Please enter a song name!*\n\n💡 Example: *.spotify Kamak Na*")

        // Fetch Spotify data from Izumi API
        const { data } = await axios.get(`https://izumiiiiiiii.dpdns.org/downloader/spotifyplay?query=${encodeURIComponent(text)}`)
        
        if (!data.status) return reply("⚠️ *Song not found!* Please try another name.")

        const song = data.result

        // Caption format - Smart WhiteShadow Style
        const caption = `
⬤───〔 *🎧 WhiteShadow-MD Spotify Player* 〕───⬤

🎵 *Title:* ${song.title}
🎤 *Artists:* ${song.artists}
💽 *Album:* ${song.album}
📅 *Released:* ${song.release_date}
⏱️ *Duration:* ${(song.duration_ms / 1000 / 60).toFixed(2)} min

🌐 *Spotify Link:* [Open Track](${song.external_url})

⬇️ *Download (MP3)*: [Click Here](${song.download})

*Powered by WhiteShadow-MD ⚡*
`

        // Send image + caption
        await conn.sendMessage(m.chat, {
            image: { url: song.image },
            caption: caption,
            contextInfo: {
                externalAdReply: {
                    title: `🎧 ${song.title}`,
                    body: `${song.artists} • Spotify Music`,
                    thumbnailUrl: song.image,
                    sourceUrl: song.external_url,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: mek })

        // Send Preview Audio (short clip)
        if (song.preview_url) {
            await conn.sendMessage(m.chat, {
                audio: { url: song.preview_url },
                mimetype: 'audio/mpeg',
                ptt: false,
                fileName: `${song.title}.mp3`
            }, { quoted: mek })
        }

    } catch (err) {
        console.log(err)
        reply("⚠️ *Something went wrong while fetching Spotify song!* 😢")
    }
})
