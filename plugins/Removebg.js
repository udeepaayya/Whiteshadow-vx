/**
  ✧ Removebg - tool ✧ ───────────────────────
  𖣔 Type   : Plugin CMD
  𖣔 Upload : Catbox.moe
  𖣔 API    : https://api.zenzxz.my.id
  𖣔 Made for WHITESHADOW-MD
*/

const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { cmd } = require("../command");

// Upload buffer to Catbox
async function catboxUpload(buffer, mimeType) {
  const tempFilePath = path.join(os.tmpdir(), `catbox_${Date.now()}`);
  fs.writeFileSync(tempFilePath, buffer);

  // file extension detection
  let extension = ".jpg";
  if (mimeType.includes("png")) extension = ".png";
  else if (mimeType.includes("jpeg")) extension = ".jpg";

  const form = new FormData();
  form.append("fileToUpload", fs.createReadStream(tempFilePath), `file${extension}`);
  form.append("reqtype", "fileupload");

  const res = await axios.post("https://catbox.moe/user/api.php", form, {
    headers: form.getHeaders(),
  });

  fs.unlinkSync(tempFilePath);
  return res.data; // catbox url
}

cmd({
  pattern: "removebg",
  alias: ["rbg"],
  desc: "Remove background from an image",
  category: "tools",
  react: "🖼️",
  filename: __filename
},
async (client, message, args, { reply, usedPrefix, command }) => {
  try {
    await client.sendMessage(message.chat, { react: { text: '⏳', key: message.key } });

    const q = message.quoted ? message.quoted : message;
    const mime = (q.msg || q).mimetype || "";

    if (!mime || !/image\/(jpe?g|png)/.test(mime)) {
      return reply(`🍀 Please reply to or send a JPG/PNG image with the caption: ${usedPrefix + command}`);
    }

    const mediaBuffer = await q.download();
    if (!mediaBuffer) return reply("⚠️ Failed to download the image.");

    // upload to Catbox
    const catboxUrl = await catboxUpload(mediaBuffer, mime);
    if (!catboxUrl || !catboxUrl.startsWith("http")) {
      return reply("⚠️ Failed to upload image to Catbox server.");
    }

    // call removebg API
    const apiUrl = `https://api.zenzxz.my.id/tools/removebg?url=${encodeURIComponent(catboxUrl)}`;
    const res = await axios.get(apiUrl);
    const json = res.data;

    if (!json.status || !json.result?.url) {
      return reply("🍂 Failed to process the image. Please try another one.");
    }

    // fetch processed image
    const resultImg = await axios.get(json.result.url, { responseType: "arraybuffer" });
    await client.sendFile(
      message.chat,
      Buffer.from(resultImg.data),
      "removebg.png",
      `✨ *Background removed successfully!*\n📷 Preview: ${json.result.preview_demo}`,
      message
    );

    await client.sendMessage(message.chat, { react: { text: '✅', key: message.key } });

  } catch (e) {
    console.error("REMOVE BG ERROR:", e);
    reply("🍂 An error occurred while removing the background.");
  }
});
