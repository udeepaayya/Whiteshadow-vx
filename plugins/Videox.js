const { cmd } = require('../command');
const axios = require('axios');

function extractUrl(text = '') {
  if (!text) return null;
  const urlRegex = /(https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\/[\w\-?=&%.#\/]+)|(youtube\.com\/[\w\-?=&%.#\/]+)/i;
  const match = text.match(urlRegex);
  if (!match) return null;
  return match[0].startsWith('http') ? match[0] : `https://${match[0]}`;
}

cmd({
  pattern: 'ytmp4x',
  alias: ['yt','ytshort','ytshorts'],
  desc: 'Download YouTube video (MP4) using ZenzzXD API (document type).',
  category: 'download',
  react: '📥',
  filename: __filename
},
async (conn, mek, m, { from, args, reply, quoted }) => {
  try {
    const provided = args.join(' ').trim() || (quoted && (quoted.text || quoted.caption)) || '';
    const ytUrl = extractUrl(provided);

    if (!ytUrl) {
      return reply('🧩 *Usage:* .ytmp4x <youtube-url>\n👉 Or reply to a message containing a YouTube link.');
    }

    const api = `https://api.zenzxz.my.id/downloader/ytmp4v2?url=${encodeURIComponent(ytUrl)}`;
    await reply('⏳ Fetching video info...');

    const { data } = await axios.get(api, { timeout: 30_000, headers: { 'User-Agent': 'WhiteShadow-MD/1.0' } });

    if (!data || data.status !== true || !data.download_url) {
      return reply('❌ Failed to fetch. Try another link or later.');
    }

    const { title, thumbnail, download_url, format, duration } = data;
    const safeTitle = title.replace(/[\\/:*?"<>|]/g, '');
    const caption = `*🎬 ${title}*\n🧩 Quality: *${format || '—'}*\n⏱ Duration: *${duration || '—'} sec*\n\n➡️ *Auto-sending file...*`;

    // Preview card
    await conn.sendMessage(from, {
      image: { url: thumbnail },
      caption,
      contextInfo: {
        externalAdReply: {
          title: 'YT MP4 • WhiteShadow-MD',
          body: 'Tap to open in browser',
          thumbnailUrl: thumbnail,
          mediaType: 1,
          renderLargerThumbnail: true,
          showAdAttribution: true,
          sourceUrl: ytUrl
        }
      }
    }, { quoted: m });

    // Download & send as document
    const file = await axios.get(download_url, { responseType: 'arraybuffer' });
    await conn.sendMessage(from, {
      document: file.data,
      fileName: `${safeTitle}.mp4`,
      mimetype: 'video/mp4',
      caption: `✅ Downloaded: *${title}*\n📥 POWERED BY WHITESHADOW-MD`
    }, { quoted: m });

  } catch (e) {
    console.error('ytmp4x error =>', e?.message || e);
    reply('🚫 Unexpected error. Try again later.');
  }
});
