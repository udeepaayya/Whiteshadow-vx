const { cmd } = require('../command');
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

cmd({
  pattern: "quax",
  alias: ["upload2", "imgup", "qstore"],
  desc: "Upload any file to Qu.ax server",
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

    // Upload to API
    const res = await axios.post("https://anabot.my.id/api/tools/quAx", form, {
      headers: {
        ...form.getHeaders(),
        Accept: "application/json"
      }
    });

    // Delete temp file
    fs.unlinkSync(filePath);

    // Check response
    if (!res.data.success) {
      console.log("API Error:", res.data);
      return reply("❌ Upload failed (API returned error).");
    }

    const info = res.data.data.result;

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

    await conn.sendMessage(from, { text: caption }, { quoted: mek });

  } catch (e) {
    console.error("Upload Error:", e.response ? e.response.data : e);
    reply("❌ Upload failed. Check console for details.");
  }

});
