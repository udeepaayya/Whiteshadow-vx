const axios = require("axios");
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
    if (!mime || !mime.startsWith("image/")) return reply("🖼️ Reply to an image!");

    const buff = await quoted.download();
    const formData = new FormData();
    formData.append("fileToUpload", buff, "image.jpg");
    formData.append("reqtype", "fileupload");

    // Upload to Catbox first
    const uploadRes = await axios.post("https://catbox.moe/user/api.php", formData, {
      headers: formData.getHeaders(),
    });

    const imgUrl = uploadRes.data.trim();

    // Pass that URL to your API
    const apiRes = await axios.get(`https://api.nekolabs.my.id/tools/convert/remove-clothes?imageUrl=${encodeURIComponent(imgUrl)}`);

    if (apiRes.data && apiRes.data.status && apiRes.data.result) {
      await client.sendMessage(message.chat, {
        image: { url: apiRes.data.result },
        caption: `🧩 *AI Fun Image Processed!*\n\n> Done by WHITESHADOW-MD ⚡`
      });
    } else {
      reply("⚠️ API didn’t return a valid result!");
    }

  } catch (err) {
    console.error(err);
    reply("❌ Error: " + err.message);
  }
});
