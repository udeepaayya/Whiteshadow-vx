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
  return { track, artist, album, duration, lyr }
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
    const { track, artist, album, duration, lyr } = await lyrics(title)

    // Fake vCard
    let thumb = Buffer.from([])
    try {
      const ppUrl = await conn.profilePictureUrl("213797069700@s.whatsapp.net", "image")
      const ppResp = await axios.get(ppUrl, { responseType: 'arraybuffer' })
      thumb = Buffer.from(ppResp.data, 'binary')
    } catch(e) { console.log("❗ Couldn't fetch profile picture:", e.message) }

    const contactCard = {
      key: { fromMe: false, participant: '0@s.whatsapp.net', remoteJid: 'status@broadcast' },
      message: {
        contactMessage: {
          displayName: 'WHITESHADOW-MD ✅',
          vcard: `BEGIN:VCARD
VERSION:3.0
FN:WHITESHADOW-MD ✅
ORG:WHITESHADOW-MD TEAM
TEL;type=CELL;type=VOICE;waid=213797069700:+213 797 06 97 00
END:VCARD`,
          jpegThumbnail: thumb
        }
      }
    }

    const ghostWatermark = 'Ｐｏｗｅｒｅｄ  ｂｙ  ＷｈｉｔｅＳｈａｄｏｗＭＤ'

    const txt = `
🎵 *Lyrics Finder* 🎵
─────────────────────
🎼 *Track* : ${track}
🎤 *Artist* : ${artist}
💽 *Album* : ${album}
⏱️ *Duration* : ${duration}

📑 *Lyrics* :
─────────────────────
${lyr}


───────•••───────
${ghostWatermark}
`

    if (typeof m.reply === 'function') {
      await conn.sendMessage(m.chat, { text: txt }, { quoted: contactCard })
    } else {
      console.log(txt)
    }

  } catch(err) {
    const msg = `❌ Error: ${err.message}`
    if (typeof m.reply === 'function') await m.reply(msg)
    else console.log(msg)
  }
})
