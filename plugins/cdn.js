/**
  ✧ yts2 - youtube search plugin ✧
  ✦ Developer: Chamod Nimsara (WhiteShadow)
  ✦ API: https://whiteshadow-yts.vercel.app/?q=
  ✦ Type: ESM Compatible Plugin
**/

const { cmd } = require('../command')
const yts = require('yt-search')

let searchResults = {}

cmd({
  pattern: 'yts2',
  alias: ['ytsearch2', 'songsearch'],
  desc: 'Search YouTube videos and reply with number to get details',
  category: 'download',
  react: '🎬'
}, async (conn, mek, m, { text, from }) => {
  try {
    if (!text) return await conn.sendMessage(from, { text: '🔎 Please enter a search term.\n\nExample: *.yts2 lelena*' })

    const { videos } = await yts(text)
    if (!videos || videos.length === 0) return await conn.sendMessage(from, { text: '⚠️ No results found.' })

    let message = `🔍 *Search Results for:* ${text}\n\n`
    let count = 1

    searchResults[from] = videos.slice(0, 10).map(v => ({
      title: v.title,
      url: v.url,
      views: v.views,
      timestamp: v.timestamp,
      ago: v.ago,
      author: v.author.name,
      thumb: v.thumbnail
    }))

    for (let v of searchResults[from]) {
      message += `*${count++}.* ${v.title}\n`
    }

    message += `\n🪄 *Reply with the number (1-${searchResults[from].length}) to get details.*`
    await conn.sendMessage(from, { text: message }, { quoted: mek })

  } catch (e) {
    console.error(e)
    await conn.sendMessage(from, { text: '⚠️ Error fetching results.' })
  }
})

// reply handler
cmd({
  on: 'message'
}, async (conn, mek, m, { from, body }) => {
  try {
    if (!searchResults[from]) return
    if (!/^\d+$/.test(body.trim())) return

    const index = parseInt(body.trim()) - 1
    const video = searchResults[from][index]
    if (!video) return

    let detailMsg = `🎬 *${video.title}*\n`
    detailMsg += `👤 Channel: ${video.author}\n`
    detailMsg += `👁️ Views: ${video.views}\n`
    detailMsg += `⏱️ Duration: ${video.timestamp}\n`
    detailMsg += `📅 Uploaded: ${video.ago}\n\n`
    detailMsg += `🔗 ${video.url}`

    await conn.sendMessage(from, {
      image: { url: video.thumb },
      caption: detailMsg
    }, { quoted: mek })

    delete searchResults[from]
  } catch (e) {
    console.error(e)
  }
})
