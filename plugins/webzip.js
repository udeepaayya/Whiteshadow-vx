const { cmd } = require('../command');
const axios = require("axios");
const fs = require("fs");
const path = require("path");

cmd({
    pattern: "web2zip",
    alias: ["sitezip", "getzip"],
    react: "📦",
    desc: "Download any website as ZIP",
    category: "download",
    use: ".web2zip <url>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide a website URL.\nExample: *.web2zip https://example.com*");

        reply("⏳ Downloading website as ZIP...");

        // API call
        const apiUrl = `https://api.nekolabs.my.id/tools/web2zip?url=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data.status) return reply("❌ Failed to fetch website.");

        let downloadUrl = data.result.downloadUrl;
        if (!downloadUrl) return reply("❌ Couldn’t get download link.");

        // Download the ZIP
        const zipPath = path.join(__dirname, `../temp/${Date.now()}.zip`);
        const writer = fs.createWriteStream(zipPath);

        const response = await axios({
            url: downloadUrl,
            method: 'GET',
            responseType: 'stream'
        });

        response.data.pipe(writer);

        writer.on('finish', async () => {
            await conn.sendMessage(from, {
                document: fs.readFileSync(zipPath),
                mimetype: "application/zip",
                fileName: "website.zip"
            }, { quoted: mek });

            fs.unlinkSync(zipPath);
        });

        writer.on('error', (err) => {
            console.error(err);
            reply("❌ Error while saving ZIP file.");
        });

    } catch (e) {
        console.error(e);
        reply("❌ Error fetching website ZIP.");
    }
});
