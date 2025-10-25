const { cmd } = require('../command');
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

cmd({
  pattern: "quax",
  alias: ["upload2", "imgup", "qstore"],
  desc: "Upload any file to Qu.ax server (Debug mode)",
  category: "tools",
  use: ".quax (reply to a file)",
  react: "☁️",
  filename: __filename
}, async (conn, mek, m, { from, reply, quoted }) => {

  try {
    if (!quoted) return reply("⚠️ Reply to an image, video, or document first!");

    // Download replied file
    const filePath = await conn.downloadAndSaveMediaMessage(quoted);

    // Prepare form data
    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));
    form.append("apikey", "freeApikey");

    reply("⏳ Uploading your file to Qu.ax...");

    // Send request
    const res = await axios.post("https://anabot.my.id/api/tools/quAx", form, {
      headers: form.getHeaders(),
      timeout: 30000, // 30s timeout
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    // Remove temp file
    fs.unlinkSync(filePath);

    // Print full JSON to console for debugging
    console.log("🔍 Full API Response:", res.data);

    // If API fails
    if (!res.data.success) {
      reply("❌ Upload failed (API error). Check console.");
      return;
    }

    const info = res.data.data.result;
    const msg = `
✅ *Upload Successful!*
📁 *File:* ${info.name}
💾 *Size:* ${(info.size / 1024).toFixed(1)} KB
🧩 *Hash:* ${info.hash.substring(0, 16)}...
⏰ *Expiry:* ${info.expiry}
🔗 *Direct Link:* ${info.url}

> © WhiteShadow-MD
    `;

    await conn.sendMessage(from, { text: msg }, { quoted: mek });

  } catch (e) {
    console.error("🚨 Error Details:", e.response ? e.response.data : e);
    reply("❌ Upload failed. Error logged to console.");
  }

});
