import { cmd } from '../command.js';
import axios from 'axios';
import qs from 'querystring';

const API_KEY = 'eb6ec8d812ae32e7a1a765740fd1b497';

cmd({
  pattern: 'upimg',
  alias: ['ibb', 'imgupload'],
  desc: 'Upload image to ImgBB (ibb.co)',
  react: '🖼️',
  category: 'tools',
}, async (conn, m) => {
  try {
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || '';
    if (!mime.startsWith('image/')) return m.reply('⚠️ Please reply to an image!');

    const buffer = await q.download();
    if (!buffer) return m.reply('❌ Failed to download image.');

    const base64 = buffer.toString('base64');

    // ⚡ Form-urlencoded body
    const formData = qs.stringify({
      key: API_KEY,
      image: base64,
      expiration: 600 // optional, 10 min expiry
    });

    const res = await axios.post(
      'https://api.imgbb.com/1/upload',
      formData,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    if (res.data && res.data.data && res.data.data.url) {
      const data = res.data.data;
      await m.reply(
        `✅ Upload Successful!\n\n🖼️ Image Link: ${data.url}\n📸 Delete URL: ${data.delete_url}\n\n© WHITESHADOW-MD`
      );
    } else {
      m.reply('❌ Upload failed: Unexpected response.');
    }

  } catch (err) {
    console.error('ImgBB error:', err.response?.data || err);
    m.reply(`❌ Upload failed: ${err.message}`);
  }
});
