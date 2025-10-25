const { cmd } = require('../command');
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

cmd({
  pattern: "quax",
  alias: ["upload2", "imgup", "qstore"],
  desc: "Upload any file to Qu.ax server with QR code",
  category: "tools",
  use: ".quax (reply to a file)",
  react: "☁️",
  filename: __filename
}, async (conn, mek, m, { from, reply, quoted }) => {

  try {
    if (!quoted) return reply("⚠️ Reply to an image, video, or document you want to upload!");

    // Download the replied file
    const filePath = await conn.downloadAndSaveMediaMessage(quoted);

    // Prepare form data
    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));
    form.append("apikey", "freeApikey");

    // Send to API
    const res = await axios.post("https://anabot.my.id/api/tools/quAx", form, {
      headers: {
        ...form.getHeaders(),
        Accept: "application/json"
      }
    });

    // Delete local temp file
    fs.unlinkSync(filePath);

    if (!res.data.success) return reply("❌ Upload failed!");

    const info = res.data.data.result;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(info.url)}`;

    const caption = `
╭━━━〔 *QU.AX UPLOAD SUCCESS* 〕━━━╮
┃ 📁 *File:* ${info.name}
┃ 💾 *Size:* ${(info.size / 1024).toFixed(1)} KB
┃ 🧩 *Hash:* ${info.hash.substring(0, 16)}...
┃ ⏰ *Expiry:* ${info.expiry}
┃ 🔗 *Direct Link:* ${info.url}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
> © WhiteShadow-MD
    `;

    // Send QR + caption
    await conn.sendMessage(from, { image: { url: qrUrl }, caption }, { quoted: mek });

  } catch (e) {
    console.error(e.response ? e.response.data : e);
    reply("❌ Upload failed, check console for details.");
  }

});
