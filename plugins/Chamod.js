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
  pattern: 'videox',
  alias: ['ytquality', 'ytdl'],
  desc: 'Download YouTube video with quality selection (360p / 720p / 1080p)',
  category: 'download',
  react: '🎥',
  filename: __filename
}, 
async (conn, mek, m, { from, args, reply, quoted }) => {
  try {
    let provided = args.join(' ').trim() || (quoted && (quoted.text || quoted.caption)) || '';
    let ytUrl = extractUrl(provided);

    // 🔍 search if not a link
    if (!ytUrl) {
      if (!provided) return reply('🧩 *Usage:* .videox <YouTube link or name>\nOr reply to a message with a link.');
      const search = await yts(provided);
      if (!search?.all?.length) return reply('❌ No results found.');
      ytUrl = search.all[0].url;
      await reply(`🔎 Found: *${search.all[0].title}*\n\nChoose quality below 👇`);
    }

    // 🧠 quality selection menu
    const menuMsg = `🎬 *Select Video Quality*\n\n1️⃣ 360p\n2️⃣ 720p\n3️⃣ 1080p\n\n👉 Reply with the *number* of your choice.`;
    const sent = await conn.sendMessage(from, { text: menuMsg }, { quoted: m });

    // 🕒 wait for user reply
    const chosen = await conn.waitForMessage(from, mek.sender, 30_000); // 30s timeout
    if (!chosen) return reply('⌛ Timeout. Please try again.');

    const userReply = chosen.message?.extendedTextMessage?.text?.trim() || chosen.text?.trim();
    const option = parseInt(userReply);

    let format;
    if (option === 1) format = '360';
    else if (option === 2) format = '720';
    else if (option === 3) format = '1080';
    else return reply('❌ Invalid option. Please reply 1 / 2 / 3.');

    await reply(`📦 Fetching *${format}p* video...`);

    // 🧩 call Izumi API
    const apiUrl = `https://izumiiiiiiii.dpdns.org/downloader/youtube?url=${encodeURIComponent(ytUrl)}&format=${format}`;
    const { data } = await axios.get(apiUrl, { headers: { accept: '*/*' }, timeout: 40000 });

    if (!data?.status || !data?.result?.download)
      return reply('❌ Failed to fetch download link.');

    const { title, thumbnail, metadata, author, download } = data.result;

    const caption = `*🎬 ${title}*\n📺 Quality: *${format}p*\n👤 Channel: *${author?.channelTitle || 'Unknown'}*\n👁️ Views: *${metadata?.view || '—'}*\n🕓 Duration: *${metadata?.duration || '—'}*\n\n📥 Downloading...`;

    // 🖼️ preview
    await conn.sendMessage(from, { image: { url: thumbnail }, caption }, { quoted: m });

    // 🎞️ send video or fallback
    try {
      await conn.sendMessage(from, {
        video: { url: download },
        fileName: `${title.replace(/[\\/:*?"<>|]/g, '')}-${format}p.mp4`,
        mimetype: 'video/mp4',
        caption: `✅ *Downloaded by WhiteShadow-MD*\n🎬 ${title}`
      }, { quoted: m });

    } catch (err) {
      await reply(`⚠️ File too large, sending as document...`);
      await conn.sendMessage(from, {
        document: { url: download },
        mimetype: 'video/mp4',
        fileName: `${title.replace(/[\\/:*?"<>|]/g, '')}-${format}p.mp4`,
        caption: `✅ *Downloaded by WhiteShadow-MD*\n🎬 ${title}`
      }, { quoted: m });
    }

  } catch (e) {
    console.error('videox cmd error =>', e?.message || e);
    reply('🚫 Error fetching video. Try again later.');
  }
});
