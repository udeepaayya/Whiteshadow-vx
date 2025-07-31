const config = require('../config');
const { cmd, commands } = require('../command');

cmd({
    pattern: "ping",
    alias: ["speed", "pong"],
    use: '.ping',
    desc: "Check bot's response time.",
    category: "main",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, sender, reply }) => {
    try {
        const startTime = Date.now();

        const emojis = ['🔥', '⚡', '🚀', '💨', '🎯', '🎉', '🌟', '💥', '🕐', '🔹', '💎', '🏆', '🎶', '🌠', '🌀', '🔱', '🛡️', '✨'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

        // React with random emoji
        await conn.sendMessage(from, {
            react: { text: randomEmoji, key: mek.key }
        });

        const ping = Date.now() - startTime;

        // Speed badge and color
        let badge = '🐢 Slow', color = '🔴';
        if (ping <= 150) {
            badge = '🚀 Super Fast';
            color = '🟢';
        } else if (ping <= 300) {
            badge = '⚡ Fast';
            color = '🟡';
        } else if (ping <= 600) {
            badge = '⚠️ Medium';
            color = '🟠';
        }

        // Final message
        const text = `> *WHITESHADOW-MD ʀᴇsᴘᴏɴsᴇ: ${ping} ms ${randomEmoji}*\n> *sᴛᴀᴛᴜs: ${color} ${badge}*\n> *ᴠᴇʀsɪᴏɴ: ${config.version}*`;

        await conn.sendMessage(from, {
            text,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363317972190466@newsletter',
                    newsletterName: "WHITESHADOW-MD",
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("❌ Error in ping command:", e);
        reply(`⚠️ Error: ${e.message}`);
    }
});

// ping2 

cmd({
    pattern: "ping2",
    alias: ["speed2", "pong2"],
    use: '.ping2',
    desc: "Check bot's response time.",
    category: "main",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, sender, reply }) => {
    try {
        const startTime = Date.now();

        const emojis = ['🔥', '⚡', '🚀', '💨', '🎯', '🎉', '🌟', '💥', '🕐', '🔹', '💎', '🏆', '🎶', '🌠', '🌀', '🔱', '🛡️', '✨'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

        // React with random emoji
        await conn.sendMessage(from, {
            react: { text: randomEmoji, key: mek.key }
        });

        const ping = Date.now() - startTime;

        // Speed badge and color
        let badge = '🐢 Slow', color = '🔴';
        if (ping <= 150) {
            badge = '🚀 Super Fast';
            color = '🟢';
        } else if (ping <= 300) {
            badge = '⚡ Fast';
            color = '🟡';
        } else if (ping <= 600) {
            badge = '⚠️ Medium';
            color = '🟠';
        }

        // Final message
        const text = `> *WHITESHADOW-MD ʀᴇsᴘᴏɴsᴇ: ${ping} ms ${randomEmoji}*\n> *sᴛᴀᴛᴜs: ${color} ${badge}*\n> *ᴠᴇʀsɪᴏɴ: ${config.version}*`;

        await conn.sendMessage(from, {
            text,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363317972190466@newsletter',
                    newsletterName: "WHITESHADOW-MD",
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("❌ Error in ping2 command:", e);
        reply(`⚠️ Error: ${e.message}`);
    }
});

const axios = require("axios");
const { cmd } = require("../command");

cmd({
  pattern: "ping3",
  alias: ["ownerping", "contactping"],
  use: ".ping3",
  desc: "Show owner contact card with response speed.",
  category: "main",
  react: "📇",
  filename: __filename
},
async (conn, mek, m, { from, reply }) => {
  try {
    const start = Date.now();

    let thumb = Buffer.from([]);
    try {
      const ppUrl = await conn.profilePictureUrl("94704896880@s.whatsapp.net", "image");
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
          displayName: "Chamod Nimsara ✅",
          vcard: `BEGIN:VCARD
VERSION:3.0
FN:Chamod Nimsara ✅
ORG:WHITESHADOW-MD TEAM
TEL;type=CELL;type=VOICE;waid=94704896880:+94 70 489 6880
END:VCARD`,
          jpegThumbnail: thumb
        }
      }
    };

    const ping = Date.now() - start;

    await conn.sendMessage(from, {
      text: `📇 *Contact Card: Chamod Nimsara*\n\n⚡ *Speed:* \`${ping} ms\``,
    }, { quoted: contactCard });

  } catch (err) {
    console.error("❌ Error in ping3 command:", err);
    reply("⚠️ Error showing contact card.");
  }
});
