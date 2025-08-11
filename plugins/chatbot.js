require('dotenv').config();
const { cmd } = require('../command');
const OpenAI = require('openai');

// Create OpenAI instance with API key from .env
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// In-memory user AI status
const userSettings = {}; // { jid: { aiEnabled: true/false } }

// Command: AI ON/OFF
cmd({
  pattern: 'whiteshadowai ?(on|off)?',
  desc: 'Turn Whiteshadow AI chatbot ON or OFF',
  category: 'settings',
  react: '🤖',
  filename: __filename
}, async (conn, mek, m, { args, reply }) => {
  const userId = m.sender;

  if (!args[0]) {
    return reply(`Whiteshadow AI chatbot status:\n${userSettings[userId]?.aiEnabled ? '✅ Enabled' : '❌ Disabled'}\n\nUse:\n.whiteshadowai on\n.whiteshadowai off`);
  }

  const action = args[0].toLowerCase();
  if (action === 'on') {
    userSettings[userId] = { aiEnabled: true };
    reply('✅ Whiteshadow AI chatbot is now *ON* for you!');
  } else if (action === 'off') {
    userSettings[userId] = { aiEnabled: false };
    reply('❌ Whiteshadow AI chatbot is now *OFF* for you!');
  } else {
    reply('❌ Invalid option! Use "on" or "off".');
  }
});

// AI Chat handler
async function whiteshadowAIChat(conn, m) {
  const userId = m.sender;
  if (!userSettings[userId]?.aiEnabled) return;

  const chatId = m.key.remoteJid || '';
  const isGroup = chatId.endsWith('@g.us');

  let userMessage = '';
  if (m.message.conversation) userMessage = m.message.conversation.trim();
  else if (m.message.extendedTextMessage?.text) userMessage = m.message.extendedTextMessage.text.trim();
  else return;

  if (isGroup) {
    if (/කවුද ඔයා|kauwda oya/i.test(userMessage)) {
      return conn.sendMessage(chatId, { text: 'Whiteshadow' }, { quoted: m });
    }
    if (/whiteshadow ගේ ඇත්ත නම|whiteshadow ge aththa nama/i.test(userMessage)) {
      return conn.sendMessage(chatId, { text: 'චමෝද් නිම්සර' }, { quoted: m });
    }
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are Whiteshadow AI assistant. Friendly, helpful, and funny. Answer in Sinhala or Singlish if possible."
        },
        { role: "user", content: userMessage }
      ],
    });

    const replyText = response.choices[0].message.content;
    await conn.sendMessage(chatId, { text: replyText }, { quoted: m });
  } catch (e) {
    console.error("Whiteshadow AI chat error:", e);
  }
}

// Listen for new messages
conn.ev.on('messages.upsert', async (chatUpdate) => {
  const m = chatUpdate.messages[0];
  if (!m.message || m.key.fromMe) return;

  if (m.message?.conversation?.startsWith('.')) return;

  await whiteshadowAIChat(conn, m);
});
