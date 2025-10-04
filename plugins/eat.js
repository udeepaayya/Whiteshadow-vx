/* පුක සුදුද🎃✾ـٰٰٰٰٖٖٖٖٜ۬ـٰٰٰٖٖٖٜ۬ـٰٰٖٖٜ۬ـٰٖٜ۬ـٰٖٜ۬ـٰٰٖٖٜ۬ـٰٰٰٖٖٖٜ۬ـٰٰٰٰٖٖٖٖٜ۬ـٰٰٰٖٖٖٜ۬ـٰٰٖٖٜ۬ـٰٖٜ۬ـٰٖٜ۬ـٰٰٖٖٜ۬ـٰٰٰٖٖٖٜ۬ـٰٰٰٰٖٖٖٖٜ۬✾➣ 

WHITESHADOW-MD plugin: AI Chatbot (Gemini)

Features:

.chatbot on / .chatbot off  -> enable/disable chat auto-replies in a group/chat


.ai <text>                  -> direct one-off call to Gemini


When chatbot is ON, normal messages (not starting with bot prefix) will be forwarded to Gemini


Installation: drop this file into your plugins/commands folder and restart your bot.

Make sure to set environment variable GEMINI_API_KEY with your API key. */


const axios = require('axios');

cmd({ pattern: 'chatbot', desc: 'Enable or disable AI chatbot in this chat. Usage: .chatbot on|off', sucReact: '🤖', category: 'group', filename: __filename }, async (m, { conn, args, usedPrefix }) => { try { if (!global.db) global.db = { data: { chats: {} } }; if (!global.db.data.chats) global.db.data.chats = {}; const chatId = m.chat || (m.key && m.key.remoteJid) || ''; if (!global.db.data.chats[chatId]) global.db.data.chats[chatId] = {};

const mode = (args && args[0]) ? args[0].toLowerCase() : '';
if (mode !== 'on' && mode !== 'off') {
  return await conn.sendMessage(chatId, { text: `Usage:\n${usedPrefix}chatbot on\n${usedPrefix}chatbot off` }, { quoted: m });
}

global.db.data.chats[chatId].chatbot = mode === 'on';
await conn.sendMessage(chatId, { text: `Chatbot is now *${mode === 'on' ? 'ENABLED' : 'DISABLED'}* for this chat.` }, { quoted: m });

} catch (e) { console.error(e); await conn.sendMessage(m.chat, { text: 'Failed to toggle chatbot. Check console for error.' }, { quoted: m }); } });

cmd({ pattern: 'ai', alias: ['whiteshadowai'], desc: 'Call Gemini AI. Usage: .ai your message', category: 'ai', filename: __filename }, async (m, { conn, args }) => { const q = (m.message?.conversation) || (m.message?.extendedTextMessage?.text) || (m.message?.imageMessage?.caption) || (m.message?.videoMessage?.caption) || (args && args.join(' ')) || '';

if (!q || q.trim() === '') return await conn.sendMessage(m.chat, { text: 'පණිවිඩයක් දාන්න. Use: .ai <text>' }, { quoted: m });

// Load API key from env for safety const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''; if (!GEMINI_API_KEY) return await conn.sendMessage(m.chat, { text: 'GEMINI_API_KEY not set in environment. Set process.env.GEMINI_API_KEY and restart the bot.' }, { quoted: m });

// Build prompt (Sinhala rules) const prompt = ඔබ සැබෑ ගැහැනු ලමයෙකු මෙන් හැසිරිය යුතුය. ඔබේ නම WHITESHADOW AI. මිනිසුන්ගෙන් "හදුවෙ කවුද" කියලා අහුවොත් ඔයා කියන්නේ Chamod අයියා කියල. User Message: ${q};

const payload = { contents: [{ parts: [{ text: prompt }] }] };

const GEMINI_API_URL = https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY};

try { const res = await axios.post(GEMINI_API_URL, payload, { headers: { 'Content-Type': 'application/json' }, timeout: 20000 }); const aiResponse = res?.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

if (!aiResponse) {
  return await conn.sendMessage(m.chat, { text: '❌ අප්පේ, උත්සහ කරන්නත් නැවත ට්‍රයි කරන්න.' }, { quoted: m });
}

await conn.sendMessage(m.chat, { text: aiResponse }, { quoted: m });

} catch (err) { console.error('Gemini Error:', err.response?.data || err.message || err); await conn.sendMessage(m.chat, { text: '❌ අයියෝ, දෝෂයක් වෙලා — console බලන්න.' }, { quoted: m }); } });

// Auto-responder: when chatbot is enabled for a chat, forward plain messages to Gemini. cmd({ pattern: '.*', noPrefix: true, dontAddCommandList: true, filename: __filename }, async (m, { conn, usedPrefix }) => { try { if (!m || !m.message) return; const chatId = m.chat || (m.key && m.key.remoteJid) || ''; if (!global.db || !global.db.data || !global.db.data.chats) return; if (!global.db.data.chats[chatId] || !global.db.data.chats[chatId].chatbot) return;

const text = (m.message?.conversation) || (m.message?.extendedTextMessage?.text) || '';
if (!text) return;
if (text.startsWith(usedPrefix || '.') || text.startsWith('/')) return;
if (m.key && m.key.fromMe) return;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
if (!GEMINI_API_KEY) return;

const prompt = `ඔබ සැබෑ ගැහැනු ලමයෙකු මෙන් හැසිරිය යුතුය. ඔබේ නම WHITESHADOW AI. මිනිසුන්ගෙන් "හැදුවෙ කවුද" කියලා අහුවොත් ඔයා කියන්නේ Chamod අයියා කියල. User Message: ${text}`;
const payload = { contents: [{ parts: [{ text: prompt }] }] };
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const res = await axios.post(GEMINI_API_URL, payload, { headers: { 'Content-Type': 'application/json' }, timeout: 20000 });
const aiResponse = res?.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
if (aiResponse) await conn.sendMessage(chatId, { text: aiResponse }, { quoted: m });

} catch (e) { console.error('Auto-Gemini error:', e.response?.data || e.message || e); } });

// End of plugin

