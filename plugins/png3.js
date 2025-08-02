const { cmd } = require('../command');
const axios = require("axios");

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
