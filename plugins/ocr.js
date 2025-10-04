// ────〔 🖼️ OCR IMAGE TO TEXT 〕────

const { cmd } = require('../command')
const fetch = require('node-fetch')

cmd({
    pattern: "ocr",
    alias: ["imagetotext", "imageocr"],
    desc: "Extract text from an image (OCR)",
    category: "tools",
    react: "📄",
    use: ".ocr (reply to image)",
    filename: __filename
}, async (m, sock) => {
    try {
        const mime = m.quoted?.mimetype || ''
        if (!/image/.test(mime)) {
            return m.reply("❌ Reply to an *image* with command `.ocr`")
        }

        m.reply("⏳ Processing OCR...")

        let buffer = await m.quoted.download()
        const imageBase64 = buffer.toString("base64")
        const url = "https://staging-ai-image-ocr-266i.frontend.encr.app/api/ocr/process"
        const mimeType = mime || "image/jpeg"

        const res = await fetch(url, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ imageBase64, mimeType })
        })

        if (!res.ok) throw new Error(await res.text())
        const json = await res.json()

        let text = json.extractedText
            ?.replace(/\\n/g, '\n')
            ?.replace(/```/g, '')
            ?.trim()

        m.reply(text || "⚠️ No text detected in this image.")
    } catch (e) {
        m.reply(`❌ Error: ${e.message}`)
    }
})
