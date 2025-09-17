const { cmd } = require('../command');
const axios = require('axios');
const crypto = require('crypto');

async function veo3(prompt, { image = null } = {}) {
    try {
        if (!prompt) throw new Error('Prompt is required');
        
        const { data: cf } = await axios.post('https://cf.nekolabs.my.id/action', {
            mode: 'turnstile-min',
            siteKey: '0x4AAAAAAANuFg_hYO9YJZqo',
            url: 'https://aivideogenerator.me/features/g-ai-video-generator'
        });
        
        const num = Math.floor(Math.random() * 100) + 1700;
        const uid = crypto.createHash('md5').update(Date.now().toString()).digest('hex');
        const { data: task } = await axios.post('https://aiarticle.erweima.ai/api/v1/secondary-page/api/create', {
            prompt: prompt,
            imgUrls: image ? [image] : [],
            quality: '720p',
            duration: 8,
            autoSoundFlag: false,
            soundPrompt: '',
            autoSpeechFlag: false,
            speechPrompt: '',
            speakerId: 'Auto',
            aspectRatio: '16:9',
            secondaryPageId: num,
            channel: 'VEO3',
            source: 'aivideogenerator.me',
            type: 'features',
            watermarkFlag: true,
            privateFlag: true,
            isTemp: true,
            vipFlag: true,
            model: 'veo-3-fast'
        }, {
            headers: {
                uniqueid: uid,
                verify: cf.token
            }
        });
        
        while (true) {
            const { data } = await axios.get(`https://aiarticle.erweima.ai/api/v1/secondary-page/api/${task.data.recordId}`, {
                headers: {
                    uniqueid: uid,
                    verify: cf.token
                }
            });
            
            if (data.data.state === 'fail') return JSON.parse(data.data.completeData);
            if (data.data.state === 'success') return JSON.parse(data.data.completeData);
            await new Promise(res => setTimeout(res, 1000));
        }
    } catch (error) {
        throw new Error(error.message);
    }
}

// WHITESHADOW-MD Plugin
cmd({
  pattern: "veo3",
  desc: "Generate AI Video using VEO3",
  category: "maker",
  react: "🎬",
  use: ".veo3 <prompt> (reply with image optional)",
  filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide a prompt text machan!\nExample: .veo3 Make the character blink like a human");

        let quoted = m.quoted ? m.quoted : null;
        let imageUrl = null;

        if (quoted && (quoted.msg || quoted).mimetype && /(image\/jpeg|image\/png)/.test((quoted.msg || quoted).mimetype)) {
            const buffer = await quoted.download();
            // Upload to Catbox
            const tempPath = require('path').join(require('os').tmpdir(), `veo3_${Date.now()}.jpg`);
            require('fs').writeFileSync(tempPath, buffer);
            const FormData = require('form-data');
            const form = new FormData();
            form.append('fileToUpload', require('fs').createReadStream(tempPath), 'file.jpg');
            form.append('reqtype', 'fileupload');
            const res = await axios.post("https://catbox.moe/user/api.php", form, { headers: form.getHeaders() });
            imageUrl = res.data;
            require('fs').unlinkSync(tempPath);
        }

        await reply('⏳ Working on your AI video machan... this may take some time');

        const resp = await veo3(q, { image: imageUrl });
        if (!resp || !resp.videoUrl) return reply('⚠️ Failed to generate video machan!');

        await conn.sendMessage(from, {
            video: { url: resp.videoUrl },
            caption: `✨ *WHITESHADOW-MD Bot* ✨
🧑‍💻 By: WhiteShadow Team

📌 Action: VEO3 AI Video
💬 Prompt: ${q}

🔗 Video URL: ${resp.videoUrl}

> © Powered by WHITESHADOW-MD`
        }, { quoted: mek });

    } catch (e) {
        console.error(e);
        reply('🍂 Oops machan! Something went wrong generating AI video 😢');
    }
});
