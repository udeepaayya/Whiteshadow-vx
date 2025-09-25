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
  alias: ['mp40', 'ytmp4'],
  desc: 'Download YouTube video (MP4) using Zenzx API.',
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

      ytUrl = search.all[0].url; // first result URL
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

    const { title, thumbnail, format, download_url, duration } = data;
    const caption = `*🎬 ${title}*\n🧩 Quality: *${format || '—'}*\n⏱ Duration: *${duration || '—'} sec*\n\n➡️ *Auto-sending video...*`;

    // Normal image preview
    await conn.sendMessage(from, {
      image: { url: thumbnail },
      caption
    }, { quoted: m });

    // Send video file
    try {
      await conn.sendMessage(from, {
        video: { url: download_url },
        fileName: `${title.replace(/[\\/:*?"<>|]/g, '')}.mp4`,
        mimetype: 'video/mp4',
        caption: `✅ Downloaded: *${title}*\n📥 POWERED BY WHITESHADOW-MD`
      }, { quoted: m });
    } catch (err) {
      await reply(`⚠️ I couldn't upload the file due to size/limits.\n\n*Direct Download:* ${download_url}`);
    }
  } catch (e) {
    console.error('video cmd error =>', e?.message || e);
    reply('🚫 An unexpected error occurred. Please try again.');
  }
});
