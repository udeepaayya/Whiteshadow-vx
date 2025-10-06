const { cmd } = require("../command");
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/genai");

cmd({
    pattern: "nanobanana",
    alias: ["nb", "nbanana"],
    react: "🧠",
    desc: "Generate AI text or image responses using NanoBanana AI",
    category: "fun",
    use: ".nanobanana <prompt> (or reply to image with .nanobanana <prompt>)",
    filename: __filename
}, async (conn, mek, m, { reply, args, from }) => {
    // ⚠️ Best practice: load API key from .env
    const genAI = new GoogleGenerativeAI(process.env.NANOBANANA_API_KEY || "AIzaSyCmvGqYJNGcOSbGfS3elT7WLStrSrnvSBs");

    // Helper: Download quoted image
    async function downloadQuotedImage() {
        try {
            const quotedMsg = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quotedMsg) return null;
            const messageType = Object.keys(quotedMsg)[0];
            if (messageType !== 'imageMessage') return null;
            const mimeType = quotedMsg.imageMessage.mimetype; 
            const stream = await conn.downloadMediaMessage(quotedMsg);
            const buffer = [];
            for await (const chunk of stream) buffer.push(chunk);
            return { buffer: Buffer.concat(buffer), mimeType };
        } catch (e) {
            console.error('Error downloading quoted image:', e);
            return null;
        }
    }

    try {
        const prompt = args.join(' ').trim();
        const imageData = await downloadQuotedImage();

        if (!prompt && !imageData) {
            return reply(
                "💡 *NanoBanana AI Usage:*\n1. Reply to an image with `.nanobanana <your question>`\n2. Send a text prompt with `.nanobanana <your prompt>`"
            );
        }

        await conn.sendMessage(from, { react: { text: "🧠", key: m.key } });

        let model;
        let generationConfig;
        let requestParts;

        if (imageData) {
            model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
            generationConfig = { temperature: 0.4, topK: 32, topP: 1, maxOutputTokens: 4096 };
            requestParts = [
                { text: prompt || "Describe this image in detail." },
                { inlineData: { mimeType: imageData.mimeType, data: imageData.buffer.toString("base64") } }
            ];
            await reply(`🖼️ *Analyzing Image...*\n*💬 Prompt:* ${prompt || "(no text)"}`);
        } else {
            model = genAI.getGenerativeModel({ model: "gemini-pro" });
            generationConfig = { temperature: 0.9, topK: 1, topP: 1, maxOutputTokens: 2048 };
            requestParts = [{ text: prompt }];
            await reply(`✍️ *Generating response...*\n*💬 Prompt:* ${prompt}`);
        }

        const result = await model.generateContent({ contents: [{ role: "user", parts: requestParts }], generationConfig });
        const responseText = result?.response?.text();

        if (responseText) {
            await conn.sendMessage(from, { text: `✅ *Here's your answer:*\n\n${responseText}` }, { quoted: m });
        } else {
            const blockReason = result?.response?.candidates?.[0]?.finishReason;
            let feedback = blockReason === 'SAFETY' ? 'Response blocked due to safety.' : 'Could not generate a response.';
            await reply(`⚠️ *Response Error:* ${feedback}`);
        }

    } catch (err) {
        console.error('NanoBanana Command Error:', err);
        let errorMessage = err.message.includes('429') ? 'Too many requests. Try later.' : 'Unexpected error.';
        await reply(`❌ *Error:* ${errorMessage}`);
    }
});
