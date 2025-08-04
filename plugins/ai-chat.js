
const { cmd } = require('../command');
const axios = require('axios');

cmd({
  pattern: "ai",
  alias: ["bot", "shadow", "gpt", "gpt4", "bing"],
  desc: "Chat with an AI model",
  category: "ai",
  react: "🤖",
  filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
  try {
    if (!q) return reply("Please provide a message for the AI.\nExample: `.ai Hello`");

    const apiUrl = `https://lance-frank-asta.onrender.com/api/gpt?q=${encodeURIComponent(q)}`;
    const { data } = await axios.get(apiUrl);

    if (!data || !data.message) {
      await react("❌");
      return reply("AI failed to respond. Please try again later.");
    }

    // Start measuring ping for fetching profile picture
    const start = Date.now();

    // Fetch profile picture buffer
    let thumb = Buffer.from([]);
    const number = "18002428478"; // Use your number without spaces or symbols
    const jid = number + "@s.whatsapp.net";

    try {
      const ppUrl = await conn.profilePictureUrl(jid, "image");
      const ppResp = await axios.get(ppUrl, { responseType: "arraybuffer" });
      thumb = Buffer.from(ppResp.data, "binary");
    } catch (err) {
      console.log("❗ Couldn't fetch profile picture:", err.message);
    }

    // Create contact card vCard object
    const contactCard = {
      key: {
        fromMe: false,
        participant: '0@s.whatsapp.net',
        remoteJid: "status@broadcast"
      },
      message: {
        contactMessage: {
          displayName: "GPT ✅",
          vcard: `BEGIN:VCARD
VERSION:3.0
FN: GPT ✅
ORG: OpenAI
TEL;type=CELL;type=VOICE;waid=${number}:+1 800 242 8478
END:VCARD`,
          jpegThumbnail: thumb
        }
      }
    };

    const ping = Date.now() - start;

    // Send AI response with quoted contact card
    await conn.sendMessage(from, {
      text: `🤖 *WHITESHADOW-MD Ai Response:*\n\n${data.message}\n\n⚡ *Profile fetched in:* \`${ping} ms\``
    }, { quoted: contactCard });

    await react("✅");

  } catch (e) {
    console.error("Error in AI command:", e);
    await react("❌");
    reply("An error occurred while communicating with the AI.");
  }
});


