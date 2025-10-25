const { cmd } = require('../command');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

cmd({
  pattern: "gofile",
  alias: ["uploadg", "goup", "store"],
  desc: "Upload any media file (image/video/document) to GoFile server with QR",
  category: "tools",
  use: ".gofile (reply to a file)",
  react: "☁️",
  filename: __filename
}, async (conn, mek, m, { from, reply, quoted }) => {

  try {
    if (!quoted) return reply("⚠️ Reply to an image, video, or document you want to upload!");

    // Download replied file
    const filePath = await conn.downloadAndSaveMediaMessage(quoted);

    // Prepare FormData
    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));
    form.append("apikey", "freeApikey");

    // Upload to API
    const res = await axios.post("https://anabot.my.id/api/tools/goFile", form, {
      headers: form.getHeaders()
    });

    fs.unlinkSync(filePath); // remove temp file

    if (!res.data.success) return reply("❌ Upload failed!");

    const info = res.data.data.result;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(info.downloadPage)}`;

    const caption = `
╭━━━〔 *GOFILE UPLOAD SUCCESS* 〕━━━╮
┃ 📁 *File:* ${info.name}
┃ 💾 *Size:* ${(info.size / 1024).toFixed(1)} KB
┃ 🧩 *Type:* ${info.mimetype}
┃ 🔗 *Download Page:* ${info.downloadPage}
┃ 🖼️ *Direct Link:* ${info.imageUrl || "N/A"}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
> © WhiteShadow-MD
    `;

    // Send result with QR
    await conn.sendMessage(from, {
      image: { url: qrUrl },
      caption
    }, { quoted: mek });

  } catch (e) {
    console.error(e);
    reply("❌ Upload failed, try again later.");
  }

});
