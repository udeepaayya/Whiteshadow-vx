/**
 * 🔰 WHITESHADOW-MD Transfer.sh Uploader 🔰
 * Upload any photo, video, document, zip, apk, or file
 * Author: Chamod Nimsara | Team WhiteShadow
 */

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { cmd } from '../command.js';

async function uploadToTransfer(fileName, buffer) {
  const tempPath = path.join('./', fileName);
  await fs.promises.writeFile(tempPath, buffer);

  const form = new FormData();
  form.append('file', fs.createReadStream(tempPath));

  const response = await axios.post(`https://transfer.sh/${encodeURIComponent(fileName)}`, fs.createReadStream(tempPath), {
    headers: {
      ...form.getHeaders(),
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });

  await fs.promises.unlink(tempPath); // Delete temp file after upload
  return response.data; // URL returned by transfer.sh
}

cmd({
  pattern: 'uptransfer',
  alias: ['upload', 'anonupload'],
  desc: 'Upload any file to transfer.sh (no login required)',
  react: '📤',
  category: 'tools',
}, async (conn, m) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';
  if (!mime) return await m.reply('⚠️ Reply to a photo, video, or file to upload.');

  const buffer = await q.download();
  if (!buffer) return await m.reply('❌ File download failed.');

  try {
    const ext = mime.split('/')[1] || 'bin';
    const fileName = q.filename || `WhiteShadow_${Date.now()}.${ext}`;
    const link = await uploadToTransfer(fileName, buffer);
    await m.reply(
      `✅ *Upload Successful!*\n\n📁 *File:* ${fileName}\n🔗 *Link:* ${link}\n\n_© WHITESHADOW-MD_`
    );
  } catch (err) {
    console.error('Upload error:', err);
    await m.reply(`❌ Upload failed: ${err.message}`);
  }
});
