const { cmd } = require("../command");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

cmd({
  pattern: "funfilter",
  alias: ["rc", "naughtyai"],
  desc: "Just a fun image filter (joke only, owner only)",
  category: "fun",
  react: "🪄",
}, async (message, client) => {
  try {
    // ✅ Owner number check
    const ownerNumber = "94704896880";
    const sender = message.sender.replace(/[^0-9]/g, "");
    if (sender !== ownerNumber) {
      return message.reply("⚠️ *This command is for the owner only!*");
    }

    const mime = (message.quoted ? message.quoted.mimetype : message.mimetype) || "";
    if (!/image/.test(mime)) {
      return message.reply("📸 *Please reply to an image!*");
    }

    const buffer = await message.download();
    const filePath = "./temp_image.jpg";
    fs.writeFileSync(filePath, buffer);

    // 1️⃣ Upload image to Catbox
    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", fs.createReadStream(filePath));

    const catbox = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders(),
    });

    const imageUrl = catbox.data.trim();
    if (!imageUrl.startsWith("https://files.catbox.moe")) {
      throw new Error("Upload failed");
    }

    // 2️⃣ Send to Nekolabs API
    const api = `https://api.nekolabs.my.id/tools/convert/remove-clothes?imageUrl=${encodeURIComponent(imageUrl)}`;
    const { data } = await axios.get(api);

    if (!data.status) throw new Error("API request failed");

    await client.sendMessage(message.chat, {
      image: { url: data.result },
      caption: "🪄 *Fun Filter Applied!* (Joke Only 😜)",
    });

    fs.unlinkSync(filePath);
  } catch (e) {
    console.error(e);
    message.reply("⚠️ *Error applying fun filter!*");
  }
});
