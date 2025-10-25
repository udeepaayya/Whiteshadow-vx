const { cmd } = require('../command');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

cmd({
  pattern: "gofile",
  alias: ["upload", "goup", "store"],
  desc: "Upload any media file (image/video/document) to GoFile server",
  category: "tools",
  use: ".gofile (reply to a file)",
  react: "☁️",
  filename: __filename
}, async (conn, mek, m, { from, reply, mime, quoted, isMedia }) => {

  try {
    if (!quoted) return reply("⚠️ Reply to a file, image or video you want to upload!");
    const filePath = await conn.downloadAndSaveMediaMessage(quoted);

    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));
    form.append("apikey", "freeApikey"); // use your key if you have one

    const res = await axios.post("https://anabot.my.id/api/tools/goFile", form, {
      headers: form.getHeaders()
    });

    fs.unlinkSync(filePath); // delete after upload

    if (!res.data.success) return reply("❌ Upload failed!");

    const info = res.data.data.result;
    const caption = `
╭━━━〔 *GOFILE UPLOAD SUCCESS* 〕━━━╮
┃ 📁 *File Name:* ${info.name}
┃ 💾 *Size:* ${(info.size / 1024).toFixed(1)} KB
┃ 🧩 *Type:* ${info.mimetype}
┃ 🔗 *Download Page:* ${info.downloadPage}
┃ 🖼️ *Direct Link:* ${info.imageUrl || "N/A"}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
> © WhiteShadow-MD
    `;

    await conn.sendMessage(from, { image: { url: info.imageUrl || null }, caption }, { quoted: mek });

  } catch (e) {
    console.log(e);
    reply("❌ Upload failed, try again later.");
  }

});
