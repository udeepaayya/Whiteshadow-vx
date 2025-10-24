/*
 * Mega.nz Upload Plugin - Clear Version
 * Author: ZenzzXD
 */

import { Storage } from 'megajs';
import { cmd } from '../command.js';

// මෙහි ඔබේ Gmail එක සහ Password එක
const email = 'gsbxbbsbxb@gmail.com';
const password = 'WHITESHADOW-MD';

async function uploadToMega(fileName, buffer) {
  const storage = await new Storage({ email, password }).ready;
  const file = await storage.upload(fileName, buffer).complete;
  return await file.link();
}

cmd({
  pattern: 'upmeganz',
  alias: ['megaupload'],
  desc: 'Upload video/audio/doc file to Mega.nz',
  react: '📤',
  tags: ['tools']
}, async (conn, m) => {
  // quoted message එක තියෙනවා නම් ඒක download කරන්න
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || '';
  if (!mime) return m.reply('Reply a file with this command.');

  let buffer = await q.download();
  if (!buffer) return m.reply('Failed to download file.');

  try {
    let fileName = q.filename || `file_${Date.now()}`;
    let link = await uploadToMega(fileName, buffer);
    m.reply(`✅ File uploaded successfully!\n\nFile Name: ${fileName}\nMega Link: ${link}`);
  } catch (err) {
    m.reply(`❌ Error: ${err.message}`);
  }
});
