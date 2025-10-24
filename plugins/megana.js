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

import axios from 'axios';
import { cmd } from '../command.js';

// ⚠️ ඔබේ ImgBB API key එක මෙතන දාන්න
const API_KEY = 'eb6ec8d812ae32e7a1a765740fd1b497';

cmd({
  pattern: 'upimg',
  alias: ['imgupload', 'ibb'],
  desc: 'Upload image to ImgBB (ibb.co)',
  react: '🖼️',
  category: 'tools',
}, async (conn, m) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';
  if (!mime.startsWith('image/')) return m.reply('⚠️ Please reply to a *photo/image* to upload.');

  const buffer = await q.download();
  if (!buffer) return m.reply('❌ Failed to download image.');

  try {
    const base64 = buffer.toString('base64');
    const res = await axios.post(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
      image: base64,
    });

    const data = res.data.data;
    const link = data.url;

    await m.reply(`✅ *Upload Successful!*\n\n🖼️ *Image Link:* ${link}\n📸 *Delete URL:* ${data.delete_url}\n\n_© WHITESHADOW-MD_`);
  } catch (err) {
    console.error('ImgBB error:', err.response?.data || err);
    await m.reply(`❌ Upload failed: ${err.message}`);
  }
});
