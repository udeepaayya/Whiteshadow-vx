const { cmd } = require("../command");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

cmd({
    pattern: "video",
    alias: ["ytmp4"],
    react: "🎬",
    desc: "Download YouTube video as file",
    async handler(m, { sock, text }) {
        if (!text) return m.reply("❌ Please provide a YouTube URL!");

        try {
            const api = `https://api.yupra.my.id/api/downloader/ytmp4?url=${encodeURIComponent(text)}`;
            const res = await axios.get(api);
            const data = res.data;

            if (!data.result || data.status !== 200)
                return m.reply("❌ Video not found!");

            const video = data.result.formats[0]; // Default 240p
            const title = data.result.title;
            const videoUrl = video.url;

            const tempFile = path.join(__dirname, "../temp/video.mp4");
            const writer = fs.createWriteStream(tempFile);

            const response = await axios({
                url: videoUrl,
                method: "GET",
                responseType: "stream",
            });

            response.data.pipe(writer);

            writer.on("finish", async () => {
                await sock.sendMessage(
                    m.chat, 
                    {
                        video: { url: tempFile },
                        caption: `🎬 *${title}*\n💾 Quality: ${video.qualityLabel}\n⚡ Powered by WhiteShadow-MD`,
                    },
                    { quoted: m }
                );
                fs.unlinkSync(tempFile);
            });

            writer.on("error", (err) => {
                console.error(err);
                m.reply("❌ Download failed!");
            });

        } catch (e) {
            console.error(e);
            m.reply("❌ Error fetching video!");
        }
    },
});
