const { cmd } = require('../command');
const axios = require('axios');

// helper: extract a YouTube URL from args or quoted text
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
  desc: 'Download YouTube video (MP4) using Zenzx API with a clean preview card.',
  category: 'download',
  react: '📥',
  filename: __filename
},
/**
 * @param {import('@whiskeysockets/baileys').WASocket} conn
 * @param {*} mek
 * @param {*} m
 * @param {{from:string,args:string[],reply:Function,quoted?:any,store?:any,isOwner?:boolean}} ctx
 */
async (conn, mek, m, { from, args, reply, quoted }) => {
  try {
    // 1) get URL from args or quoted
    const provided = args.join(' ').trim() || (quoted && (quoted.text || quoted.caption)) || '';
    const ytUrl = extractUrl(provided);

    if (!ytUrl) {
      return reply('🧩 *Usage:* .ytmp4x <youtube-url>\n👉 You can also reply to a message containing a YouTube link.\n\n*Examples:*\n.ytmp4x https://youtu.be/dQw4w9WgXcQ\n.ytmp4x https://youtube.com/shorts/xxxxxxxx');
    }

    // 2) call API
    const api = `https://api.zenzxz.my.id/downloader/ytmp4?url=${encodeURIComponent(ytUrl)}`;
    await reply('⏳ Fetching video info...');

    const { data } = await axios.get(api, { timeout: 30_000, headers: { 'User-Agent': 'WhiteShadow-MD/1.0' } });

    if (!data || data.status !== true || !data.download_url) {
      return reply('❌ Failed to fetch. Try another link or later.');
    }

    const title = (data.title || 'YouTube Video').trim();
    const duration = data.duration ? `${data.duration}s` : '—';
    const format = data.format || 'MP4';
    const thumb = data.thumbnail || 'https://i.ytimg.com/img/no_thumbnail.jpg';
    const dl = data.download_url;

    // 3) nice preview card
    const caption = `*🎬 ${title}*\n⌛ Duration: *${duration}*\n🧩 Format: *${format}*\n\n➡️ *Auto-sending video...*`;

    try {
      await conn.sendMessage(from, {
        image: { url: thumb },
        caption,
        contextInfo: {
          externalAdReply: {
            title: 'YT MP4 • WhiteShadow-MD',
            body: 'Tap to open in browser',
            thumbnailUrl: thumb,
            mediaType: 1,
            renderLargerThumbnail: true,
            showAdAttribution: true,
            sourceUrl: dl
          }
        }
      }, { quoted: m });
    } catch (e) {
      // ignore preview errors
    }

    // 4) try sending the video directly
    try {
      await conn.sendMessage(from, {
        video: { url: dl },
        fileName: `${title.replace(/[\\/:*?"<>|]/g, '')}.mp4`,
        mimetype: 'video/mp4',
        caption: `✅ Downloaded: *${title}*\n📥 Powered by whiteshadow-MD`
      }, { quoted: m });
    } catch (err) {
      // 5) fallback: just give the link
      await reply(`⚠️ I couldn't upload the file due to size/limits.\n\n*Direct Download:* ${dl}`);
    }
  } catch (e) {
    console.error('ytmp4x error =>', e?.message || e);
    reply('🚫 An unexpected error occurred. Please try again in a moment.');
  }
});
