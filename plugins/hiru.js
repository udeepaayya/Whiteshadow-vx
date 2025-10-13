//=====================================
// ⚙️  WhiteShadow-MD Hiru News Plugin
// 🧑‍💻 Developer: Mr.Tharuzz | Edited: WhiteShadow Team
//=====================================

const { cmd } = require('../command');
const { fetchJson } = require('../lib/functions');

cmd({
    pattern: "hirunews",
    alias: ["hiru"],
    react: "🗞️",
    desc: "Get latest news from Hiru News.",
    category: "news",
    use: ".hirunews",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const apiUrl = `https://tharuzz-news-api.vercel.app/api/news/hiru?`;
        const res = await fetchJson(apiUrl);

        if (!res.datas || res.datas.length === 0) {
            return reply("❌ *පුවත් සොයාගත නොහැකි විය!* 📰\n\n⚠️ API වෙතින් දත්ත නොලැබුණි.");
        }

        const news = res.datas[0]; // first/latest news item

        let caption = `
╭───〔 *🗞️ HIRU NEWS LIVE* 〕───⊷
│
│ *📌 Title:* ${news.title || 'N/A'}
│
│ *📄 විස්තරය:* ${news.desciption || 'N/A'}
│
│ *🌐 Link:* ${news.link || 'N/A'}
│
╰────────────────────⊷
> 🧠 Powered by *WhiteShadow-MD*
> 📰 Source: *Hiru News*
`.trim();

        await conn.sendMessage(from, {
            image: { url: news.image },
            caption: caption,
            contextInfo: {
                externalAdReply: {
                    title: "📰 Hiru News | WhiteShadow",
                    body: "Stay updated with latest Sri Lankan headlines!",
                    mediaType: 1,
                    thumbnailUrl: news.image,
                    sourceUrl: "https://whatsapp.com/channel/0029Vak4dFAHQbSBzyxlGG13"
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("❌ Hiru News Plugin Error:", e);
        return reply(`❌ *Hiru News Plugin Error:* ${e.message}`);
    }
});
