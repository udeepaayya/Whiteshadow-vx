/*
* Plugin : Lyrics Search (WHITESHADOW-MD)
* Source : lrclib.net
* Author : ZenzzXD | Modified by WhiteShadow
*/

import axios from 'axios'
import { cmd } from '../command.js'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function lyrics(title) {
  if (!title) throw new Error('Title is required')
  
  const { data } = await axios.get(`https://lrclib.net/api/search?q=${encodeURIComponent(title)}`, {
    headers: {
      referer: `https://lrclib.net/search/${encodeURIComponent(title)}`,
      'user-agent': 'Mozilla/5.0'
    }
  })

  if (!data || !data[0]) throw new Error('No lyrics found')

  const song = data[0]
  const track = song.trackName || 'Unknown Track'
  const artist = song.artistName || 'Unknown Artist'
  const album = song.albumName || 'Unknown Album'
  const duration = song.duration ? `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2,'0')}` : 'Unknown Duration'
  const lyr = (song.plainLyrics || song.syncedLyrics || 'No lyrics available').replace(/\[.*?\]/g,'').trim()

  // Return JSON format
  return {
    track,
    artist,
    album,
    duration,
    lyrics: lyr
  }
}

cmd({
  pattern: 'lirik',
  alias: ['lyrics', 'songlyrics'],
  desc: 'Find song lyrics',
  category: 'tools',
  filename: __filename
}, async (m, conn, args) => {
  try {
    if (!args.length) {
      const msg = '❌ Mana judul nya bang?\n👉 contoh: .lirik nina feast'
      if (typeof m.reply === 'function') return await m.reply(msg)
      else return console.log(msg)
    }

    const title = args.join(' ')
    const song = await lyrics(title) // JSON format object

    // Ghost watermark
    const ghostWatermark = '> Ｐｏｗｅｒｅｄ  ｂｙ  ＷｈｉｔｅＳｈａｄｏｗＭＤ'

    // Prepare text message
    const txt = `
🎵 *Lyrics Finder* 🎵
─────────────────────
🎼 *Track* : ${song.track}
🎤 *Artist* : ${song.artist}
💽 *Album* : ${song.album}
⏱️ *Duration* : ${song.duration}

📑 *Lyrics* :
─────────────────────
${song.lyrics}


───────•••───────
${ghostWatermark}
`

    // Send text only (no vCard)
    if (typeof m.reply === 'function') await m.reply(txt)
    else console.log(txt)

  } catch(err) {
    const msg = `❌ Error: ${err.message}`
    if (typeof m.reply === 'function') await m.reply(msg)
    else console.log(msg)
  }
})
