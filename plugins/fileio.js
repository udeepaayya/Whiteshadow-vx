// plugins/upfileio.js
import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fetch from 'node-fetch';
import FormData from 'form-data';
import QRCode from 'qrcode';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Human-readable file size
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Upload buffer to file.io
async function uploadToFileIO(buffer, originalName = 'file') {
  const form = new FormData();
  form.append('file', buffer, { filename: originalName });

  const res = await fetch('https://file.io', { method: 'POST', body: form });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

  const data = await res.json();
  if (!data.success) throw new Error('❌ Upload failed');

  const downloadUrl = data.link;
  const qr = await QRCode.toDataURL(downloadUrl);
  return { downloadUrl, qr, web: downloadUrl };
}

// Command
cmd({
  pattern: 'upfileio',
  alias: ['upio'],
  desc: 'Upload files to file.io and get download links with QR',
  category: 'tools',
  react: '☁️',
  filename: __filename
}, async (conn, mek, m, { reply }) => {
  try {
    const files = m.quoted ? [m.quoted] : [m];
    if (!files || files.length === 0) return reply('📎 Reply/Send file(s) to upload.');

    await conn.sendMessage(m.chat, { react: { text: "⏫", key: m.key } });

    let results = [];

    for (let q of files) {
      try {
        const mime = (q.msg || q).mimetype || 'application/octet-stream';
        const ext = mime.split('/')[1] || 'bin';
        const buffer = await q.download?.();
        if (!buffer) throw new Error('❌ Could not download file.');

        const result = await uploadToFileIO(buffer, `${Date.now()}.${ext}`);

        results.push({
          size: formatBytes(buffer.length),
          type: mime,
          web: result.web,
          downloadUrl: result.downloadUrl,
          qr: result.qr
        });
      } catch (e) {
        results.push({ error: e.message });
      }
    }

    // Build WHITESHADOW-MD style message
    let text = '┏━━━〔 *WHITESHADOW-MD* 〕━━━┓\n';
    results.forEach((r, i) => {
      if (r.error) text += `┃ ❌ File ${i + 1}: ${r.error}\n`;
      else text += `┃ ✅ File ${i + 1} uploaded\n┃ 📦 Size: ${r.size}\n┃ 📂 Type: ${r.type}\n┃ 🌐 Web: ${r.web}\n┃ ⬇️ Download: ${r.downloadUrl}\n`;
      text += '┃\n';
    });
    text += '┗━━━━━━━━━━━━━━━━━━━━━━━┛';

    await conn.sendMessage(m.chat, { react: { text: "⚡", key: m.key } });

    // Send all QR images as separate messages
    for (let r of results) {
      if (!r.error && r.qr) {
        await conn.sendMessage(m.chat, { image: { url: r.qr }, caption: `QR Code for ${r.downloadUrl}` }, { quoted: m });
      }
    }

  } catch (e) {
    await reply('❌ Error: ' + (e?.message || e));
  }
});
