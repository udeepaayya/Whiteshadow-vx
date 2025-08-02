const { cmd } = require('../command');
const yts = require('yt-search');
const axios = require('axios');
const { getBuffer } = require('../lib/functions');

cmd({
  pattern: "songx",
  alias: ["playx", "mp3x"],
  desc: "Download YouTube songs",
  react: "🎶",
  category: "media",
  filename: __filename
}, async (conn, m, { from, text, reply }) => {
  try {
    const q = text?.trim();
    if (!q) return reply("🔎 Please provide a YouTube title or link, e.g. `.song Believer`");

    await reply("🎧 Searching for your song...");

    const search = await yts(q);
    if (!search.videos?.length) return reply("❌ No results found for: " + q);

    const data = search.videos[0];
    const { title, thumbnail, url, timestamp, views, ago } = data;

    const apiUrl = "https://api.giftedtech.web.id/api/download/dlmp3?apikey=gifted&url=" + encodeURIComponent(url);
    let response;
    try {
      response = await axios.get(apiUrl);
    } catch (e) {
      console.error("Axios error:", e.message);
      return reply("❌ API request failed. Try later.");
    }

    if (!response?.data?.success || !response.data.result?.download_url) {
      return reply("❌ Failed to fetch audio for \"" + q + "\".");
    }
    const downloadUrl = response.data.result.download_url;

    const cap = `
╭━━〔 🎧 WHITESHADOW‑MD SONG DOWNLOADER 〕━━⬣
┃🎵 Title: ${title}
┃⏱ Duration: ${timestamp}
┃👁 Views: ${views}
┃📅 Uploaded: ${ago}
┃🔗 Link: ${url}
╰━━━〔 Reply 1️⃣｜2️⃣｜3️⃣ 〕━━━⬣
┃1️⃣ Audio 🎧
┃2️⃣ Document 📁
┃3️⃣ Voice 🔊
> 🔥 Powered by *WHITESHADOW‑MD* 😈
`.trim();

    const thumbBuffer = await getBuffer(thumbnail);

    const sentMsg = await conn.sendMessage(from, {
      image: { url: thumbnail },
      caption: cap,
      contextInfo: {
        mentionedJid: [m.sender],
        externalAdReply: {
          title: title.length > 30 ? title.slice(0, 27) + "..." : title,
          body: "🎶 WHITESHADOW SONG BOT",
          mediaType: 1,
          thumbnailUrl: thumbnail,
          sourceUrl: url,
          showAdAttribution: true,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m });

    const msgId = sentMsg?.key?.id;

    // Listener only for replies to this message
    conn.ev.on('messages.upsert', async upd => {
      try {
        const msg = upd.messages?.[0];
        if (!msg || !msg.message || msg.key.fromMe) return;

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
        const isReply = msg.message.extendedTextMessage?.contextInfo?.stanzaId === msgId;

        if (!isReply || !['1', '2', '3'].includes(text)) return;

        const remoteJid = msg.key.remoteJid || from;
        const safeQuoted = msg.key?.id && remoteJid ? msg : undefined;

        await conn.sendMessage(remoteJid, { react: { text: '⬇️', key: msg.key } });

        let payload = {};
        if (text === '1') {
          payload = {
            audio: { url: downloadUrl },
            mimetype: "audio/mp4",
            ptt: false,
            contextInfo: {
              externalAdReply: {
                title,
                body: "🎧 WHITESHADOW‑MD",
                thumbnailUrl: thumbnail,
                sourceUrl: url,
                mediaType: 1,
                showAdAttribution: true,
                renderLargerThumbnail: true
              }
            }
          };
        } else if (text === '2') {
          payload = {
            document: { url: downloadUrl },
            mimetype: "audio/mp3",
            fileName: `${title}.mp3`,
            caption: "> 🎧 *Powered by WHITESHADOW‑MD*"
          };
        } else if (text === '3') {
          payload = {
            audio: { url: downloadUrl },
            mimetype: "audio/mp4",
            ptt: true,
            contextInfo: {
              externalAdReply: {
                title,
                body: "🎤 WHITESHADOW‑MD Voice",
                thumbnailUrl: thumbnail,
                sourceUrl: url,
                mediaType: 1,
                showAdAttribution: true,
                renderLargerThumbnail: true
              }
            }
          };
        }

        await conn.sendMessage(remoteJid, payload, { quoted: safeQuoted });
        await conn.sendMessage(remoteJid, { react: { text: '✅', key: msg.key } });
      } catch (err) {
        console.error("Listener MSG error:", err);
      }
    });

  } catch (e) {
    console.error("Main song catch:", e);
    reply("❌ Unexpected error occurred.");
  }
});
