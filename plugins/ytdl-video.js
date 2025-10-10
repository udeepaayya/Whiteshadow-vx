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
  alias: ['ytmp4', 'mp40'],
  desc: 'Download YouTube video using Izumi API (auto document fallback).',
  category: 'download',
  react: '📥',
  filename: __filename
},
async (conn, mek, m, { from, args, reply, quoted }) => {
  try {
    let provided = args.join(' ').trim() || (quoted && (quoted.text || quoted.caption)) || '';
    let ytUrl = extractUrl(provided);

    if (!ytUrl) {
      if (!provided) return reply('🧩 *Usage:* .video <YouTube link or name>\nOr reply to a message with a link.');
      const search = await yts(provided);
      if (!search?.all?.length) return reply('❌ No results found.');
      ytUrl = search.all[0].url;
      await reply(`🔎 Found: *${search.all[0].title}*\n\n⏳ Fetching video...`);
    } else {
      await reply('⏳ Fetching video info...');
    }

    const apiUrl = `https://izumiiiiiiii.dpdns.org/downloader/youtube?url=${encodeURIComponent(ytUrl)}&format=360`;
    const { data } = await axios.get(apiUrl, { headers: { accept: '*/*' }, timeout: 30000 });

    if (!data?.status || !data?.result?.download)
      return reply('❌ Failed to fetch download link.');

    const { title, thumbnail, metadata, author, download } = data.result;

    const caption = `*🎬 ${title}*\n👤 Channel: *${author?.channelTitle || 'Unknown'}*\n👁️ Views: *${metadata?.view || '—'}*\n👍 Likes: *${metadata?.like || '—'}*\n🕓 Duration: *${metadata?.duration || '—'}*\n\n📥 Downloading...`;

    // 🖼️ Thumbnail preview
    await conn.sendMessage(from, { image: { url: thumbnail }, caption }, { quoted: m });

    // 🎞️ Try sending video first
    try {
      await conn.sendMessage(from, {
        video: { url: download },
        fileName: `${title.replace(/[\\/:*?"<>|]/g, '')}.mp4`,
        mimetype: 'video/mp4',
        caption: `✅ *Downloaded by WhiteShadow-MD*\n🎬 ${title}`
      }, { quoted: m });

    } catch (err) {
      // ⚠️ Fallback → send as document
      await reply(`⚠️ Video too large, sending as document...`);
      await conn.sendMessage(from, {
        document: { url: download },
        mimetype: 'video/mp4',
        fileName: `${title.replace(/[\\/:*?"<>|]/g, '')}.mp4`,
        caption: `✅ *Downloaded by WhiteShadow-MD*\n🎬 ${title}`
      }, { quoted: m });
    }

  } catch (e) {
    console.error('video cmd error =>', e?.message || e);
    reply('🚫 Error fetching video. Try again later.');
  }
});
