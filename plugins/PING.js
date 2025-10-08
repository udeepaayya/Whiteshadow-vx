const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { cmd } = require("../command");

cmd({
  pattern: "nanobanana",
  alias: ["nb", "nano", "banana"],
  react: "🎨",
  desc: "AI image edit with custom prompt (Anyone can use)",
  use: ".nanobanana [prompt] (reply to image)",
  category: "fun",
  filename: __filename
}, async (client, message, args, { reply }) => {
  let tempFilePath = null;

  try {
    const quoted = message.quoted ? message.quoted : message;
    const mime = (quoted.msg || quoted).mimetype || "";
    if (!mime || !mime.startsWith("image/"))
      return reply("🖼️ Please reply to an image!");

    // Check prompt
    let prompt = "";
    if (Array.isArray(args) && args.length > 0) {
      prompt = args.join(" ").trim();
    } else if (typeof args === "string" && args.trim().length > 0) {
      prompt = args.trim();
    }

    if (!prompt) {
      return reply("⚠️ Please enter a prompt!\nExample: `.nanobanana make it anime style`");
    }

    // Download image
    const buffer = await quoted.download();
    tempFilePath = path.join(os.tmpdir(), `upload_${Date.now()}.jpg`);
    fs.writeFileSync(tempFilePath, buffer);

    // Upload to Catbox
    const form = new FormData();
    form.append("fileToUpload", fs.createReadStream(tempFilePath));
    form.append("reqtype", "fileupload");

    const uploadRes = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders(),
    });

    const imgUrl = (uploadRes.data || "").toString().trim();

    // Send to Nano-Banana API
    const apiUrl = `https://api.nekolabs.my.id/ai/gemini/nano-banana?prompt=${encodeURIComponent(prompt)}&imageUrl=${encodeURIComponent(imgUrl)}`;
    const apiRes = await axios.get(apiUrl);

    if (apiRes.data && apiRes.data.status && apiRes.data.result) {
      await client.sendMessage(message.chat, {
        image: { url: apiRes.data.result },
        caption: `✨ *AI Edited Image*\n> Prompt: ${prompt}\n> WHITESHADOW-MD ⚡`
      });
    } else {
      reply("⚠️ API didn’t return a valid result!");
    }

  } catch (err) {
    console.error(err);
    reply("❌ Error: " + (err && err.message ? err.message : String(err)));
  } finally {
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  }
});
