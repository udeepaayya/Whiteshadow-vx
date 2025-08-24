// plugins/updf.js
// WHITESHADOW-MD: Upload any quoted file to uploadf.com
// Requires Node 18+ (global fetch/FormData/File). If you use older Node, install 'form-data' and adapt.

import { cmd } from '../command.js';
import { fileTypeFromBuffer } from 'file-type';

const origin = 'https://uploadf.com';

async function uploadToUploadF(buffer) {
  const info = (await fileTypeFromBuffer(buffer)) || { ext: 'bin', mime: 'application/octet-stream' };
  const file = new File([buffer], `${Date.now()}.${info.ext}`, { type: info.mime });

  const form = new FormData();
  form.append('upfile', file);

  const res = await fetch(origin + '/upload.php', { method: 'POST', body: form });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

  // uploadf returns a redirect; the final Response.url contains the created file path
  const fileId = '/' + res.url.split('/').pop();
  const web = origin + '/s' + fileId;
  const downloadUrl = origin + '/file' + fileId;
  const qr = downloadUrl + '.qr';

  return { downloadUrl, qr, web, mime: info.mime };
}

cmd({
  pattern: 'updf',
  alias: ['upfile'],
  desc: 'Upload quoted/replied file to uploadf.com and get links + QR.',
  category: 'tools',
  react: '☁️',
  filename: __filename
}, 
async (conn, mek, m, { reply }) => {
  try {
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || '';

    if (!mime) {
      return reply('📎 Reply/quote කරලා upload කරන්න ඕන file එකක් දාන්න.');
    }

    await reply('⏫ Uploading… රෑන්ඩ් වෙන්න 😌');

    const buffer = await q.download?.();
    if (!buffer) throw new Error('Could not download the media from message.');

    const result = await uploadToUploadF(buffer);

    const caption = [
      '＊⌜ File uploaded successfully ⌟＊',
      '',
      `• Size : ${buffer.length} bytes`,
      `• Type : ${mime}`,
      `• Web Link : ${result.web}`,
      `• Download : ${result.downloadUrl}`
    ].join('\n');

    // Try sending QR as image (UploadF auto-provides a QR PNG via .qr)
    try {
      await conn.sendMessage(m.chat, { image: { url: result.qr }, caption }, { quoted: m });
    } catch {
      // Fallback to text only
      await reply(caption + `\n\n(⚠️ QR preview failed. Open: ${result.qr})`);
    }
  } catch (e) {
    await reply('❌ Error: ' + (e?.message || e));
  }
});
