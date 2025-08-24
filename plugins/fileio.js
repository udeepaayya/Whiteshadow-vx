// plugins/upfileio.js
import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fetch from 'node-fetch';
import FormData from 'form-data';

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
async function uploadToFileIO(buffer) {
  const form = new FormData();
  form.append('file', new Blob([buffer]), `${Date.now()}.bin`);

  const res = await fetch('https://file.io', { method: 'POST', body: form });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

  const data = await res.json();
  if (!data.success) throw new Error('❌ Upload failed');

  const downloadUrl = data.link;
  const qr = downloadUrl + '.qr'; // optionally generate QR externally
  return { downloadUrl, qr, web: downloadUrl, mime: 'application/octet-stream' };
}

// Command
cmd({
  pattern: 'upfileio',
  alias: ['upio'],
  desc: 'Upload one or more files to file.io',
  category: 'tools',
  react: '☁️',
  filename: __filename
}, async (conn, mek, m, { reply }) => {
  try {
    const files = m.quoted ? (Array.isArray(m.quoted.msg) ? m.quoted.msg : [m.quoted]) : [m];
    if (!files || files.length === 0) return reply('📎 Reply/Send file(s) to upload.');

    await conn.sendMessage(m.chat, { react: { text: "⏫", key: m.key } }); // uploading react

    let results = [];

    for (let q of files) {
      try {
        const mime = (q.msg || q).mimetype || 'application/octet-stream';
        const buffer = await q.download?.();
        if (!buffer) throw new Error('❌ Could not download file.');

        const result = await uploadToFileIO(buffer);

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

    // Build final message
    let text = '┏━━━〔 *WHITESHADOW-MD* 〕━━━┓\n';
    results.forEach((r, i) => {
      if (r.error) text += `┃ ❌ File ${i + 1}: ${r.error}\n`;
      else text += `┃ ✅ File ${i + 1} uploaded\n┃ 📦 Size: ${r.size}\n┃ 📂 Type: ${r.type}\n┃ 🌐 Web: ${r.web}\n┃ ⬇️ Download: ${r.downloadUrl}\n`;
      text += '┃\n';
    });
    text += '┗━━━━━━━━━━━━━━━━━━━━━━━┛';

    await conn.sendMessage(m.chat, { react: { text: "⚡", key: m.key } }); // success react

    // Send first QR as preview (optional)
    const firstQR = results.find(r => !r.error)?.qr;
    if (firstQR) await conn.sendMessage(m.chat, { image: { url: firstQR }, caption: text }, { quoted: m });
    else await reply(text);

  } catch (e) {
    await reply('❌ Error: ' + (e?.message || e));
  }
});
