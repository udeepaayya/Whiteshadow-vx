const { cmd } = require('../command');
const fetch = require('node-fetch');
const { uploadToTelegraph } = require('../lib/telegra.js'); // use your final lib

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

    // save temp file
    const fs = require('fs');
    const path = require('path');
    const os = require('os');
    const tmpPath = path.join(os.tmpdir(), 'ytcomment.jpg');
    fs.writeFileSync(tmpPath, mediaBuffer);

    // upload to telegra.ph
    const uploadedUrl = await uploadToTelegraph(tmpPath).catch(() => null);
    fs.unlinkSync(tmpPath); // delete temp file

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
