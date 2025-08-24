import { cmd } from '../command.js';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Fix for __filename & __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

cmd({
    pattern: 'videox',
    desc: 'Download YouTube video with resolution options',
    category: 'downloader',
    react: '🎬',
    filename: __filename
}, async (conn, mek, m, { text, reply }) => {
    try {
        if (!text) return reply('YouTube link ekak danna. Example: videox <link>');

        // Fetch video info from zenzxz API
        const apiURL = `https://api.zenzxz.my.id/downloader/aio?url=${encodeURIComponent(text)}`;
        const { data } = await axios.get(apiURL);

        if (!data || !data.result) return reply('Video info ganna bari una.');

        const video = data.result;

        // Thumbnail + caption
        const caption = `
🎬 *${video.title}*
📄 ${video.description || 'No description'}
🔗 Choose resolution:
1️⃣ 1080p
2️⃣ 720p
3️⃣ 480p
4️⃣ 360p

Reply number ekak danna video download karanna.
Powered by WHITESHADOW MD 👑️
        `.trim();

        await conn.sendFile(m.from, video.thumbnail, 'thumbnail.jpg', caption, m);

        // Reply listener for resolution selection
        conn.onReply(m.key.id, async (res) => {
            const choice = res.text.trim();
            let url;

            switch (choice) {
                case '1':
                    url = video.video['1080p'];
                    break;
                case '2':
                    url = video.video['720p'];
                    break;
                case '3':
                    url = video.video['480p'];
                    break;
                case '4':
                    url = video.video['360p'];
                    break;
                default:
                    return reply('Invalid choice! 1-4 danna.');
            }

            if (!url) return reply('Selected resolution unavailable.');

            await conn.sendFile(m.from, url, `${video.title}.mp4`, `Downloaded ${choice}p video. Powered by WHITESHADOW MD 👑️`, res);
        });

    } catch (err) {
        console.log(err);
        reply('Video download karanna error ekak ayi.');
    }
});
