//════════════════════════════════════════════════════════════════════════════════════════════//
//                                                                                             //
//                      WHITESHADOW-MD | AILABS IMAGE & VIDEO GENERATOR                        //
//                                                                                             //
//════════════════════════════════════════════════════════════════════════════════════════════//

import axios from 'axios';
import chalk from 'chalk';
import FormData from 'form-data';
import { cmd } from '../command.js';

cmd({
    pattern: "ailabs",
    desc: "Generate image or video via AI Labs",
    category: "ai",
    react: "🎨",
    use: ".ailabs prompt --image|--video",
    filename: __filename
}, async (conn, m, { args }) => {
    try {
        if (!args.length) return m.reply('❌ Prompt එක දෙන්න.\nඋදා: `.ailabs anime girl --image`');

        let type = 'image';
        if (args.includes('--video')) type = 'video';
        let prompt = args.filter(a => a !== '--image' && a !== '--video').join(' ').trim();

        if (!prompt) return m.reply('❌ Valid prompt එකක් දෙන්න.');

        let result = await aiLabs.generate({ prompt, type });

        if (!result.success) return m.reply(`❌ Error: ${result.result.error}`);

        if (type === 'image') {
            await conn.sendMessage(m.chat, {
                image: { url: result.result.url },
                caption: `🖌️ Prompt: ${result.result.prompt}`
            }, { quoted: m });
        } else {
            await conn.sendMessage(m.chat, {
                video: { url: result.result.url },
                caption: `🎬 Prompt: ${prompt}`
            }, { quoted: m });
        }

    } catch (err) {
        console.error(err);
        m.reply(`❌ Error: ${err.message}`);
    }
});


//════════════════════════════════════════════════════════════════════════════════════════════//
//                                   AI LABS API SYSTEM                                        //
//════════════════════════════════════════════════════════════════════════════════════════════//

const aiLabs = {
    api: {
        base: 'https://text2video.aritek.app',
        endpoints: {
            text2img: '/text2img',
            generate: '/txt2videov3',
            video: '/video'
        }
    },
    headers: {
        'user-agent': 'NB Android/1.0.0',
        'accept-encoding': 'gzip',
        'content-type': 'application/json',
        authorization: ''
    },
    state: { token: null },
    setup: {
        cipher: 'hbMcgZLlzvghRlLbPcTbCpfcQKM0PcU0zhPcTlOFMxBZ1oLmruzlVp9remPgi0QWP0QW',
        shiftValue: 3,
        dec(text, shift) {
            return [...text].map(c =>
                /[a-z]/.test(c) ?
                String.fromCharCode((c.charCodeAt(0) - 97 - shift + 26) % 26 + 97) :
                /[A-Z]/.test(c) ?
                String.fromCharCode((c.charCodeAt(0) - 65 - shift + 26) % 26 + 65) :
                c
            ).join('');
        },
        decrypt: async () => {
            if (aiLabs.state.token) return aiLabs.state.token;
            const decrypted = aiLabs.setup.dec(aiLabs.setup.cipher, aiLabs.setup.shiftValue);
            aiLabs.state.token = decrypted;
            aiLabs.headers.authorization = decrypted;
            return decrypted;
        }
    },
    deviceId() {
        return Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    },
    text2img: async (prompt) => {
        const token = await aiLabs.setup.decrypt();
        const form = new FormData();
        form.append('prompt', prompt);
        form.append('token', token);
        try {
            const res = await axios.post(aiLabs.api.base + aiLabs.api.endpoints.text2img, form, {
                headers: { ...aiLabs.headers, ...form.getHeaders() }
            });
            const { code, url: imageUrl } = res.data;
            if (code !== 0 || !imageUrl) {
                return { success: false, result: { error: 'Image generate failed' } };
            }
            return { success: true, result: { url: imageUrl.trim(), prompt } };
        } catch (err) {
            return { success: false, result: { error: err.message } };
        }
    },
    generate: async ({ prompt = '', type = 'video', isPremium = 1 } = {}) => {
        if (type === 'image') return await aiLabs.text2img(prompt);
        await aiLabs.setup.decrypt();
        const payload = {
            deviceID: aiLabs.deviceId(),
            isPremium,
            prompt,
            used: [],
            versionCode: 59
        };
        try {
            const res = await axios.post(aiLabs.api.base + aiLabs.api.endpoints.generate, payload, { headers: aiLabs.headers });
            const { code, key } = res.data;
            if (code !== 0 || !key) {
                return { success: false, result: { error: 'Video key fetch failed' } };
            }
            return await aiLabs.video(key);
        } catch (err) {
            return { success: false, result: { error: err.message } };
        }
    },
    video: async (key) => {
        await aiLabs.setup.decrypt();
        const payload = { keys: [key] };
        const delay = 2000;
        for (let i = 0; i < 100; i++) {
            try {
                const res = await axios.post(aiLabs.api.base + aiLabs.api.endpoints.video, payload, {
                    headers: aiLabs.headers, timeout: 15000
                });
                const { code, datas } = res.data;
                if (code === 0 && Array.isArray(datas) && datas[0].url) {
                    return { success: true, result: { url: datas[0].url.trim() } };
                }
                await new Promise(r => setTimeout(r, delay));
            } catch (err) {
                await new Promise(r => setTimeout(r, delay));
            }
        }
        return { success: false, result: { error: 'Video generation timeout' } };
    }
};

export default aiLabs;
