const axios = require("axios");
const { cmd } = require('../command'); // adjust if needed

cmd({
  pattern: "videonote",
  alias: ["videon"],
  desc: "Send video note from URL",
  category: "media",
  use: '.videonote',
  filename: __filename
},
async (conn, m, mdata, { from, reply }) => {
  try {
    const videoUrl = 'https://files.catbox.moe/h6d32b.mp4'; // 🟢 Replace with your video URL

    reply("📥 Downloading video...");

    const response = await axios.get(videoUrl, {
      responseType: 'arraybuffer'
    });

    const buffer = Buffer.from(response.data);

    await conn.sendMessage(from, {
      video: buffer,
      mimetype: 'video/mp4',
      caption: '🎥 *Here is your video note!*',
    }, {
      quoted: m,
      contextInfo: {
        isVideoNote: true // 🎯 Make it appear as a round video
      }
    });

  } catch (err) {
    console.error(err);
    reply("❌ Error sending video note.");
  }
});
