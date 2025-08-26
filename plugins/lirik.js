/*
* Plugin : Lyrics Search (WHITESHADOW-MD)
* Source : lrclib.net
* Author : ZenzzXD | Modified by WhiteShadow
*/

import axios from 'axios'
import { cmd } from '../command.js'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// ✅ ESM safe __filename & __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function lyrics(title) {
  try {
    if (!title) throw new Error('Title is required')

    const { data } = await axios.get(
      `https://lrclib.net/api/search?q=${encodeURIComponent(title)}`, {
        headers: {
          referer: `https://lrclib.net/search/${encodeURIComponent(title)}`,
          'user-agent': 'Mozilla/5.0'
        }
      }
    )

    if (!data || !data[0]) throw new Error('No lyrics found')

    let song = data[0]
    let track = song.trackName || 'Unknown Track'
    let artist = song.artistName || 'Unknown Artist'
    let album = song.albumName || 'Unknown Album'
    let duration = song.duration ? `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}` : 'Unknown Duration'

    let lyr = song.plainLyrics || song.syncedLyrics
    if (!lyr) lyr = 'No lyrics available'

    lyr = lyr.replace(/\[.*?\]/g, '').trim()

    return { track, artist, album, duration, lyr }
  } catch (error) {
    throw new Error(error.message)
  }
}

cmd({
  pattern: "lirik",
  alias: ["lyrics", "songlyrics"],
  desc: "Find song lyrics",
  category: "tools",
  filename: __filename // ✅ Safe now
}, async (m, conn, args) => {
  try {
    if (!args.length) {
      // Safe reply
      if (typeof m.reply === 'function') {
        return await m.reply('❌ Mana judul nya bang?\n👉 contoh: .lirik nina feast')
      } else {
        return console.log('❌ Mana judul nya bang?')
      }
    }

    const title = args.join(' ')
    const { track, artist, album, duration, lyr } = await lyrics(title)

    // ✅ Fake vCard
    let thumb = Buffer.from([])
    try {
      const ppUrl = await conn.profilePictureUrl("213797069700@s.whatsapp.net", "image")
      const ppResp = await axios.get(ppUrl, { responseType: "arraybuffer" })
      thumb = Buffer.from(ppResp.data, "binary")
    } catch (err) {
      console.log("❗ Couldn't fetch profile picture:", err.message)
    }

    const contactCard = {
      key: {
        fromMe: false,
        participant: '0@s.whatsapp.net',
        remoteJid: "status@broadcast"
      },
      message: {
        contactMessage: {
          displayName: "WHITESHADOW-MD ✅",
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

    // Ghost watermark
    const ghostWatermark = "Ｐｏｗｅｒｅｄ  ｂｙ  ＷｈｉｔｅＳｈａｄｏｗ－ＭＤ"

    // Lyrics text
    let txt = `
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

    // Send lyrics quoting the fake vCard
    if (typeof m.reply === 'function') {
      await conn.sendMessage(m.chat, { text: txt }, { quoted: contactCard })
    } else {
      console.log(txt)
    }

  } catch (err) {
    if (typeof m.reply === 'function') {
      await m.reply(`❌ Error: ${err.message}`)
    } else {
      console.log(`❌ Error: ${err.message}`)
    }
  }
})
