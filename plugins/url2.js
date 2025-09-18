/*
  TOURL CMD - WhiteShadow MD
  Feature : Convert file (Image, Video, Audio, Document) to Direct URL
  Base    : https://cdn.yupra.my.id/
  Note    : No expire (permanent link)
  Dev     : Chamod | WhiteShadow
*/

import axios from 'axios'
import FormData from 'form-data'
import { fileTypeFromBuffer } from 'file-type'
import { cmd } from '../command.js' // adjust import path if needed

// Upload function
const uploadFile = async (buffer, filename) => {
  const form = new FormData()
  form.append('files', buffer, { filename })

  const response = await axios.post('https://cdn.yupra.my.id/upload', form, {
    headers: {
      ...form.getHeaders(),
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36'
    },
    timeout: 120000
  })

  return response.data
}

// Command
cmd({
  pattern: "url2",
  desc: "Upload files to get permanent URL",
  category: "tools",
  react: "🌐",
  filename: __filename
}, async (conn, m, store, { from, q, reply }) => {
  try {
    const quoted = m.quoted ? m.quoted : m
    const mime = (quoted?.msg || quoted)?.mimetype || ''

    if (!quoted || !mime || mime.includes('text/plain') || !quoted.download) {
      return reply(`❌ Reply to a file with *${q ? q : ".tourl"}*\n\n✅ Supported: Images, Videos, Audio, Documents (not plain text)`)
    }

    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } })

    const media = await quoted.download()
    if (!media || media.length === 0) throw new Error('Failed to download file')
    if (media.length > 30 * 1024 * 1024) throw new Error('File too large (max 30MB)')

    const type = await fileTypeFromBuffer(media).catch(() => null)
    let ext = type?.ext
    
    if (!ext && mime) {
      const mimeMap = {
        'application/javascript': 'js',
        'text/javascript': 'js',
        'application/json': 'json',
        'text/html': 'html',
        'text/css': 'css',
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'video/mp4': 'mp4',
        'audio/mpeg': 'mp3'
      }
      ext = mimeMap[mime]
    }
    
    if (!ext && mime) {
      const fallback = mime.split('/')[1]
      if (fallback && fallback.length <= 4 && !fallback.includes('-')) {
        ext = fallback
      }
    }

    const filename = `file_${Date.now()}${ext ? '.' + ext : ''}`
    const result = await uploadFile(media, filename)

    if (result.success && result.files?.[0]) {
      const file = result.files[0]
      const fileUrl = `https://cdn.yupra.my.id${file.url}`

      reply(`✅ *Upload Success!*\n\n🔗 ${fileUrl}`)
    } else {
      throw new Error('Upload failed')
    }

  } catch (e) {
    await conn.sendMessage(from, { react: { text: '❌', key: m.key } })

    let msg = '❌ Upload failed'
    if (e.message.includes('download')) msg = '❌ Cannot download file'
    else if (e.message.includes('large')) msg = '❌ File too large (max 30MB)'
    else if (e.response?.status === 413) msg = '❌ File too large'
    else if (e.response?.status === 500) msg = '❌ Server error, try again'

    reply(msg)
  }
})
