const fetch = require("node-fetch");
const { cmd } = require("../command");

/* SinhalaSub TV Show Info */
cmd({
    pattern: "sinhalasubtv",
    desc: "Get SinhalaSub TV Show info + episode list",
    category: "movies",
    use: ".sinhalasubtv <tvshow-url>",
    react: "🎬"
}, async (conn, mek, m, { args }) => {
    if (!args[0]) return m.reply("❌ Please give TV Show URL.\nExample: `.sinhalasubtv https://sinhalasub.lk/tvshows/gaalivaana-2022-sinhala-subtitles/`");
    try {
        let res = await fetch(`https://supun-md-mv.vercel.app/api/sinhalasub-tvshow2/info?url=${encodeURIComponent(args[0])}`);
        let data = await res.json();
        if (!data.success) return m.reply("❌ Not found or API error.");

        let show = data.results;
        let txt = `🎬 *${show.title}*\n`;
        txt += `⭐ *IMDB:* ${show.imdb}\n📅 *Released:* ${show.date}\n🎥 *Director:* ${show.director}\n📜 *Genres:* ${show.category.join(", ")}\n\n📖 *Synopsis:* ${show.description}\n\n📂 *Episodes List:*\n`;
        show.episodes.forEach((ep, i) => {
            txt += `\n${i + 1}. ${ep.title} - ${ep.date}\n➡️ .sstvdl ${ep.episode_link}`;
        });

        await conn.sendMessage(m.chat, {
            image: { url: show.image[0] || show.poster },
            caption: txt
        }, { quoted: mek });

    } catch (e) {
        console.error(e);
        m.reply("❌ Error fetching TV show info.");
    }
});

/* SinhalaSub TV Episode Downloader */
cmd({
    pattern: "sstvdl",
    desc: "Download SinhalaSub episode (choose quality)",
    category: "movies",
    use: ".sstvdl <episode-url>",
    react: "⬇️"
}, async (conn, mek, m, { args }) => {
    if (!args[0]) return m.reply("❌ Please give episode URL.\nExample: `.sstvdl https://sinhalasub.lk/episodes/gaalivaana-s1e1/`");
    try {
        let res = await fetch(`https://supun-md-mv.vercel.app/api/sinhalasub-tvshow2/dl?url=${encodeURIComponent(args[0])}`);
        let data = await res.json();
        if (!data.success) return m.reply("❌ Not found or API error.");

        let ep = data.results;
        let txt = `🎬 *${ep.title}*\n📺 *${ep.ep_name}*\n📅 ${ep.date}\n\n📥 *Available Qualities:*\n`;

        ep.dl_links.forEach(link => {
            txt += `\n➡️ ${link.quality} (${link.size})\nCommand: \`.playvideo ${encodeURIComponent(link.link)}\``;
        });

        await conn.sendMessage(m.chat, {
            image: { url: ep.image || "https://i.ibb.co/6vRsfy1/movie.jpg" },
            caption: txt
        }, { quoted: mek });

    } catch (e) {
        console.error(e);
        m.reply("❌ Error fetching episode download links.");
    }
});

/* SinhalaSub Movie Info */
cmd({
    pattern: "sinhalasubmovie",
    desc: "Get SinhalaSub Movie info + download options",
    category: "movies",
    use: ".sinhalasubmovie <movie-url>",
    react: "🎬"
}, async (conn, mek, m, { args }) => {
    if (!args[0]) return m.reply("❌ Please give movie URL.\nExample: `.sinhalasubmovie https://sinhalasub.lk/movies/rrr-2022-sinhala-subtitles/`");
    try {
        let res = await fetch(`https://supun-md-mv.vercel.app/api/sinhalasub-movie/info?url=${encodeURIComponent(args[0])}`);
        let data = await res.json();
        if (!data.success) return m.reply("❌ Not found or API error.");

        let movie = data.results;
        let txt = `🎬 *${movie.title}*\n⭐ *IMDB:* ${movie.imdb}\n📅 *Released:* ${movie.date}\n🎥 *Director:* ${movie.director}\n📜 *Genres:* ${movie.category.join(", ")}\n\n📖 *Synopsis:* ${movie.description}\n\n📥 *Available Qualities:*\n`;

        movie.dl_links.forEach(link => {
            txt += `\n➡️ ${link.quality} (${link.size})\nCommand: \`.playvideo ${encodeURIComponent(link.link)}\``;
        });

        await conn.sendMessage(m.chat, {
            image: { url: movie.poster || "https://i.ibb.co/6vRsfy1/movie.jpg" },
            caption: txt
        }, { quoted: mek });

    } catch (e) {
        console.error(e);
        m.reply("❌ Error fetching movie info.");
    }
});

/* Direct Video Player / Downloader (max 2GB) */
cmd({
    pattern: "playvideo",
    desc: "Download video from direct link (max 2GB)",
    category: "movies",
    use: ".playvideo <direct-video-link>",
    react: "📥"
}, async (conn, mek, m, { args }) => {
    if (!args[0]) return m.reply("❌ Please give direct video link.");
    try {
        let videoUrl = decodeURIComponent(args[0]);
        await conn.sendMessage(m.chat, {
            video: { url: videoUrl },
            caption: `🎬 Your download is ready!`
        }, { quoted: mek });

    } catch (e) {
        console.error(e);
        m.reply("❌ Error sending video. Make sure file size is under 2GB.");
    }
});
