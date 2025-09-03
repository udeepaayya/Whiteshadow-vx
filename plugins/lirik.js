/*
* Plugin : Lyrics Search
* CMD : .lirik <song name>
* Source : lrclib.net API
* Author : ZenzzXD (Modified for Whiteshadow-MD)
*/

import axios from 'axios'
import { cmd } from '../command.js'

async function getLyrics(title) {
    try {
        if (!title) throw new Error('Song title is required!')

        const { data } = await axios.get(`https://lrclib.net/api/search?q=${encodeURIComponent(title)}`, {
            headers: {
                referer: `https://lrclib.net/search/${encodeURIComponent(title)}`,
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
            }
        })

        if (!data || !data[0]) throw new Error('No lyrics found!')

        let song = data[0]
        let track = song.trackName || 'Unknown Track'
        let artist = song.artistName || 'Unknown Artist'
        let album = song.albumName || 'Unknown Album'
        let duration = song.duration ? `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}` : 'Unknown'

        let lyr = song.plainLyrics || song.syncedLyrics
        if (!lyr) lyr = 'Lyrics not available'
        lyr = lyr.replace(/\[.*?\]/g, '').trim()

        return `🎶 *Lyrics Found!*\n\n*🎵 Title:* ${track}\n*🎤 Artist:* ${artist}\n*💽 Album:* ${album}\n*⏱ Duration:* ${duration}\n\n📑 *Lyrics:*\n${lyr}`
    } catch (error) {
        throw new Error(error.message)
    }
}

cmd({
    pattern: "lirik",
    alias: ["lyrics", "lyric"],
    desc: "Search lyrics of a song",
    category: "tools",
    react: "🎶",
    filename: __filename
}, async (conn, m, { args }) => {
    try {
        if (!args.length) return m.reply('❌ ගීත නමක් දෙන්න.\nඋදාහරණය: *.lirik Lelena*')

        const title = args.join(" ")
        let res = await getLyrics(title)

        await conn.sendMessage(m.chat, { text: res }, { quoted: m })
    } catch (err) {
        m.reply(`⚠️ Error: ${err.message}`)
    }
})
