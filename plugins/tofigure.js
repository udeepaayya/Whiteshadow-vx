const { cmd } = require('../command')
const { GoogleGenAI } = require('@google/genai')

const APIKEY = 'AIzaSyAjVe47NUlLrCBLubwhF11o8YFr_22q_ms' // <-- ඔබගේ Gemini API key එක දාන්න
const PROMPT = 'Using the nano-banana model, a commercial 1/7 scale figurine of the character in the picture was created, depicting a realistic style and a realistic environment. The figurine is placed on a computer desk with a round transparent acrylic base. There is no text on the base. The computer screen shows the Zbrush modeling process of the figurine. Next to the computer screen is a BANDAI-style toy box with the original painting printed on it.'

cmd({
    pattern: "tofigure",
    alias: ["figurine"],
    desc: "Convert image into 1/7 figure style using Gemini",
    category: "ai",
    react: "🎎",
    filename: __filename
},
async (conn, m, q, { from }) => {
    try {
        const quoted = m.quoted ? m.quoted : m
        const mime = (quoted.msg || quoted).mimetype || ''
        if (!/image/.test(mime)) {
            return await m.reply('📷 Reply to an image with command: .tofigure')
        }

        await m.reply('⏳ Processing your figurine...')

        const imageBuffer = await quoted.download()
        if (!imageBuffer) return m.reply('❌ Failed to download image')

        const ai = new GoogleGenAI({ apiKey: APIKEY })
        const base64Image = imageBuffer.toString('base64')

        const contents = [
            { text: PROMPT },
            {
                inlineData: {
                    mimeType: mime,
                    data: base64Image
                }
            }
        ]

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents
        })

        const parts = response?.candidates?.[0]?.content?.parts || []

        for (const part of parts) {
            if (part.inlineData?.data) {
                const buffer = Buffer.from(part.inlineData.data, 'base64')
                await conn.sendFile(from, buffer, 'tofigure.png', '🎎 Here is your figurine ✨', m)
            }
        }
    } catch (e) {
        await m.reply(`⚠️ Error: ${e.message}`)
    }
})
