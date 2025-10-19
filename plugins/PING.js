//═══════════════════════════════════════════════//
//                WHITESHADOW-MD                  //
//═══════════════════════════════════════════════//
//  ⚡ Feature : NanoBanana AI Image Editor
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
  alias: ["nb", "nano"],
  desc: "AI-powered Image Editing using NanoBanana (NekoLabs API + Catbox Upload)",
  category: "ai",
  react: "🎨",
  use: "<prompt>",
  filename: __filename
}, async (client, message, args, { reply, text }) => {
  try {
    const q = message.quoted ? message.quoted : message;
    const mime = (q.msg || q).mimetype || q.mediaType || "";

    // 🖼️ Validate image reply
    if (!/image/.test(mime)) {
      return await reply(`⚠️ *Please reply to an image with your prompt!*\n\n📌 *Example:*\n.nanobanana make it look like a cartoon`);
    }

    // 📝 Get prompt
    const prompt = typeof text === "string" && text.trim().length > 0
      ? text.trim()
      : Array.isArray(args)
        ? args.join(" ")
        : "";

    if (!prompt) {
      return await reply(`⚠️ *Please provide a prompt!*\n\n📌 *Example:*\n.nanobanana change the background to forest`);
    }

    if (prompt.length > 400) {
      return await reply(`❌ *Prompt too long!* Maximum 400 characters allowed.`);
    }

    await reply("⏳ *Uploading image to Catbox...*");

    // 🧩 Download image
    const imgBuffer = await q.download();
    if (!imgBuffer || imgBuffer.length === 0)
      throw new Error("❌ Failed to download the image!");

    if (imgBuffer.length > 10 * 1024 * 1024)
      throw new Error("❌ Image too large! Max 10MB allowed.");

    // 💾 Save temp file
    const tempPath = path.join(os.tmpdir(), `nanobanana_${Date.now()}.jpg`);
    fs.writeFileSync(tempPath, imgBuffer);

    // 🪶 Upload to Catbox
    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", fs.createReadStream(tempPath), "image.jpg");

    const catboxRes = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders(),
    });

    fs.unlinkSync(tempPath);

    const imageUrl = catboxRes.data.trim();
    if (!imageUrl.startsWith("https://files.catbox.moe"))
      throw new Error("❌ Failed to upload image to Catbox!");

    await reply("🎨 *Image uploaded!* Now processing with NanoBanana AI...");

    // 🌐 API Call
    const apiUrl = `https://api.nekolabs.my.id/ai/gemini/nano-banana?prompt=${encodeURIComponent(prompt)}&imageUrl=${encodeURIComponent(imageUrl)}`;
    const response = await axios.get(apiUrl, { timeout: 90000 });

    const data = response.data;

    if (!data?.success || !data?.result) {
      throw new Error("❌ No valid result received from NanoBanana API.");
    }

    // 🖼️ Final AI Image
    const aiImage = data.result;

    await client.sendMessage(message.chat, {
      image: { url: aiImage },
      caption: `✨ *NanoBanana AI Image Edit*\n\n🧠 *Prompt:* ${prompt}\n👤 *Requested by:* @${message.sender.split("@")[0]}\n📸 *Engine:* Gemini NanoBanana (NekoLabs)`,
      mentions: [message.sender],
    }, { quoted: message });

  } catch (err) {
    console.error(err);
    await reply(`🚨 *Error:* ${err.message || err}\n\n💡 *Tips:*\n• Use short, clear prompts (English preferred)\n• Ensure image <10MB\n• Try again later if server busy.`);
  }
});
