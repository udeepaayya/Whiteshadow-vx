const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { cmd } = require("../command");

cmd({
  pattern: "airc",
  react: "🪄",
  desc: "Apply AI effect to image (fun version)",
  use: ".aiimage [reply to image]",
  category: "fun",
  filename: __filename
}, async (client, message, args, { reply }) => {
  try {
    const quoted = message.quoted ? message.quoted : message;
    const mime = (quoted.msg || quoted).mimetype || "";
    if (!mime || !mime.startsWith("image/")) return reply("🖼️ *Please reply to an image!*");

    // Download image
    const buffer = await quoted.download();

    // Save buffer as temporary file
    const tempFilePath = path.join(os.tmpdir(), `upload_${Date.now()}.jpg`);
    fs.writeFileSync(tempFilePath, buffer);

    // Upload to Catbox
    const form = new FormData();
    form.append("fileToUpload", fs.createReadStream(tempFilePath));
    form.append("reqtype", "fileupload");

    const uploadRes = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders(),
    });

    const imgUrl = uploadRes.data.trim();

    // Pass that URL to your API (fun or test API)
    const apiUrl = `https://api.nekolabs.my.id/tools/convert/remove-clothes?imageUrl=${encodeURIComponent(imgUrl)}`;
    const apiRes = await axios.get(apiUrl);

    // Clean up temp file
    fs.unlinkSync(tempFilePath);

    if (apiRes.data && apiRes.data.status && apiRes.data.result) {
      await client.sendMessage(message.chat, {
        image: { url: apiRes.data.result },
        caption: `✨ *AI Fun Image Processed!*\n\n> Uploaded by WHITESHADOW-MD ⚡`
      });
    } else {
      reply("⚠️ API didn’t return a valid result!");
    }

  } catch (err) {
    console.error(err);
    reply("❌ Error: " + err.message);
  }
});
