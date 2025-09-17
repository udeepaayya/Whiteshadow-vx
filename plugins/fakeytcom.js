const { cmd } = require('../command');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const os = require('os');
const axios = require('axios');
const FormData = require('form-data');

// Catbox uploader function
async function uploadToCatbox(buffer, filename='file.jpg') {
    const tempPath = path.join(os.tmpdir(), filename);
    fs.writeFileSync(tempPath, buffer);

    const form = new FormData();
    form.append('fileToUpload', fs.createReadStream(tempPath), filename);
    form.append('reqtype', 'fileupload');

    try {
        const { data } = await axios.post("https://catbox.moe/user/api.php", form, {
            headers: form.getHeaders()
        });
        fs.unlinkSync(tempPath);
        return data; // URL string
    } catch(e) {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        console.error('Catbox upload error:', e);
        return null;
    }
}

// Plugin command
cmd({
  pattern: "ytcomment",
  desc: "Make fake YouTube comment (Singlish replies)",
  category: "maker",
  react: "💬",
  use: ".ytcomment username|comment (reply with image)",
  filename: __filename
}, async (conn, m, mek, { from, q, reply, usedPrefix, command }) => {
  try {
    if (!q || !q.includes('|')) {
      return reply(`🍀 Use *username|comment* format machan!\n\n🧩 Example: ${usedPrefix + command} Chamod|Hello machan`);
    }

    let quoted = m.quoted ? m.quoted : m;
    let mime = (quoted.msg || quoted).mimetype || '';
    if (!mime || !/image\/(jpeg|png)/.test(mime)) {
      return reply('☘️ Reply to a JPG/PNG image or send image with caption command machan!');
    }

    // download buffer
    const mediaBuffer = await quoted.download().catch(() => null);
    if (!mediaBuffer) return reply('⚠️ Image download fail machan, try again!');

    // upload to Catbox
    const uploadedUrl = await uploadToCatbox(mediaBuffer, 'ytcomment.jpg');
    if (!uploadedUrl) return reply('⚠️ Upload fail machan, try again later!');

    // parse username and comment
    let [username, text] = q.split('|').map(s => s.trim());
    if (!username || !text) {
      return reply(`🌱 Wrong format machan!\n\n🌼 Example: ${usedPrefix + command} Chamod|Hariyata hodai`);
    }

    await reply('⏳ Working on it machan...');

    // call fake YT API
    const apiUrl = `https://api.zenzxz.my.id/maker/ytcomment?text=${encodeURIComponent(text)}&avatar=${encodeURIComponent(uploadedUrl)}&username=${encodeURIComponent(username)}`;
    const res = await fetch(apiUrl);
    if (!res.ok) return reply('🍂 API error machan, try again later!');

    const arrayBuffer = await res.arrayBuffer().catch(() => null);
    if (!arrayBuffer) return reply('🍂 API returned no image machan.');

    const buffer = Buffer.from(arrayBuffer);

    await conn.sendMessage(from, {
      image: buffer,
      caption: `✨ Fake YouTube Comment ready!\n\n👤 Username: *${username}*\n💬 Comment: *${text}*`
    }, { quoted: mek });

  } catch (e) {
    console.error(e);
    reply('🍂 Oops machan! Something went wrong making fake YT comment 😢');
  }
});
