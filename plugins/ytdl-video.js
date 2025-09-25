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
  alias: ['mp40', 'ytmp4', 'vd'],
  desc: 'Download YouTube video as document to bypass WhatsApp size limits.',
  category: 'download',
  react: '📁',
  filename: __filename
},
async (conn, mek, m, { from, args, reply, quoted }) => {
  try {
    let provided = args.join(' ').trim() || (quoted && (quoted.text || quoted.caption)) || '';
    let ytUrl = extractUrl(provided);

    if (!ytUrl) {
      if (!provided) return reply('🧩 *Usage:* .video <youtube-url | search query>\n👉 Or reply to a message containing a YouTube link.');

      const search = await yts(provided);
      if (!search?.all?.length) return reply('❌ No results found on YouTube.');

      ytUrl = search.all[0].url;
      await reply(`🔎 Found: *${search.all[0].title}* \n\n⏳ Fetching video info...`);
    } else {
      await reply('⏳ Fetching video info...');
    }

    // 🔹 Zenzx API
    const api = `https://api.zenzxz.my.id/downloader/ytmp4?url=${encodeURIComponent(ytUrl)}`;
    const { data } = await axios.get(api, { timeout: 30_000, headers: { 'User-Agent': 'WhiteShadow-MD/1.0' } });

    if (!data || data.status !== true || !data.download_url) {
      return reply('❌ Failed to fetch. Try another link or later.');
    }

    const { title, thumbnail, download_url, format, duration } = data;
    const caption = `*🎬 ${title}*\n🧩 Quality: *${format || '—'}*\n⏱ Duration: *${duration || '—'} sec*\n\n➡️ Sent as document to bypass WhatsApp limits.\n*Direct Download:* ${download_url}`;

    // 🔹 Send as document
    await conn.sendMessage(from, {
      document: { url: download_url },
      fileName: `${title.replace(/[\\/:*?"<>|]/g, '')}.mp4`,
      mimetype: 'application/octet-stream',
      caption
    }, { quoted: m });

  } catch (e) {
    console.error('video cmd error =>', e?.message || e);
    reply('🚫 An unexpected error occurred. Please try again.');
  }
});
