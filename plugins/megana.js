/*
 * Mega.nz Universal Upload Plugin (Fixed)
 * Author: ZenzzXD | Modified by WhiteShadow
 */

import { Storage } from 'megajs';
import { cmd } from '../command.js';
import fs from 'fs';
import path from 'path';

// Mega.nz login credentials
const email = 'gsbxbbsbxb@gmail.com';
const password = 'WHITESHADOW-MD';

async function uploadToMega(fileName, buffer) {
  const tempPath = path.join('./', fileName);
  await fs.promises.writeFile(tempPath, buffer); // Save temp file

  const storage = await new Storage({ email, password }).ready;
  const upload = storage.upload(fileName, fs.createReadStream(tempPath));
  const file = await upload.complete;

  await fs.promises.unlink(tempPath); // Delete temp file after upload
  return await file.link();
}

cmd({
  pattern: 'upmeganz',
  alias: ['megaupload'],
  desc: 'Upload any file (photo, video, zip, audio, doc) to Mega.nz',
  react: '📤',
  category: 'tools'
}, async (conn, m) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';
  if (!mime) return m.reply('Reply a photo, video, or file with this command.');

  const buffer = await q.download();
  if (!buffer) return m.reply('Failed to download file.');

  try {
    const fileName = q.filename || `file_${Date.now()}.${mime.split('/')[1] || 'bin'}`;
    const link = await uploadToMega(fileName, buffer);
    await m.reply(`✅ **Upload Successful!**\n\n📁 *File:* ${fileName}\n🔗 *Mega Link:* ${link}`);
  } catch (err) {
    console.error(err);
    m.reply(`❌ Upload failed: ${err.message}`);
  }
});
