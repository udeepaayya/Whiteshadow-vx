const { cmd } = require("../command");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

cmd({
  pattern: "rc",
  desc: "Owner-only fun image filter (for jokes only)",
  category: "fun",
  react: "🪄",
}, async (message, client) => {
  try {
    console.log("✅ Funfilter triggered!");

    const ownerNumber = "94704896880";
    const sender = (message.sender || message.key.participant || "").replace(/[^0-9]/g, "");
    console.log("Sender:", sender);

    if (sender !== ownerNumber) {
      return message.reply("⚠️ *This command is for the owner only!*");
    }

    const qmsg = message.quoted ? message.quoted : message;
    const mime = qmsg.mimetype || "";
    if (!/image/.test(mime)) {
      return message.reply("📸 *Please reply to an image!*");
    }

    console.log("Downloading image...");
    const buffer = await client.downloadMediaMessage(qmsg);
    if (!buffer) return message.reply("⚠️ *Failed to download image!*");

    const filePath = "./temp_image.jpg";
    fs.writeFileSync(filePath, buffer);

    console.log("Uploading to Catbox...");
    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", fs.createReadStream(filePath));

    const catbox = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders(),
    });

    const imageUrl = catbox.data.trim();
    console.log("Catbox URL:", imageUrl);

    const api = `https://api.nekolabs.my.id/tools/convert/remove-clothes?imageUrl=${encodeURIComponent(imageUrl)}`;
    const { data } = await axios.get(api);
    console.log("Nekolabs Response:", data);

    await client.sendMessage(message.chat, {
      image: { url: data.result },
      caption: "🪄 *Fun Filter Applied!* (Joke Only 😜)",
    });

    fs.unlinkSync(filePath);
    console.log("✅ Done!");
  } catch (e) {
    console.error("❌ Error in funfilter:", e);
    message.reply("⚠️ *Error applying fun filter!*");
  }
});
