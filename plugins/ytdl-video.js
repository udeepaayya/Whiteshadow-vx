const { cmd } = require('../command');
const axios = require('axios');
const yts = require('yt-search');

function extractUrl(text = '') {
  if (!text) return null;
  const urlRegex = /(https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\/[\w\-?=&%.#\/]+)|(youtube\.com\/[\w\-?=&%.#\/]+)/i;
  const match = text.match(urlRegex);
  if (!match) return null;
  return match[0].startsWith('http') ? match[0] : `https://${match[0]}`;
}

cmd({
  pattern: 'video',
  alias: ['mp40','ytmp4'],
  desc: 'Download YouTube video (MP4) using Keith API.',
  category: 'download',
  react: '📥',
  filename: __filename
},
async (conn, mek, m, { from, args, reply, quoted }) => {
  try {
    let provided = args.join(' ').trim() || (quoted && (quoted.text || quoted.caption)) || '';
    let ytUrl = extractUrl(provided);

    // 🔹 If not a YouTube URL → search with yt-search
    if (!ytUrl) {
      if (!provided) return reply('🧩 *Usage:* .video <youtube-url | search query>\n👉 Or reply to a message containing a YouTube link.');
      const search = await yts(provided);
      if (!search?.all?.length) return reply('❌ No results found on YouTube.');
      ytUrl = search.all[0].url;
      await reply(`🔎 Found: *${search.all[0].title}* \n\n⏳ Fetching video info...`);
    } else {
      await reply('⏳ Fetching video info...');
    }

    // 🔹 Keith API
    const api = `https://apis-keith.vercel.app/download/ytmp4?url=${encodeURIComponent(ytUrl)}`;
    const { data } = await axios.get(api, { timeout: 30_000, headers: { 'User-Agent': 'WhiteShadow-MD/1.0' } });

    if (!data || data.status !== true || !data.result?.url) {
      return reply('❌ Failed to fetch. Try another link or later.');
    }

    const { url: download_url, filename } = data.result;

    // check size with HEAD request
    let sizeMB = 0;
    try {
      const head = await axios.head(download_url, { timeout: 15000 });
      sizeMB = parseInt(head.headers['content-length'] || '0', 10) / (1024 * 1024);
    } catch (err) {
      console.warn("Couldn't fetch file size:", err?.message);
    }

    const safeName = (filename || 'video').replace(/[\\/:*?"<>|]/g, '');

    if (sizeMB && sizeMB > 90) {
      // send as document if >90MB
      await conn.sendMessage(from, {
        document: { url: download_url },
        fileName: safeName.endsWith('.mp4') ? safeName : `${safeName}.mp4`,
        mimetype: 'video/mp4',
        caption: `✅ Downloaded (Document Mode)\n🎬 *${safeName}*\n📦 Size: ~${sizeMB.toFixed(1)} MB\n\n📥 POWERED BY WHITESHADOW-MD`
      }, { quoted: m });
    } else {
      // normal send as video
      await conn.sendMessage(from, {
        video: { url: download_url },
        fileName: safeName.endsWith('.mp4') ? safeName : `${safeName}.mp4`,
        mimetype: 'video/mp4',
        caption: `✅ Downloaded: *${safeName}*\n📥 POWERED BY WHITESHADOW-MD`
      }, { quoted: m });
    }

  } catch (e) {
    console.error('video cmd error =>', e?.message || e);
    reply('🚫 An unexpected error occurred. Please try again.');
  }
});
