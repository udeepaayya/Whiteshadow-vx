/*
  fb2.js
  Facebook video downloader for WHITESHADOW-MD (reply-choice based, no buttons)
  - Command: .fb2 <facebook url>
  - Shows title/description and asks user to reply 1 (SD) or 2 (HD)
  - On reply, sends the requested quality video
  - Uses API: https://supun-md-api-xmjh.vercel.app/api/download/fbdown?url=

  Install: place this file in your plugins folder and restart the bot.
*/

const axios = require('axios');
const { cmd } = require('../command');

// Main command: .fb2 <url>
cmd({
  pattern: 'fb2',
  alias: ['facebook2', 'fbdl2'],
  desc: 'Download Facebook videos (reply to choose SD/HD)',
  category: 'download',
  filename: __filename,
  use: '<Facebook URL>'
}, async (conn, m, store, { from, q, reply }) => {
  try {
    if (!q || !q.startsWith('http')) {
      return reply("*`Need a valid Facebook URL`*\n\nExample: `.fb2 https://www.facebook.com/...`");
    }

    // React with loading (if supported)
    try { await conn.sendMessage(from, { react: { text: '⏳', key: m.key } }); } catch (e) { /* ignore react errors */ }

    const apiUrl = `https://supun-md-api-xmjh.vercel.app/api/download/fbdown?url=${encodeURIComponent(q)}`;
    const res = await axios.get(apiUrl, { timeout: 20000 });
    const data = res.data;

    if (!data || !data.success || !data.results) {
      return reply('❌ Failed to fetch the video. Try another link.');
    }

    const { title = 'No video title', description = 'No description', hdLink, sdLink } = data.results;

    if (!hdLink && !sdLink) return reply('❌ No downloadable link found.');

    // Build menu message
    let menu = `📥 *Facebook Video Downloader (fb2)*\n\n`;
    menu += `*🎬 Title:* ${title}\n`;
    menu += `*📝 Description:* ${description}\n\n`;
    menu += `🔽 *Choose Quality by Replying Number*:\n`;
    if (sdLink) menu += `1️⃣ SD Quality\n`;
    if (hdLink) menu += `2️⃣ HD Quality\n`;
    menu += `\n⚡ Reply with *1* or *2* within 2 minutes.`;

    await conn.sendMessage(from, { text: menu }, { quoted: m });

    // Save download links in temporary store keyed by sender
    conn._fb2_pending = conn._fb2_pending || {};
    // store chat id too so we can check reply originates from same chat
    conn._fb2_pending[m.sender] = { sdLink, hdLink, chat: m.chat, expires: Date.now() + 120000 };

  } catch (err) {
    console.error('fb2 error:', err?.message || err);
    reply('❌ Error fetching the video. Please try again.');
  }
});

// Reply handler: listen to incoming messages and check for pending fb2 choices
cmd({ on: 'message', dontAddCommandList: true }, async (conn, m) => {
  try {
    if (!conn._fb2_pending) return;
    const user = m.sender;
    const pending = conn._fb2_pending[user];
    if (!pending) return;

    // only accept replies in same chat where the command was used
    if (m.chat !== pending.chat) return;

    // expire check (2 minutes)
    if (Date.now() > pending.expires) {
      delete conn._fb2_pending[user];
      try { await conn.sendMessage(m.chat, { text: '⌛ Time expired for FB download choice. Please run .fb2 again.' }, { quoted: m }); } catch (e) {}
      return;
    }

    const body = (m.body || '').trim();
    if (!body) return;

    // Accept '1' for SD and '2' for HD (also accept words 'sd','hd')
    if ((body === '1' || /^sd$/i.test(body)) && pending.sdLink) {
      const url = pending.sdLink;
      delete conn._fb2_pending[user];
      await conn.sendMessage(m.chat, { video: { url }, caption: '📥 *Facebook SD Video Downloaded*\n\n- Powered By WHITESHADOW-MD ✅' }, { quoted: m });
      return;
    }

    if ((body === '2' || /^hd$/i.test(body)) && pending.hdLink) {
      const url = pending.hdLink;
      delete conn._fb2_pending[user];
      await conn.sendMessage(m.chat, { video: { url }, caption: '📥 *Facebook HD Video Downloaded*\n\n- Powered By WHITESHADOW-MD ✅' }, { quoted: m });
      return;
    }

    // If user replies something else, ignore or prompt
    // (do not delete pending so they can try again)
    await conn.sendMessage(m.chat, { text: '❗ Reply invalid. Send *1* for SD or *2* for HD.' }, { quoted: m });

  } catch (err) {
    console.error('fb2 reply handler error:', err);
  }
});
