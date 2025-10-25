const { cmd } = require('../command');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

cmd({
  pattern: "gofile",
  alias: ["upload", "goup", "store"],
  desc: "Upload any media file to GoFile with QR",
  category: "tools",
  react: "☁️",
  use: ".gofile (reply to file)",
  filename: __filename
}, async (conn, mek, m, { from, reply, quoted }) => {

  try {
    if (!quoted) return reply("⚠️ Reply to a file, image, or video first!");

    const filePath = await conn.downloadAndSaveMediaMessage(quoted);
    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));
    form.append("apikey", "freeApikey");

    const res = await axios.post("https://anabot.my.id/api/tools/goFile", form, {
      headers: {
        ...form.getHeaders(),
        Accept: "*/*"
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    fs.unlinkSync(filePath);

    if (!res.data.success) {
      console.log(res.data);
      return reply("❌ Upload failed! API responded with error.");
    }

    const info = res.data.data.result;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(info.downloadPage)}`;

    const caption = `
╭━━━〔 *GOFILE UPLOAD SUCCESS* 〕━━━╮
┃ 📁 *File:* ${info.name}
┃ 💾 *Size:* ${(info.size / 1024).toFixed(1)} KB
┃ 🧩 *Type:* ${info.mimetype}
┃ 🔗 *Download:* ${info.downloadPage}
┃ 🖼️ *Direct:* ${info.imageUrl || "N/A"}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
> © WhiteShadow-MD
`;

    await conn.sendMessage(from, { image: { url: qrUrl }, caption }, { quoted: mek });

  } catch (err) {
    console.error(err.response ? err.response.data : err);
    reply("❌ Upload failed. Check console for details.");
  }

});
