// plugins/updf.js
import { cmd } from '../command.js';
import fileType from "file-type";

const origin = 'https://uploadf.com';

async function uploadToUploadF(buffer) {
  const info = (await fileType.fromBuffer(buffer)) || { ext: 'bin', mime: 'application/octet-stream' };
  const file = new File([buffer], `${Date.now()}.${info.ext}`, { type: info.mime });

  const form = new FormData();
  form.append('upfile', file);

  const res = await fetch(origin + '/upload.php', { method: 'POST', body: form });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

  const fileId = '/' + res.url.split('/').pop();
  const web = origin + '/s' + fileId;
  const downloadUrl = origin + '/file' + fileId;
  const qr = downloadUrl + '.qr';

  return { downloadUrl, qr, web, mime: info.mime };
}

cmd({
  pattern: 'updf',
  alias: ['upfile'],
  desc: 'Upload quoted/replied file to uploadf.com',
  category: 'tools',
  react: '☁️',
  filename: __filename
}, 
async (conn, mek, m, { reply }) => {
  try {
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || '';

    if (!mime) return reply('📎 Reply කරලා upload කරන්න ඕන file එකක් දාන්න.');

    // React while uploading
    await conn.sendMessage(m.chat, { react: { text: "⏫", key: m.key } });

    const buffer = await q.download?.();
    if (!buffer) throw new Error('Could not download file.');

    const result = await uploadToUploadF(buffer);

    // ⚡ Branded caption
    const caption = `
┏━━━〔 *WHITESHADOW-MD* 〕━━━┓
┃ ✅ *File uploaded successfully*
┃
┃ 📦 *Size* : ${buffer.length} bytes
┃ 📂 *Type* : ${mime}
┃ 🌐 *Web*  : ${result.web}
┃ ⬇️ *Download* : ${result.downloadUrl}
┗━━━━━━━━━━━━━━━━━━━━━━━┛
    `.trim();

    // React success ⚡
    await conn.sendMessage(m.chat, { react: { text: "⚡", key: m.key } });

    // Send QR + caption
    await conn.sendMessage(m.chat, { image: { url: result.qr }, caption }, { quoted: m });
  } catch (e) {
    await reply('❌ Error: ' + (e?.message || e));
  }
});
