import { cmd } from '../command.js';
import fetch from 'node-fetch';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

cmd({
    pattern: 'videox',
    desc: 'Download YouTube video with quality selection',
    category: 'downloader',
    react: '🎬',
    filename: __filename
}, async (conn, mek, m, { text, reply }) => {
    try {
        if(!text) return reply('⚠️ Please provide a YouTube URL.');

        // API call
        let res = await fetch(`https://api.agatz.xyz/api/ytmp4?url=${encodeURIComponent(text)}`);
        let data = await res.json();
        if(!data.status) return reply('❌ Video not found.');

        let videoOptions = data.result.medias.filter(v => v.type === 'video');

        // Build caption with video info + options
        let caption = `*🎬 ${data.result.title}*\n\n${data.result.desc}\n\n` +
                      `*Select Quality by replying number:*\n`;
        videoOptions.forEach((v, i) => {
            caption += `${i + 1}. ${v.quality}\n`;
        });

        caption += `\n*Powered by WHITESHADOW MD 👑️*`;

        // Send thumbnail + caption
        await conn.sendMessage(m.from, {
            image: { url: data.result.thumb },
            caption,
        }, { quoted: m });

        // Listen for reply for quality selection
        const filter = (replyMsg) => replyMsg.message?.conversation && /^[1-9]\d*$/.test(replyMsg.message.conversation);
        conn.on('message', async (replyMsg) => {
            if(!filter(replyMsg)) return;
            if(replyMsg.key.remoteJid !== m.from) return; // only same chat
            let choice = parseInt(replyMsg.message.conversation) - 1;
            if(videoOptions[choice]) {
                await conn.sendMessage(m.from, {
                    video: { url: videoOptions[choice].url },
                    caption: `🎬 ${videoOptions[choice].quality} video\n\n*Powered by WHITESHADOW MD 👑️*`
                }, { quoted: m });
            }
        });

    } catch(err) {
        console.error(err);
        reply('❌ Error fetching video.');
    }
});
