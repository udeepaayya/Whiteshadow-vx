// yts2.js
// Usage:
//  - .yts2 <query>     -> shows numbered search results
//  - reply with a number (e.g. "1") in the same chat -> shows that video's details + thumbnail
// Requirements: axios
// Place in your plugins folder and restart the bot.

const { cmd } = require('../command');
const axios = require('axios');

const yts2_cache = new Map(); // key: chatId, value: { by: senderId, results: [...] , query: '' }

function numberWithCommas(x) {
  if (!x && x !== 0) return x;
  const s = String(x);
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

cmd({
  pattern: 'yts2 ?(.*)',
  desc: 'Search YouTube (yts2) and list results. Reply with the number to get details.',
  category: 'download',
  react: '🔎',
  filename: __filename
}, async (conn, mek, q, map) => {
  try {
    const chatId = mek.chat;
    const sender = mek.sender;
    const query = (q && q.trim()) || '';

    if (!query) {
      return conn.sendMessage(chatId, { text:
        'Use: .yts2 <search term>\n\nExample: .yts2 lelena'
      }, { quoted: mek });
    }

    await conn.sendMessage(chatId, { text: `🔎 Searching for: ${query}\nPlease wait...` }, { quoted: mek });

    // Use the user's provided API endpoint (they provided it earlier)
    const apiUrl = `https://whiteshadow-yts.vercel.app/?q=${encodeURIComponent(query)}`;

    const res = await axios.get(apiUrl, { timeout: 15000 });
    const data = res.data;

    if (!data || !Array.isArray(data.videos) || data.videos.length === 0) {
      return conn.sendMessage(chatId, { text: `No results found for: ${query}` }, { quoted: mek });
    }

    const results = data.videos.slice(0, 10); // top 10

    // Cache results keyed by chat id; allow only the same user who queried to pick
    yts2_cache.set(chatId, { by: sender, results, query, ts: Date.now() });

    let listMsg = `🔎 Search Results for: ${query}\n\n`;
    results.forEach((v, i) => {
      const title = v.name || v.title || 'Untitled';
      const dur = v.duration || v.time || '-';
      listMsg += `${i + 1}. ${title} [${dur}]\n`;
    });
    listMsg += `\nReply with the number (1-${results.length}) to get details and thumbnail.`;

    // Try to send a message with a quick preview (first thumbnail) + list as caption/text
    const firstThumb = results[0].thumbnail;

    try {
      if (firstThumb) {
        await conn.sendMessage(chatId, {
          image: { url: firstThumb },
          caption: listMsg
        }, { quoted: mek });
      } else {
        await conn.sendMessage(chatId, { text: listMsg }, { quoted: mek });
      }
    } catch (err) {
      // fallback to plain text if image send fails
      await conn.sendMessage(chatId, { text: listMsg }, { quoted: mek });
    }
  } catch (err) {
    console.error(err);
    return conn.sendMessage(mek.chat, { text: 'Error while searching. Try again later.' }, { quoted: mek });
  }
});


// Handler to accept plain-number replies (1,2,3...) and return selected video
cmd({
  pattern: '^([0-9]{1,2})$',
  fromMe: false,
  desc: 'Reply number handler for yts2 results',
  category: 'download',
  filename: __filename
}, async (conn, mek, q) => {
  try {
    const chatId = mek.chat;
    const sender = mek.sender;
    const text = (q || '').trim();
    if (!/^\d+$/.test(text)) return; // ignore

    const cache = yts2_cache.get(chatId);
    if (!cache) return; // no pending yts2 for this chat

    // Only allow same user who made the query to pick (prevents others hijacking)
    if (cache.by !== sender) {
      // optional: allow anyone? for now restrict
      return conn.sendMessage(chatId, { text: 'Only the user who made the search can select a result.' }, { quoted: mek });
    }

    const idx = parseInt(text, 10) - 1;
    if (idx < 0 || idx >= cache.results.length) {
      return conn.sendMessage(chatId, { text: `Invalid number. Reply with 1 to ${cache.results.length}.` }, { quoted: mek });
    }

    const v = cache.results[idx];

    const title = v.name || v.title || 'Untitled';
    const url = v.url || (v.id ? `https://www.youtube.com/watch?v=${v.id}` : 'N/A');
    const duration = v.duration || v.time || '-';
    const views = v.views ? numberWithCommas(v.views) : (v.viewsText || '-');
    const author = v.author || v.channel || v.authorName || '-';
    const published = v.published || v.publishTime || v.publishedText || '-';
    const description = v.description || (v.desc && v.desc.slice(0, 800)) || '';

    const caption =
`🎵 ${title}
📺 Channel: ${author}
👁️ Views: ${views}
⏱️ Duration: ${duration}
📅 Published: ${published}

🔗 ${url}

${description ? `\n📝 ${description}` : ''}`;

    // send thumbnail as image with caption
    const thumb = v.thumbnail || (v.thumbnails && v.thumbnails[0]) || null;

    try {
      if (thumb) {
        await conn.sendMessage(chatId, {
          image: { url: thumb },
          caption
        }, { quoted: mek });
      } else {
        await conn.sendMessage(chatId, { text: caption }, { quoted: mek });
      }
    } catch (err) {
      // fallback to text
      await conn.sendMessage(chatId, { text: caption }, { quoted: mek });
    }

    // Optionally, clear cache for this chat to avoid reuse (or keep it)
    yts2_cache.delete(chatId);
  } catch (err) {
    console.error(err);
    return conn.sendMessage(mek.chat, { text: 'Error processing selection.' }, { quoted: mek });
  }
});
