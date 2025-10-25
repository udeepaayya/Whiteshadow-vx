const { cmd } = require('../command');
const axios = require('axios');
const fetch = require('node-fetch');

cmd({
    pattern: "cz",
    alias: ["czmovie", "cinesubz"],
    desc: "Search Sinhala Sub movies (CineSubz API)",
    category: "movie",
    react: "🎬",
    use: ".cz <movie name>",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
    try {
        if (!q) return reply("🎬 *Please enter a movie name!*\nExample: .cz Titanic");

        reply("🔎 Searching CineSubz...");

        // Search API
        const search = await axios.get(`https://foreign-marna-sithaunarathnapromax-9a005c2e.koyeb.app/api/cinesubz/search?q=${encodeURIComponent(q)}&apiKey=d3d7e61cc85c2d70974972ff6d56edfac42932d394f7551207d2f6ca707eda56`);
        const results = search.data.data;
        if (!results || results.length === 0) return reply("❌ No results found!");

        // Build search list
        let listMsgText = "🎬 *CineSubz Movie Search Results*\n\n";
        results.slice(0, 8).forEach((movie, i) => {
            listMsgText += `*${i + 1}.* ${movie.title} (${movie.year})\nType: ${movie.type}\n\n`;
        });
        listMsgText += "\n🔢 Reply with number to see movie info";

        const searchMsg = await conn.sendMessage(from, { text: listMsgText }, { quoted: mek });
        const searchMsgId = searchMsg.key.id;

        // Listen for number reply
        conn.ev.on("messages.upsert", async (upd) => {
            const msg = upd?.messages?.[0];
            if (!msg?.message) return;
            const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
            const isReply = msg?.message?.extendedTextMessage?.contextInfo?.stanzaId === searchMsgId;
            if (!isReply) return;

            const index = parseInt(text.trim()) - 1;
            if (isNaN(index) || index < 0 || index >= results.length) return reply("❌ Invalid number!");

            const movie = results[index];
            reply(`📑 Fetching info for *${movie.title}*...`);

            // Movie details API
            const infoRes = await axios.get(`https://foreign-marna-sithaunarathnapromax-9a005c2e.koyeb.app/api/cinesubz/movie-details?url=${encodeURIComponent(movie.link)}&apiKey=d3d7e61cc85c2d70974972ff6d56edfac42932f6ca707eda56`);
            const det = infoRes.data.mainDetails;

            const caption = `🎬 *${det.maintitle}*\n🗓️ ${det.dateCreated}\n🎞️ ${det.runtime}\n🌐 ${det.country}\n📄 Genres: ${det.genres.join(", ")}\n\nReply "download" to get 720p movie`;

            const infoMsg = await conn.sendMessage(from, { image: { url: det.imageUrl }, caption }, { quoted: msg });
            const infoMsgId = infoMsg.key.id;

            // Listen for download reply
            conn.ev.on("messages.upsert", async (dlUpd) => {
                const dlMsg = dlUpd?.messages?.[0];
                if (!dlMsg?.message) return;
                const dlText = (dlMsg.message?.conversation || dlMsg.message?.extendedTextMessage?.text || "").toLowerCase();
                const isReplyDl = dlMsg?.message?.extendedTextMessage?.contextInfo?.stanzaId === infoMsgId;
                if (!isReplyDl) return;
                if (!dlText.includes("download")) return;

                reply(`📥 Preparing 720p download for *${det.maintitle}*...`);

                const dlRes = await axios.get(`https://foreign-marna-sithaunarathnapromax-9a005c2e.koyeb.app/api/cinesubz/downloadurl?url=${encodeURIComponent(movie.link)}&apiKey=d3d7e61cc85c2d70974972ff6d56edfac42932d394f7551207d2f6ca707eda56`);
                const dlData = dlRes.data;

                const fileUrl = dlData.url;
                if (!fileUrl) return reply("❌ Download link not found!");

                const head = await fetch(fileUrl, { method: 'HEAD' });
                const size = head.headers.get('content-length');
                const fileSizeMB = (size / (1024 * 1024)).toFixed(2);

                if (fileSizeMB <= 2048) {
                    reply(`📤 Sending *${det.maintitle}* (${fileSizeMB} MB)...`);
                    await conn.sendMessage(from, {
                        document: { url: fileUrl },
                        fileName: `${det.maintitle}.mp4`,
                        mimetype: "video/mp4",
                        caption: `🎬 *${det.maintitle}* (720p)`
                    }, { quoted: dlMsg });
                } else {
                    reply(`⚠️ File too large (${fileSizeMB} MB)\n📎 Download manually:\n${fileUrl}`);
                }
            });
        });

    } catch (e) {
        console.error(e);
        reply("⚠️ *Error!* Something went wrong.");
    }
});