cmd({
  pattern: "openai",
  alias: ["chatgpt", "gpt3", "open-gpt"],
  desc: "Chat with OpenAI",
  category: "ai",
  react: "🧠",
  filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
  try {
    if (!q) return reply("Please provide a message for OpenAI.\nExample: `.openai Hello`");

    const apiUrl = `https://vapis.my.id/api/openai?q=${encodeURIComponent(q)}`;
    const { data } = await axios.get(apiUrl);

    if (!data || !data.result) {
      await react("❌");
      return reply("OpenAI failed to respond. Please try again later.");
    }

    // Fetch profile picture buffer
    let thumb = Buffer.from([]);
    const number = "18002428478";  // ඔබගේ OpenAI number එක country code එක සමඟ (without +)
    const jid = number + "@s.whatsapp.net";

    try {
      const ppUrl = await conn.profilePictureUrl(jid, "image");
      const ppResp = await axios.get(ppUrl, { responseType: "arraybuffer" });
      thumb = Buffer.from(ppResp.data, "binary");
    } catch (err) {
      console.log("❗ Couldn't fetch profile picture:", err.message);
      // fallback thumbnail (empty buffer or local image buffer)
      thumb = Buffer.from([]);
    }

    // Create contact card vCard object
    const contactCard = {
      key: {
        fromMe: false,
        participant: '0@s.whatsapp.net',
        remoteJid: "status@broadcast"
      },
      message: {
        contactMessage: {
          displayName: "OpenAI 🤖",
          vcard: `BEGIN:VCARD
VERSION:3.0
FN: OpenAI 🤖
ORG: ChatGPT
TEL;type=CELL;type=VOICE;waid=${number}:+1 800 242 8478
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
    console.error("Error in OpenAI command:", e);
    await react("❌");
    reply("An error occurred while communicating with OpenAI.");
  }
});
cmd({
  pattern: "deepseek",
  alias: ["deep", "seekai"],
  desc: "Chat with DeepSeek AI",
  category: "ai",
  react: "🧠",
  filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
  try {
    if (!q) return reply("Please provide a message for DeepSeek AI.\nExample: `.deepseek Hello`");

    const apiUrl = `https://api.ryzendesu.vip/api/ai/deepseek?text=${encodeURIComponent(q)}`;
    const { data } = await axios.get(apiUrl);

    if (!data || !data.answer) {
      await react("❌");
      return reply("DeepSeek AI failed to respond. Please try again later.");
    }

    // Number and jid
    const number = "94765635699";
    const jid = number + "@s.whatsapp.net";

    let thumb = Buffer.from([]);
    try {
      const ppUrl = await conn.profilePictureUrl(jid, "image");
      const ppResp = await axios.get(ppUrl, { responseType: "arraybuffer" });
      thumb = Buffer.from(ppResp.data, "binary");
    } catch (err) {
      console.log("❗ Couldn't fetch profile picture:", err.message);
    }

    const contactCard = {
      key: {
        fromMe: false,
        participant: '0@s.whatsapp.net',
        remoteJid: "status@broadcast"
      },
      message: {
        contactMessage: {
          displayName: "DeepSeek AI 🧠",
          vcard: `BEGIN:VCARD
VERSION:3.0
FN:DeepSeek AI 🧠
ORG:DeepSeek AI
TEL;type=CELL;type=VOICE;waid=${number}:+94 76 563 5699
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
    console.error("Error in DeepSeek AI command:", e);
    await react("❌");
    reply("An error occurred while communicating with DeepSeek AI.");
  }
});
cmd({
  pattern: "ai2",
  alias: ["cnw", "white"],
  desc: "Chat with Gemini AI via Lakiya API",
  category: "ai",
  react: "✨",
  filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
  try {
    if (!q) return reply("Please provide a message for Gemini AI.\nExample: `.ai2 ඔයා හැදුවෙ කවුද`");

    const apiUrl = `https://lakiya-api-site.vercel.app/ai/gemini?q=${encodeURIComponent(q)}&CREATOR=WHITESHADOW`;
    const { data } = await axios.get(apiUrl);

    if (!data || !data.result) {
      await react("❌");
      return reply("Gemini AI failed to respond. Please try again later.");
    }

    // Number and jid
    const number = "94704896880";
    const jid = number + "@s.whatsapp.net";

    let thumb = Buffer.from([]);
    try {
      const ppUrl = await conn.profilePictureUrl(jid, "image");
      const ppResp = await axios.get(ppUrl, { responseType: "arraybuffer" });
      thumb = Buffer.from(ppResp.data, "binary");
    } catch (err) {
      console.log("❗ Couldn't fetch profile picture:", err.message);
    }

    const contactCard = {
      key: {
        fromMe: false,
        participant: '0@s.whatsapp.net',
        remoteJid: "status@broadcast"
      },
      message: {
        contactMessage: {
          displayName: "WHITESHADOW AI ✨",
          vcard: `BEGIN:VCARD
VERSION:3.0
FN:WHITESHADOW AI ✨
ORG:WHITESHADOW
TEL;type=CELL;type=VOICE;waid=${number}:+94 70 489 6880
END:VCARD`,
          jpegThumbnail: thumb
        }
      }
    };

    await conn.sendMessage(from, {
      text: `✨ *WHITESHADOW AI Response:*\n\n${data.result}`
    }, { quoted: contactCard });

    await react("✅");
  } catch (e) {
    console.error("Error in Gemini AI command:", e);
    await react("❌");
    reply("An error occurred while communicating with Gemini AI.");
  }
});
