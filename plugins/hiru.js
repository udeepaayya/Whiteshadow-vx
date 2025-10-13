//=====================================
// ⚙️  WhiteShadow-MD Hiru News Plugin
// 🧑‍💻 Developer: Mr.Tharuzz | Edited by: WhiteShadow Team
//=====================================

const { cmd } = require('../command');
const { fetchJson } = require('../lib/functions');

cmd({
    pattern: "hirunews",
    alias: ["hiru"],
    react: "🗞️",
    desc: "Get latest Sri Lankan news from Hiru News.",
    category: "news",
    use: ".hiru",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const apiUrl = `https://tharuzz-news-api.vercel.app/api/news/hiru?`;
        const res = await fetchJson(apiUrl);

        if (!res.datas || res.datas.length === 0) {
            return reply("❌ *පුවත් සොයාගත නොහැකි විය!* 📰\n\n⚠️ API වෙතින් දත්ත නොලැබුණි.");
        }

        const newsList = res.datas;

        // Loop through all news items
        for (let i = 0; i < newsList.length; i++) {
            const n = newsList[i];

            const caption = `
╭───〔 *🗞️ HIRU NEWS ${i + 1}* 〕───⊷
│
│ *📌 Title:* ${n.title || 'N/A'}
│
│ *📄 විස්තරය:* ${n.description || 'N/A'}
│
│ *🌐 Link:* ${n.link || 'N/A'}
│
╰────────────────────⊷
> 🧠 Powered by *WhiteShadow-MD*
> 📰 Source: *Hiru News*
`.trim();

            await conn.sendMessage(from, {
                image: { url: n.image },
                caption: caption,
                contextInfo: {
                    externalAdReply: {
                        title: "📰 Hiru News | WhiteShadow",
                        body: n.title || "Hiru News Headlines",
                        mediaType: 1,
                        thumbnailUrl: n.image,
                        sourceUrl: n.link || "https://hirunews.lk"
                    }
                }
            }, { quoted: mek });

            // Optional small delay to avoid spam blocks
            await new Promise(r => setTimeout(r, 1500));
        }

    } catch (e) {
        console.error("❌ Hiru News Plugin Error:", e);
        return reply(`❌ *Hiru News Plugin Error:* ${e.message}`);
    }
});
