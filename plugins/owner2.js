const { cmd } = require("../command");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

cmd({
  pattern: "rcf",
  desc: "Owner-only fun image filter (for jokes only)",
  category: "fun",
  react: "🪄",
}, async (message, client) => {
  try {
    const owner = "94704896880";
    const sender = (message.sender || message.key.participant || "").replace(/[^0-9]/g, "");

    if (sender !== owner) {
      return message.reply("⚠️ *This command is for the owner only!*");
    }

    const qmsg = message.quoted ? message.quoted : message;
    const mime = qmsg.mimetype || "";
    if (!/image/.test(mime)) return message.reply("📸 *Please reply to an image!*");

    await message.reply("🪄 *Uploading image...*");

    const buffer = await client.downloadMediaMessage(qmsg);
    if (!buffer) return message.reply("⚠️ *Failed to download image!*");

    const filePath = "./temp_image.jpg";
    fs.writeFileSync(filePath, buffer);

    // Upload to Catbox
    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", fs.createReadStream(filePath));

    const uploadRes = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders(),
    });

    const imageUrl = uploadRes.data.trim();
    if (!imageUrl.startsWith("https://files.catbox.moe"))
      return message.reply("❌ Upload failed!\n" + imageUrl);

    await message.reply("✅ *Uploaded!* Sending to API...");

    // Nekolabs API
    const api = `https://api.nekolabs.my.id/tools/convert/remove-clothes?imageUrl=${encodeURIComponent(imageUrl)}`;
    const { data } = await axios.get(api);

    if (!data.status) return message.reply("❌ API request failed!");

    await client.sendMessage(message.chat, {
      image: { url: data.result },
      caption: "🪄 *Fun Filter Applied!* (Joke Only 😜)",
    });

    fs.unlinkSync(filePath);
    await message.reply("✅ *Done!* Filter complete 🎉");
  } catch (e) {
    await message.reply("⚠️ *Error:* " + e.message);
  }
});
