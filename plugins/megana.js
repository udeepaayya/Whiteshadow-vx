/**
 * ⚡ WHITESHADOW-MD | Transfer.sh Uploader (Fixed)
 * Author: Chamod Nimsara | Team WhiteShadow
 * Description: Upload any file (photo, video, doc, zip) to transfer.sh anonymously
 */

/**
 * 🖼️ WHITESHADOW-MD | ImgBB Uploader
 * Upload photos to ibb.co (ImgBB)
 * Author: Chamod Nimsara | Team WhiteShadow
 */

const { cmd } = require('../command');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

cmd({
  pattern: "ibb",
  desc: "Upload image to imgbb.com",
  category: "tools",
  react: "🖼️",
  use: ".ibb <reply image>",
  filename: __filename
}, async (conn, mek, m, { reply, mime }) => {
  try {
    if (!mime || !mime.startsWith('image')) return reply('⚠️ Reply to an image!');
    
    const buffer = await m.download(); // get replied image as buffer
    const form = new FormData();
    form.append('image', buffer.toString('base64')); // imgbb accepts base64
    
    // 🧩 Replace with your own API key (Get free at https://api.imgbb.com)
    const API_KEY = 'eb6ec8d812ae32e7a1a765740fd1b497';
    const url = `https://api.imgbb.com/1/upload?key=${API_KEY}`;
    
    const res = await axios.post(url, form, {
      headers: form.getHeaders()
    });

    if (res.data && res.data.data && res.data.data.url) {
      reply(`✅ Upload Successful!\n\n🔗 ${res.data.data.url}`);
    } else {
      reply('❌ Upload failed: Unexpected response.');
    }

  } catch (e) {
    console.log(e);
    reply(`❌ Upload failed: ${e.message}`);
  }
});
