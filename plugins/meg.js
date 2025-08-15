/**
 * Nama fitur : Meganz Downloader with Progress
 * Type : Plugin CJS for Whiteshadow-MD
 * Author : ZenzzXD (Modified by ChamodNimsara for WhiteShadow-MD)
 */

const { cmd } = require('../command');
const { File } = require('megajs');
const path = require('path');

async function megaDownload(url, progressCallback) {
    const file = File.fromURL(url);
    await file.loadAttributes();

    const chunks = [];
    let downloaded = 0;
    const totalSize = file.size;

    return new Promise((resolve, reject) => {
        const stream = file.download();

        stream.on('data', chunk => {
            chunks.push(chunk);
            downloaded += chunk.length;

            if (progressCallback) {
                const percent = ((downloaded / totalSize) * 100).toFixed(2);
                progressCallback(percent);
            }
        });

        stream.on('end', () => {
            resolve({
                name: file.name,
                size: file.size,
                buffer: Buffer.concat(chunks)
            });
        });

        stream.on('error', err => reject(err));
    });
}

cmd({
    pattern: "megadl",
    alias: ["mega"],
    react: "📥",
    desc: "Download file from Mega.nz with progress",
    category: "downloader",
    use: ".megadl <mega.nz url>",
    filename: __filename
},
async (conn, m, { args }) => {
    if (!args[0]) return m.reply("💡 Example:\n.megadl https://mega.nz/file/xxxx#key");

    let lastUpdate = 0;

    try {
        const data = await megaDownload(args[0], percent => {
            // Update every 10% change
            if (percent - lastUpdate >= 10 || percent === "100.00") {
                conn.sendMessage(m.chat, { text: `📥 Download Progress: ${percent}%` }, { quoted: m });
                lastUpdate = percent;
            }
        });

        const ext = path.extname(data.name) || '';
        await conn.sendMessage(
            m.chat,
            {
                document: data.buffer,
                fileName: data.name,
                mimetype: ext ? `application/${ext.slice(1)}` : 'application/octet-stream'
            },
            { quoted: m }
        );

    } catch (e) {
        m.reply(`❌ Error: ${e.message}`);
    }
});
