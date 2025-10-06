const { cmd } = require('../command');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/chatbotDB.json');

// Auto-create DB file if missing
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));

const loadDB = () => JSON.parse(fs.readFileSync(dbPath));
const saveDB = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

cmd({
  pattern: "chatbot",
  desc: "Turn chatbot AI on or off",
  react: "🤖",
  category: "AI"
}, async (m, { conn, text }) => {
  let db = loadDB();
  const id = m.isGroup ? m.chat : m.sender;
  const mode = text.trim().toLowerCase();

  if (!["on", "off"].includes(mode))
    return await conn.sendMessage(m.chat, { text: "⚙️ Usage: *.chatbot on* or *.chatbot off*" });

  db[id] = mode === "on";
  saveDB(db);

  await conn.sendMessage(m.chat, { text: `✅ Chatbot *${mode.toUpperCase()}* successfully for this chat.` });
});

cmd({
  on: "message"
}, async (m, { conn }) => {
  try {
    // Ignore commands or bot messages
    if (!m.text || m.text.startsWith('.') || m.text.startsWith('!')) return;

    let db = loadDB();
    const id = m.isGroup ? m.chat : m.sender;

    // Check if chatbot enabled
    if (!db[id]) return;

    // Get AI response
    const query = encodeURIComponent(m.text);
    const apiUrl = `https://whiteshadow-thz2.onrender.com/ai/gpt-5-mini?query=${query}`;

    const { data } = await axios.get(apiUrl);
    if (data && data.answer) {
      await conn.sendMessage(m.chat, { text: `🤖 *WhiteShadow AI:*\n${data.answer}` });
    }
  } catch (err) {
    console.error("Chatbot Error:", err.message);
  }
});
