const { cmd } = require('../command');
const fetch = require('node-fetch');
const yts = require('yt-search');

function extractUrl(text = '') {
    if (!text) return null;
    const urlRegex = /(https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\/[\w\-?=&%.#\/]+)|(youtube\.com\/[\w\-?=&%.#\/]+)/i;
    const match = text.match(urlRegex);
    if (!match) return null;
    return match[0].startsWith('http') ? match[0] : `https://${match[0]}`;
}

cmd({
    pattern: 'ytmp4s',
    alias: ['yt','ytvideo','st','yt','ytshort','ytshorts'],
    desc: 'Download YouTube video in SD (720p) quality (document type) using Gtech API.',
    category: 'download',
    react: '📥',
    filename: __filename
}, async (conn, m, mek, { from, args, reply, quoted }) => {
    try {
        const provided = args.join(' ').trim() || (quoted && (quoted.text || quoted.caption)) || '';
        if (!provided) return reply('🧩 *Usage:* .ytmp4sd <youtube-url>\n👉 Or reply to a message containing a YouTube link.');

        await reply('⏳ Searching video...');

        let videoUrl = provided;

        // If not a direct YouTube URL, search
        if (!provided.match(/(youtube\.com|youtu\.be)/)) {
            const search = await yts(provided);
            if (!search.videos.length) return reply('❌ No results found!');
            videoUrl = search.videos[0].url;
        }

        // SD (720p) API
        const apiUrl = `https://gtech-api-xtp1.onrender.com/api/video/yt?apikey=APIKEY&url=${encodeURIComponent(videoUrl)}`;
        const res = await fetch(apiUrl);
        const data = await res.json();

        if (!data.status || !data.result?.media?.video_url) {
            return reply('❌ SD video not available!');
        }

        const media = data.result.media;
        const safeTitle = media.title.replace(/[\\/:*?"<>|]/g, '');

        // Preview card
        await conn.sendMessage(from, {
            image: { url: media.thumbnail },
            caption: `*🎬 ${media.title}*\n🧩 Quality: *SD 720p*\n⏱ Duration: *${media.duration || '—'} sec*\n\n➡️ *Auto-sending file...*`,
            contextInfo: {
                externalAdReply: {
                    title: 'YT MP4 SD • WhiteShadow-MD',
                    body: 'Tap to open in browser',
                    thumbnailUrl: media.thumbnail,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    showAdAttribution: true,
                    sourceUrl: videoUrl
                }
            }
        }, { quoted: m });

        // Download & send as document
        const fileRes = await fetch(media.video_url);
        const fileBuffer = await fileRes.arrayBuffer();

        await conn.sendMessage(from, {
            document: Buffer.from(fileBuffer),
            fileName: `${safeTitle}.mp4`,
            mimetype: 'video/mp4',
            caption: `✅ Downloaded SD (720p): *${media.title}*\n📥 POWERED BY WHITESHADOW-MD`
        }, { quoted: m });

    } catch (err) {
        console.error('ytmp4sd error =>', err);
        reply('🚫 Unexpected error. Try again later.');
    }
});
