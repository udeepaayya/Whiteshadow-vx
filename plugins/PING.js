//═══════════════════════════════════════════════//
//                WHITESHADOW-MD                  //
//═══════════════════════════════════════════════//
//  ⚡ Feature : NanoBanana AI Image Edit (Catbox Upload)
//  👑 Developer : Chamod Nimsara (WhiteShadow)
//  📡 Channel   : https://whatsapp.com/channel/0029Vb4fjWE1yT25R7epR110
//═══════════════════════════════════════════════//

const { cmd } = require("../command");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const os = require("os");
const path = require("path");

cmd({
  pattern: "nanobanana",
  alias: ["nb"],
  desc: "AI Image editing using NanoBanana API (Catbox Upload)",
  category: "ai",
  react: "🎨",
  use: "<prompt>",
  filename: __filename
}, async (client, message, args, { reply, text }) => {
  try {
    const q = message.quoted ? message.quoted : message;
    const mime = (q.msg || q).mimetype || q.mediaType || "";

    if (!/image/.test(mime)) {
      return await reply(`⚠️ *Please reply to an image with a prompt!*\n\nExample:\n.nanobanana make it anime style`);
    }

    // ✅ Fix: get prompt from text or args
    const prompt = typeof text === "string" && text.trim().length > 0 
      ? text.trim() 
      : Array.isArray(args) 
        ? args.join(" ") 
        : "";

    if (!prompt) {
      return await reply(`⚠️ *Please provide a prompt!*\n\nExample:\n.nanobanana make it anime style`);
    }

    if (prompt.length > 500) {
      return await reply(`❌ Prompt too long! Maximum 500 characters allowed.`);
    }

    const processing = await reply("⏳ Uploading image to Catbox and processing with *Nano-Banana AI*...");

    // Download image
    const imgBuffer = await q.download();
    if (!imgBuffer || imgBuffer.length === 0) throw new Error("❌ Failed to download image!");

    if (imgBuffer.length > 10 * 1024 * 1024) throw new Error("❌ Image too large! Max 10MB.");

    // Save temp file
    const tempFilePath = path.join(os.tmpdir(), `nanobanana_${Date.now()}.jpg`);
    fs.writeFileSync(tempFilePath, imgBuffer);

    // Upload to Catbox
    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", fs.createReadStream(tempFilePath), "image.jpg");

    const catboxRes = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders()
    });

    const imageUrl = catboxRes.data.trim();
    fs.unlinkSync(tempFilePath);

    if (!imageUrl.startsWith("https://files.catbox.moe")) {
      throw new Error("❌ Failed to upload image to Catbox!");
    }

    await client.sendMessage(message.chat, { text: "🎨 Image uploaded! Processing with AI...", edit: processing.key });

    // Call NanoBanana API
    const apiUrl = `https://api.platform.web.id/nano-banana?imageUrl=${encodeURIComponent(imageUrl)}&prompt=${encodeURIComponent(prompt)}`;
    const response = await axios.get(apiUrl, { timeout: 60000 });
    const json = response.data;

    if (!json?.success || !json?.result?.results?.length)
      throw new Error("❌ No valid result received from NanoBanana API.");

    const resultUrl = json.result.results[0].url;
    if (!resultUrl) throw new Error("❌ AI result not found!");

    await client.sendMessage(message.chat, { text: "✅ Done! Sending AI result...", edit: processing.key });

    await client.sendMessage(message.chat, {
      image: { url: resultUrl },
      caption: `✨ *Nano-Banana AI Result*\n\n*Prompt:* ${prompt}\n*Requested by:* @${message.sender.split("@")[0]}`,
      mentions: [message.sender]
    }, { quoted: message });

  } catch (error) {
    console.error(error);
    await reply(`🚨 *Error:* ${error.message || error}\n\n💡 *Tips:*\n• Use English prompts\n• Make sure image <10MB\n• Try again later if server busy`);
  }
});
