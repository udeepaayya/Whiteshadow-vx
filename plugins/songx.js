const { cmd } = require('../command')
const axios = require('axios')

cmd({
    pattern: "songx",
    alias: ["musicx"],
    category: "downloader",
    desc: "Download song using GiftedTech API",
    use: '.songx <YouTube link>',
    react: "🎵",
    filename: __filename
}, async (conn, m, text, { args, reply }) => {
    try {
        if (!args || !args[0]) return reply("❌ *Provide a valid YouTube link.*")

        const url = args[0];
        const api = `https://api.giftedtech.web.id/api/download/dlmp3?apikey=gifted&url=${encodeURIComponent(url)}`
        const { data } = await axios.get(api)

        if (!data || !data.result || !data.result.download_url) {
            return reply("❌ *Failed to fetch song. Try another link.*")
        }

        let caption = `🎶 *Title:* ${data.result.title || "Unknown"}\n`
        caption += `🎧 *Quality:* ${data.result.quality || "N/A"}\n`
        caption += `🔗 *Source:* ${url}`

        await conn.sendMessage(m.from, {
            image: { url: data.result.thumbnail },
            caption,
        }, { quoted: m })

        await conn.sendMessage(m.from, {
            audio: { url: data.result.download_url },
            mimetype: 'audio/mp4',
            ptt: false
        }, { quoted: m })

    } catch (e) {
        console.error(e)
        return reply("❌ *Failed to download song.*")
    }
})
