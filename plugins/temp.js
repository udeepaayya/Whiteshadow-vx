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

    if (!text) return reply(`📘 Example usage:\n${prefix + command} https://github.com/username/repo/blob/main/file.js\n${prefix + command} https://gist.github.com/username/gist_id`);

    try {
        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        // 📥 Get GitHub file JSON (use your API)
        const apiUrl = `https://api.xyro.site/download/github?url=${encodeURIComponent(text)}`;
        const { data } = await axios.get(apiUrl, { timeout: 15000 });

        if (!data.status || !data.data) throw new Error('Failed to fetch data from GitHub');

        const githubData = data.data;

        // 📝 Prepare message
        let msg = `╭─────────────◆\n`;
        msg += `│ 📦 GITHUB DOWNLOADER\n│\n`;

        msg += `│ 🔹 Type: ${githubData.type}\n`;
        msg += `│ 👤 Owner: ${githubData.owner}\n`;
        if (githubData.repo) msg += `│ 🏷️ Repo: ${githubData.repo}\n`;
        msg += `│ 📁 File: ${githubData.name || githubData.files?.[0]?.name}\n`;
        msg += `│ 📏 Size: ${(githubData.size / 1024).toFixed(2)} KB\n`;
        msg += `│ 🔗 URL: ${githubData.raw_url || githubData.files?.[0]?.raw_url}\n`;
        msg += `╰─────────────◆\n\n`;
        msg += `💫 Powered by 𝗪𝗵𝗶𝘁𝗲𝗦𝗵𝗮𝗱𝗼𝘄-𝗠𝗗 ⚡`;

        await reply(msg);

        // 🗂 Send the file
        let fileURL = githubData.raw_url || (githubData.files && githubData.files[0]?.raw_url);
        let fileName = githubData.name || (githubData.files && githubData.files[0]?.name);
        let fileLang = githubData.language || (githubData.files && githubData.files[0]?.language);

        if (!fileURL) return reply("⚠️ Couldn't find file URL!");

        const res = await axios.get(fileURL, { responseType: 'arraybuffer', maxRedirects: 5 });
        const buffer = Buffer.from(res.data);

        const getMime = (filename, lang) => {
            const ext = filename.split('.').pop().toLowerCase();
            const map = {
                js: 'application/javascript', py: 'text/x-python', html: 'text/html', css: 'text/css',
                json: 'application/json', txt: 'text/plain', md: 'text/markdown', php: 'application/x-php'
            };
            const langMap = { javascript: 'application/javascript', python: 'text/x-python' };
            return map[ext] || langMap[lang] || 'text/plain';
        };

        const mime = getMime(fileName, fileLang);

        await conn.sendMessage(from, {
            document: buffer,
            fileName,
            mimetype: mime,
            caption: `✅ File successfully downloaded!\n\n💫 Powered by 𝗪𝗵𝗶𝘁𝗲𝗦𝗵𝗮𝗱𝗼𝘄-𝗠𝗗 ⚡`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (e) {
        console.error('GitHubDL Error:', e.message);
        await reply(`❌ GitHub download failed: ${e.message}\n\n💫 Powered by 𝗪𝗵𝗶𝘁𝗲𝗦𝗵𝗮𝗱𝗼𝘄-𝗠𝗗 ⚡`);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
    }
});  
