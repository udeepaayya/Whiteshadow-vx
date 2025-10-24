/**
 * ⚡ WHITESHADOW-MD | Transfer.sh Uploader (Fixed)
 * Author: Chamod Nimsara | Team WhiteShadow
 * Description: Upload any file (photo, video, doc, zip) to transfer.sh anonymously
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { cmd } from '../command.js';

async function uploadToTransfer(fileName, buffer) {
  const tempPath = path.resolve(`./${fileName}`);
  await fs.promises.writeFile(tempPath, buffer);

  const fileStream = fs.createReadStream(tempPath);

  try {
    const response = await axios({
      method: 'put',
      url: `https://transfer.sh/${encodeURIComponent(fileName)}`,
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      data: fileStream,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 0,
    });

    await fs.promises.unlink(tempPath);
    return response.data; // The direct link from transfer.sh
  } catch (err) {
    await fs.promises.unlink(tempPath).catch(() => {});
    throw err;
  }
}

cmd({
  pattern: 'uptransfer',
  alias: ['upload', 'anonupload'],
  desc: 'Upload any file to transfer.sh (no login)',
  react: '📤',
  category: 'tools',
}, async (conn, m) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';
  if (!mime) return await m.reply('⚠️ Reply with a photo, video, or file to upload.');

  const buffer = await q.download();
  if (!buffer) return await m.reply('❌ Failed to download file.');

  try {
    const ext = mime.split('/')[1] || 'bin';
    const fileName = q.filename || `WhiteShadow_${Date.now()}.${ext}`;
    const link = await uploadToTransfer(fileName, buffer);

    await m.reply(
      `✅ *Upload Successful!*\n\n📁 *File:* ${fileName}\n🔗 *Link:* ${link}\n\n_© WHITESHADOW-MD_`
    );
  } catch (err) {
    console.error('Transfer.sh error:', err);
    await m.reply(`❌ Upload failed: ${err.message || err}`);
  }
});
