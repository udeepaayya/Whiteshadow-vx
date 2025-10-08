//═══════════════════════════════════════════════//
//                WHITESHADOW-MD                  //
//═══════════════════════════════════════════════//
//  ⚡ Feature : NanoBanana AI Image Edit
//  👑 Coder   : Chamod Nimsara (WhiteShadow)
//  📡 Channel : https://whatsapp.com/channel/0029Vb4fjWE1yT25R7epR110
//═══════════════════════════════════════════════//

import { cmd } from '../command.js'
import fetch from 'node-fetch'
import FormData from 'form-data'

cmd({
    pattern: 'nanobanana',
    alias: ['nb'],
    desc: 'AI Image editing using NanoBanana API (Catbox Upload)',
    category: 'ai',
    react: '🎨',
    use: '<prompt>',
}, async (m, conn, { text }) => {
    try {
        const q = m.quoted ? m.quoted : m
        const mime = (q.msg || q).mimetype || q.mediaType || ''

        if (!/image/.test(mime))
            return await m.reply(`⚠️ *Please reply to an image with a prompt!*\n\nExample:\n.nanobanana make it anime style`)

        if (!text)
            return await m.reply(`⚠️ *Please provide a prompt!*\n\nExample:\n.nanobanana make it anime style`)

        if (text.length > 500)
            return await m.reply(`❌ Prompt too long! Maximum 500 characters allowed.`)

        const processing = await m.reply('⏳ Uploading image to Catbox and processing with *Nano-Banana AI*...')

        // Download image buffer
        const img = await q.download()
        if (!img || img.length === 0)
            throw new Error('❌ Failed to download image!')

        if (img.length > 10 * 1024 * 1024)
            throw new Error('❌ Image too large! Maximum 10MB.')

        // 🧠 Upload to Catbox
        const form = new FormData()
        form.append('reqtype', 'fileupload')
        form.append('fileToUpload', img, 'image.jpg')

        const catbox = await fetch('https://catbox.moe/user/api.php', {
            method: 'POST',
            body: form
        })

        const imageUrl = await catbox.text()
        if (!imageUrl.startsWith('https://'))
            throw new Error('❌ Failed to upload image to Catbox!')

        // Process with NanoBanana API
        await conn.sendMessage(m.chat, { text: '🎨 Image uploaded! Processing with AI...', edit: processing.key })

        const apiUrl = `https://api.platform.web.id/nano-banana?imageUrl=${encodeURIComponent(imageUrl)}&prompt=${encodeURIComponent(text)}`
        const response = await fetch(apiUrl)
        const json = await response.json()

        if (!json?.success || !json?.result?.results?.length)
            throw new Error('❌ No valid result received from NanoBanana API.')

        const resultUrl = json.result.results[0].url
        if (!resultUrl) throw new Error('❌ AI result not found!')

        await conn.sendMessage(m.chat, { text: '✅ Done! Sending result...', edit: processing.key })

        await conn.sendMessage(m.chat, {
            image: { url: resultUrl },
            caption: `✨ *Nano-Banana AI Result*\n\n*Prompt:* ${text}\n*Requested by:* @${m.sender.split('@')[0]}`,
            mentions: [m.sender]
        }, { quoted: m })

    } catch (error) {
        console.error(error)
        await m.reply(`🚨 *Error:* ${error.message}\n\n💡 *Tips:*\n• Use English prompts\n• Make sure image <10MB\n• Try again later if server busy`)
    }
})
