const axios = require('axios');
const FormData = require('form-data');
const fileType = require('file-type');
const fs = require('fs');
const { cmd } = require('../command');
const { uploadToTelegraph } = require('../lib/telegra'); // upload function

function randomFileName() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let str = '';
    for (let i = 0; i < 10; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `id_${Date.now()}${str}`;
}

async function removeBackground(imageUrl) {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    const type = await fileType.fromBuffer(buffer);
    const allowedMime = ['image/jpeg', 'image/png', 'image/webp'];
    if (!type || !allowedMime.includes(type.mime)) throw new Error('❌ File must be an image (jpg, png, webp).');
    if (buffer.length / (1024 * 1024) > 5) throw new Error('❌ Maximum file size is 5MB.');

    const form = new FormData();
    form.append('myFile[]', buffer, { filename: `${randomFileName()}.${type.ext}`, contentType: type.mime });

    const result = await axios.post('https://backrem.pi7.org/remove_bg', form, {
        headers: {
            ...form.getHeaders(),
            'User-Agent': 'Mozilla/5.0',
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity
    });

    return `https://backrem.pi7.org/${result.data.images[0].filename}`;
}

cmd({
    pattern: "removebg",
    alias: ["rmbg", "nobg"],
    desc: "Remove background from image",
    category: "tools",
    use: ".removebg (reply to image)",
    react: "🖼️",
    filename: __filename
},
async (conn, mek, m, { from, quoted, reply }) => {
    try {
        let qmsg = quoted || m;
        if (!(qmsg.mimetype && qmsg.mimetype.startsWith("image"))) {
            return reply("⚠️ Please reply to an image with .removebg");
        }

        let media = await conn.downloadAndSaveMediaMessage(qmsg);
        let imageUrl = await uploadToTelegraph(media); // 🟢 URL ගන්න මෙතනයි

        reply("⏳ Removing background, please wait...");
        let output = await removeBackground(imageUrl);

        await conn.sendMessage(from, { image: { url: output }, caption: "✅ Background Removed by WhiteShadow-MD" }, { quoted: mek });

        fs.unlinkSync(media); // temp file delete
    } catch (e) {
        console.log(e);
        reply("❌ Failed to remove background. " + e.message);
    }
});
