const { cmd } = require("../command");
const axios = require("axios");

cmd({
    pattern: "itn",
    desc: "Get latest news from ITN",
    category: "news",
    react: "📰",
    async handler(m) {
        try {
            // API call
            let res = await axios.get("https://supun-md-api-rho.vercel.app/api/news/itn");
            let data = res.data;

            if (!data.success) return m.reply("News fetch කරන්න බැරි වුනා 😢");

            let news = data.results;
            let caption = `*ITN News*\n\n*Title:* ${news.title || "No title"}\n*Date:* ${news.date || "Not available"}\n\n*Description:* ${news.description}\n\n[Read more](${news.url})`;

            // Send message with image
            m.sendMessage(news.image, { caption: caption });
        } catch (e) {
            console.log(e);
            m.reply("News fetch කරනකොට දෝෂයක් සිදුවීලා 😢");
        }
    }
});
