const { cmd } = require('../command');
const yts = require('yt-search');
const axios = require("axios");

cmd({
    pattern: "songx",
    alias: ["playx"],
    desc: "Download YouTube songs",
    react: "🎶",
    category: "main",
    filename: __filename
}, async (conn, mek, m, { from, quoted, q, reply }) => {
    try {
        q = q ? q : '';
        if (!q) return reply("🔎 *Please provide a YouTube link or song title.*");

        reply("*🎧 Searching for your song...*");

        const search = await yts(q);
        if (!search.videos || !search.videos.length) {
            return reply("❌ No results found for: " + q);
        }

        const data = search.videos[0];
        const url = data.url;

        const caption = `
╭━━〔 🎧 *WHITESHADOW SONG DOWNLOADER* 〕━━⬣
┃🎵 *Title:* ${data.title}
┃🕒 *Duration:* ${data.timestamp}
┃👁 *Views:* ${data.views}
┃📅 *Uploaded:* ${data.ago}
┃🔗 *Link:* ${url}
╰━━━〔 Reply 1 | 2 | 3 〕━━━⬣
┃1️⃣ Audio 🎧
┃2️⃣ Document 📁
┃3️⃣ Voice 🔊
> 🔥 Powered by *WHITESHADOW-MD* 😈
`;

        const sentMsg = await conn.sendMessage(from, {
            image: { url: data.thumbnail },
            caption,
            contextInfo: {
                externalAdReply: {
                    title: data.title.length > 30 ? data.title.slice(0, 27) + "..." : data.title,
                    body: "🎶 WHITESHADOW SONG BOT",
                    mediaType: 1,
                    thumbnailUrl: data.thumbnail,
                    sourceUrl: url,
                    showAdAttribution: true,
                    renderLargerThumbnail: true
                },
                mentionedJid: [m.sender]
            }
        }, { quoted: mek });

        const messageID = sentMsg.key.id;

        // Listen for reply
        conn.ev.on('messages.upsert', async (msgUpdate) => {
            try {
                const msg = msgUpdate.messages[0];
                if (!msg.message) return;

                const txt = msg.message.conversation || msg.message.extendedTextMessage?.text;
                const isReply = msg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;
                const replyFrom = msg.key.remoteJid;

                if (!isReply || !['1', '2', '3'].includes(txt)) return;

                await conn.sendMessage(replyFrom, { react: { text: '⬇️', key: msg.key } });

                const apiUrl = "https://api.giftedtech.web.id/api/download/dlmp3?apikey=gifted&url=" + encodeURIComponent(url);
                const response = await axios.get(apiUrl);

                if (!response.data.success) {
                    return reply("❌ Failed to fetch audio for \"" + q + "\".");
                }

                const downloadUrl = response.data.result.download_url;

                if (txt === '1') {
                    await conn.sendMessage(replyFrom, {
                        audio: { url: downloadUrl },
                        mimetype: "audio/mp4",
                        ptt: false,
                        contextInfo: {
                            externalAdReply: {
                                title: data.title,
                                body: "🎧 WHITESHADOW-MD",
                                thumbnailUrl: data.thumbnail,
                                sourceUrl: url,
                                mediaType: 1,
                                showAdAttribution: true,
                                renderLargerThumbnail: true
                            }
                        }
                    }, { quoted: msg });

                } else if (txt === '2') {
                    await conn.sendMessage(replyFrom, {
                        document: { url: downloadUrl },
                        mimetype: "audio/mp3",
                        fileName: `${data.title}.mp3`,
                        caption: "> 🎧 *Powered by WHITESHADOW-MD* 😈"
                    }, { quoted: msg });

                } else if (txt === '3') {
                    await conn.sendMessage(replyFrom, {
                        audio: { url: downloadUrl },
                        mimetype: "audio/mp4",
                        ptt: true,
                        contextInfo: {
                            externalAdReply: {
                                title: data.title,
                                body: "🎤 WHITESHADOW-MD",
                                thumbnailUrl: data.thumbnail,
                                sourceUrl: url,
                                mediaType: 1,
                                showAdAttribution: true,
                                renderLargerThumbnail: true
                            }
                        }
                    }, { quoted: msg });
                }

                await conn.sendMessage(replyFrom, { react: { text: '✅', key: msg.key } });

            } catch (err) {
                console.log("Listener error: ", err.message);
            }
        });

    } catch (e) {
        console.error(e);
        reply("❌ An unexpected error occurred.");
    }
});



