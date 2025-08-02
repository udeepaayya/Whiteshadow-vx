const axios = require("axios");
const fs = require("fs");
const { cmd } = require("../command");

let songData = {};

cmd({
  pattern: "songx",
  desc: "Download song from YouTube with format options",
  category: "music",
  use: ".songx <YouTube URL>",
  filename: __filename,
}, async (conn, m, msg, { args, reply }) => {
  if (!args[0]) return reply("🎧 *Please provide a YouTube link!*\n\nExample: .songx https://youtu.be/xyz");

  const url = args[0];
  reply("🔎 *Fetching song info...*");

  try {
    const res = await axios.get(`https://api.giftedtech.web.id/api/download/dlmp3?apikey=gifted&url=${url}`);
    const data = res.data;

    if (!data || !data.result || !data.result.url) return reply("❌ *Failed to fetch song.*");

    // Save temporarily for user
    songData[msg.sender] = {
      title: data.result.title || "Song",
      audioUrl: data.result.url,
    };

    reply(`🎶 *${data.result.title}*\n\n📥 Please select format:\n\n1. Audio 🎵\n2. File 📁\n3. VN 🎙️\n\n_Reply with number 1/2/3_`);
  } catch (e) {
    console.log(e);
    reply("⚠️ *Error fetching audio data!*");
  }
});

// Handle reply
cmd({
  on: "text",
}, async (conn, m, msg, { reply }) => {
  const body = m.body?.trim();
  const user = msg.sender;
  const data = songData[user];

  if (!data || !["1", "2", "3"].includes(body)) return;

  try {
    const audioBuffer = await axios.get(data.audioUrl, { responseType: "arraybuffer" }).then(res => res.data);

    if (body === "1") {
      reply("🔊 Sending as *Audio*...");
      await conn.sendMessage(msg.from, { audio: audioBuffer, mimetype: 'audio/mpeg' }, { quoted: m });
    } else if (body === "2") {
      reply("📁 Sending as *File*...");
      await conn.sendMessage(msg.from, {
        document: audioBuffer,
        mimetype: 'audio/mpeg',
        fileName: `${data.title}.mp3`
      }, { quoted: m });
    } else if (body === "3") {
      reply("🎙️ Sending as *Voice Note*...");
      await conn.sendMessage(msg.from, { audio: audioBuffer, mimetype: 'audio/mpeg', ptt: true }, { quoted: m });
    }

    delete songData[user];
  } catch (e) {
    console.log(e);
    reply("❌ *Error sending audio file.*");
  }
});
