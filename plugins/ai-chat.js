//═══════════════════════════════════════════════//
//                WHITESHADOW-MD                 //
//═══════════════════════════════════════════════//
//  ⚡ Feature : GPT AI (English Version - zenzxz, openai, deepseek APIs)
//  👑 Developer : Chamod Nimsara (WhiteShadow)
//  📡 Channel   : https://whatsapp.com/channel/0029Vb4fjWE1yT25R7epR110
//═══════════════════════════════════════════════//

const { cmd } = require('../command');
const axios = require('axios');
const fetch = require('node-fetch');

//═══════════════════════════════════════════════//
// AI 1 - Zenzxz API
//═══════════════════════════════════════════════//
cmd({
  pattern: "ai",
  alias: ["ask"],
  desc: "Ask questions to the AI using Zenzxz API (English)",
  category: "ai",
  react: "🤖",
  filename: __filename
}, 
async (conn, mek, m, { from, reply, text, command, prefix }) => {
  try {
    if (!text) return reply(`💡 Example: *${prefix + command} When was the Internet invented?*`);
    await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

    const prompt = 'You are a professional AI assistant. Answer all questions briefly, clearly, and naturally in English.';
    const url = `https://api.zenzxz.my.id/api/ai/gpt?question=${encodeURIComponent(text)}&prompt=${encodeURIComponent(prompt)}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('API request failed.');
    const json = await res.json();

    const result = json?.results || json?.result || json?.message || json?.answer || '🤖 No response received from AI!';
    await reply(`🤖 *AI Response:*\n\n${result}`);
    await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

  } catch (e) {
    console.error(e);
    reply('❌ An error occurred while processing your request.');
  }
});

//═══════════════════════════════════════════════//
// AI 2 - Lance-Frank (GPT)
//═══════════════════════════════════════════════//
cmd({
  pattern: "ai2",
  alias: ["bot", "shadow", "gpt", "gpt4", "bing"],
  desc: "Chat with an AI model",
  category: "ai",
  react: "🤖",
  filename: __filename
},
async (conn, mek, m, { from, q, reply, react }) => {
  try {
    if (!q) return reply("💡 Please provide a message for the AI.\nExample: `.ai2 Hello`");

    const apiUrl = `https://lance-frank-asta.onrender.com/api/gpt?q=${encodeURIComponent(q)}`;
    const { data } = await axios.get(apiUrl);

    if (!data || !data.message) {
      await react("❌");
      return reply("⚠️ AI failed to respond. Please try again later.");
    }

    const number = "94704896880"; // Your bot number (Chamod)
    const jid = number + "@s.whatsapp.net";
    let thumb = Buffer.from([]);

    try {
      const ppUrl = await conn.profilePictureUrl(jid, "image");
      const ppResp = await axios.get(ppUrl, { responseType: "arraybuffer" });
      thumb = Buffer.from(ppResp.data, "binary");
    } catch { }

    const contactCard = {
      key: { fromMe: false, participant: '0@s.whatsapp.net', remoteJid: "status@broadcast" },
      message: {
        contactMessage: {
          displayName: "GPT ✅",
          vcard: `BEGIN:VCARD
VERSION:3.0
FN:GPT ✅
ORG:OpenAI
TEL;type=CELL;type=VOICE;waid=${number}:+94 70 489 6880
END:VCARD`,
          jpegThumbnail: thumb
        }
      }
    };

    await conn.sendMessage(from, {
      text: `🤖 *WHITESHADOW-MD AI Response:*\n\n${data.message}`
    }, { quoted: contactCard });

    await react("✅");

  } catch (e) {
    console.error("Error in AI2:", e);
    await react("❌");
    reply("❌ An error occurred while communicating with the AI.");
  }
});

//═══════════════════════════════════════════════//
// AI 3 - OpenAI (vapis.my.id)
//═══════════════════════════════════════════════//
cmd({
  pattern: "openai",
  alias: ["chatgpt", "gpt3", "open-gpt"],
  desc: "Chat with OpenAI",
  category: "ai",
  react: "🧠",
  filename: __filename
},
async (conn, mek, m, { from, q, reply, react }) => {
  try {
    if (!q) return reply("💡 Example: `.openai What is JavaScript?`");

    const apiUrl = `https://vapis.my.id/api/openai?q=${encodeURIComponent(q)}`;
    const { data } = await axios.get(apiUrl);

    if (!data || !data.result) {
      await react("❌");
      return reply("⚠️ OpenAI failed to respond. Please try again later.");
    }

    const number = "94704896880";
    const jid = number + "@s.whatsapp.net";
    let thumb = Buffer.from([]);

    try {
      const ppUrl = await conn.profilePictureUrl(jid, "image");
      const ppResp = await axios.get(ppUrl, { responseType: "arraybuffer" });
      thumb = Buffer.from(ppResp.data, "binary");
    } catch { }

    const contactCard = {
      key: { fromMe: false, participant: '0@s.whatsapp.net', remoteJid: "status@broadcast" },
      message: {
        contactMessage: {
          displayName: "OpenAI 🤖",
          vcard: `BEGIN:VCARD
VERSION:3.0
FN:OpenAI 🤖
ORG:ChatGPT
TEL;type=CELL;type=VOICE;waid=${number}:+94 70 489 6880
END:VCARD`,
          jpegThumbnail: thumb
        }
      }
    };

    await conn.sendMessage(from, {
      text: `🧠 *OpenAI Response:*\n\n${data.result}`
    }, { quoted: contactCard });

    await react("✅");

  } catch (e) {
    console.error("Error in OpenAI:", e);
    await react("❌");
    reply("❌ An error occurred while communicating with OpenAI.");
  }
});

//═══════════════════════════════════════════════//
// AI 4 - DeepSeek AI
//═══════════════════════════════════════════════//
cmd({
  pattern: "deepseek",
  alias: ["deep", "seekai"],
  desc: "Chat with DeepSeek AI",
  category: "ai",
  react: "🧠",
  filename: __filename
},
async (conn, mek, m, { from, q, reply, react }) => {
  try {
    if (!q) return reply("💡 Example: `.deepseek Who are you?`");

    const apiUrl = `https://api.ryzendesu.vip/api/ai/deepseek?text=${encodeURIComponent(q)}`;
    const { data } = await axios.get(apiUrl);

    if (!data || !data.answer) {
      await react("❌");
      return reply("⚠️ DeepSeek AI failed to respond. Please try again later.");
    }

    const number = "94704896880";
    const jid = number + "@s.whatsapp.net";
    let thumb = Buffer.from([]);

    try {
      const ppUrl = await conn.profilePictureUrl(jid, "image");
      const ppResp = await axios.get(ppUrl, { responseType: "arraybuffer" });
      thumb = Buffer.from(ppResp.data, "binary");
    } catch { }

    const contactCard = {
      key: { fromMe: false, participant: '0@s.whatsapp.net', remoteJid: "status@broadcast" },
      message: {
        contactMessage: {
          displayName: "DeepSeek AI 🧠",
          vcard: `BEGIN:VCARD
VERSION:3.0
FN:DeepSeek AI 🧠
ORG:DeepSeek AI
TEL;type=CELL;type=VOICE;waid=${number}:+94 70 489 6880
END:VCARD`,
          jpegThumbnail: thumb
        }
      }
    };

    await conn.sendMessage(from, {
      text: `🧠 *DeepSeek AI Response:*\n\n${data.answer}`
    }, { quoted: contactCard });

    await react("✅");

  } catch (e) {
    console.error("Error in DeepSeek:", e);
    await react("❌");
    reply("❌ An error occurred while communicating with DeepSeek AI.");
  }
});
