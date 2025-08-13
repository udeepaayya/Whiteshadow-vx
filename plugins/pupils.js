const fetch = require("node-fetch");
const { cmd } = require("../command");

// temporary in-memory cache for search results
let pupilmvCache = {};

cmd({
    pattern: "pupilmv",
    desc: "Search PupilMV movies/cartoons by name",
    category: "movies",
    use: ".pupilmv <movie-name>",
    react: "🔍"
}, async (conn, mek, m, { args }) => {
    if (!args[0]) return m.reply("❌ Please provide a movie or cartoon name.\nExample: `.pupilmv RRR`");
    try {
        let query = args.join(" ");
        let res = await fetch(`https://supun-md-api-xmjh.vercel.app/api/pupilmv-search?q=${encodeURIComponent(query)}`);
        let data = await res.json();
        if (!data.success || !data.results.length) return m.reply("❌ No results found.");

        // store results in cache for this chat
        pupilmvCache[m.chat] = data.results;

        // build numbered list
        let txt = `🔍 *PupilMV Search Results for:* ${query}\n\n`;
        data.results.slice(0, 5).forEach((item, i) => {
            txt += `*${i+1}.* ${item.title}\n`;
        });
        txt += `\nSelect a number to download:\nExample: .pupilmvdl 1`;

        await conn.sendMessage(m.chat, { text: txt }, { quoted: mek });
    } catch (e) {
        console.error(e);
        m.reply("❌ Error fetching search results.");
    }
});

cmd({
    pattern: "pupilmvdl",
    desc: "Download selected PupilMV movie/cartoon",
    category: "movies",
    use: ".pupilmvdl <number>",
    react: "📥"
}, async (conn, mek, m, { args }) => {
    if (!args[0]) return m.reply("❌ Please provide the number of the movie to download.\nExample: `.pupilmvdl 1`");
    try {
        let index = parseInt(args[0]) - 1;
        let results = pupilmvCache[m.chat];
        if (!results || !results[index]) return m.reply("❌ Invalid number or search expired. Please search again using `.pupilmv <name>`");

        let movie = results[index];

        // send movie link (direct download)
        await conn.sendMessage(m.chat, { text: `🎬 *${movie.title}*\n📥 Downloading...` }, { quoted: mek });

        // send video (WhatsApp limit ≤ 2GB)
        await conn.sendMessage(m.chat, {
            video: { url: movie.link },
            caption: `🎬 *${movie.title}*\nDownloaded via PupilMV`
        }, { quoted: mek });

    } catch (e) {
        console.error(e);
        m.reply("❌ Error downloading movie. Make sure the file is ≤ 2GB.");
    }
});
