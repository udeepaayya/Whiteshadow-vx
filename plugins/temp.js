//═══════════════════════════════════════════════//
//                WHITESHADOW-MD                 //
//═══════════════════════════════════════════════//
//  ⚡ Feature : GitHub Downloader
//  👑 Developer : Chamod Nimsara (WhiteShadow)
//  📡 this pluging created by whiteshadow | property of whiteshadow md
//═══════════════════════════════════════════════//

const axios = require('axios');
const { cmd } = require('../command');

cmd({
    pattern: "githubdl",
    alias: ["githubdownload", "gitdl"],
    desc: "Download file or gist from GitHub link",
    react: "📦",
    category: "downloader",
    use: ".githubdl <github-url>",
    filename: __filename
}, async (conn, mek, m, { from, text, reply, prefix, command }) => {

    if (!text) return reply(`📘 Example usage:\n\n${prefix + command} https://github.com/username/repo/blob/main/file.js\n${prefix + command} https://gist.github.com/username/gist_id`);

    try {
        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        const apiUrl = `https://api.xyro.site/download/github?url=${encodeURIComponent(text)}`;
        const { data } = await axios.get(apiUrl);

        if (!data.status || !data.data) throw new Error('Failed to fetch data from GitHub');

        const githubData = data.data;
        let msg = `╭───────────────◆\n`;
        msg += `│  *📦 GITHUB DOWNLOADER*\n│\n`;

        if (githubData.type === 'gist') {
            msg += `│ 🔹 *Type:* Gist\n`;
            msg += `│ 👤 *Owner:* ${githubData.owner}\n`;
            msg += `│ 🆔 *Gist ID:* ${githubData.gist_id}\n`;
            msg += `│ 📝 *Description:* ${githubData.description || 'No description'}\n`;
            msg += `│ 📅 *Created:* ${new Date(githubData.created_at).toLocaleDateString('en-US')}\n`;
            msg += `│ 🔄 *Updated:* ${new Date(githubData.updated_at).toLocaleDateString('en-US')}\n`;
            msg += `│\n│ 📁 *Files (${githubData.files.length}):*\n`;

            githubData.files.forEach((file, i) => {
                msg += `│\n│ ${i + 1}. *${file.name}*\n│ 📏 ${(file.size / 1024).toFixed(2)} KB\n│ 💻 ${file.language || 'Unknown'}\n│ 🔗 ${file.raw_url}\n`;
            });

        } else if (githubData.type === 'file') {
            msg += `│ 🔹 *Type:* Repo File\n`;
            msg += `│ 👤 *Owner:* ${githubData.owner}\n`;
            msg += `│ 🏷️ *Repo:* ${githubData.repo}\n`;
            msg += `│ 📁 *File:* ${githubData.file_name}\n`;
            msg += `│ 📏 *Size:* ${(githubData.size / 1024).toFixed(2)} KB\n`;
            msg += `│ 💻 *Language:* ${githubData.language || 'Unknown'}\n`;
            msg += `│ 🔗 *Download:* ${githubData.download_url}\n`;

            if (githubData.content && githubData.content.length > 0) {
                msg += `│\n│ 📄 *Preview:*\n│ \`\`\`${githubData.language || 'text'}\n${githubData.content.substring(0, 400)}${githubData.content.length > 400 ? '...' : ''}\n│ \`\`\`\n`;
            }
        }

        msg += `╰───────────────◆\n`;
        msg += `⏰ ${data.timestamp}\n\n`;
        msg += `💫 *Powered by 𝗪𝗵𝗶𝘁𝗲𝗦𝗵𝗮𝗱𝗼𝘄-𝗠𝗗 ⚡*`;

        await reply(msg);

        const getMimeType = (filename, language) => {
            const ext = filename.split('.').pop().toLowerCase();
            const map = {
                js: 'application/javascript', ts: 'application/typescript', py: 'text/x-python', java: 'text/x-java',
                cpp: 'text/x-c++', c: 'text/x-c', html: 'text/html', css: 'text/css', php: 'application/x-php',
                json: 'application/json', xml: 'application/xml', md: 'text/markdown', txt: 'text/plain', csv: 'text/csv',
                sql: 'application/sql', sh: 'application/x-sh', bat: 'application/bat', ps1: 'application/powershell'
            };
            const lang = {
                javascript: 'application/javascript', typescript: 'application/typescript', python: 'text/x-python',
                java: 'text/x-java', cpp: 'text/x-c++', html: 'text/html', css: 'text/css', php: 'application/x-php'
            };
            return lang[language] || map[ext] || 'text/plain';
        };

        //📁 Send files
        if (githubData.files && githubData.files.length > 0) {
            for (const file of githubData.files.slice(0, 3)) {
                try {
                    if (file.size < 10 * 1024 * 1024) {
                        const res = await axios.get(file.raw_url, { responseType: 'arraybuffer' });
                        const buffer = Buffer.from(res.data);
                        const mime = getMimeType(file.name, file.language);
                        await conn.sendMessage(from, { document: buffer, fileName: file.name, mimetype: mime }, { quoted: mek });
                        await new Promise(r => setTimeout(r, 1000));
                    } else {
                        await reply(`⚠️ *${file.name}* is too large (${(file.size / 1024 / 1024).toFixed(2)} MB)\n🔗 ${file.raw_url}`);
                    }
                } catch (err) {
                    console.log(`Error sending file ${file.name}:`, err.message);
                    await reply(`❌ Failed to send ${file.name}`);
                }
            }
        } else if (githubData.type === 'file' && githubData.download_url) {
            try {
                const res = await axios.get(githubData.download_url, { responseType: 'arraybuffer' });
                const buffer = Buffer.from(res.data);
                const mime = getMimeType(githubData.file_name, githubData.language);
                await conn.sendMessage(from, { document: buffer, fileName: githubData.file_name, mimetype: mime }, { quoted: mek });
            } catch (err) {
                console.log(`Error sending file:`, err.message);
                await reply(`❌ Failed to send ${githubData.file_name}`);
            }
        }

        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (e) {
        console.error(e);
        await reply(`❌ GitHub download failed: ${e.message}\n\n💫 *Powered by 𝗪𝗵𝗶𝘁𝗲𝗦𝗵𝗮𝗱𝗼𝘄-𝗠𝗗 ⚡*`);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
    }
});
