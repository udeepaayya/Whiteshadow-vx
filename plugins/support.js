const config = require("../config");
const { cmd } = require("../command");

cmd({
  pattern: "support",
  alias: ["..", "fuck"], // 👈 extra aliases
  desc: "Show official support info",
  category: "info",
  react: "📢",
  filename: __filename,
}, async (conn, mek, m) => {
  try {
    const msg = `
╭━━━〔 *👑 WHITESHADOW-MD OFFICIAL 👑* 〕━━━╮

📢 *Stay Connected & Support Us!*

━━━━━━━━━━━━━━━
🌐 *TikTok*  
➡️ https://www.tiktok.com/@white.shadow468?_t=ZS-903M0JpWH3w&_r=1

━━━━━━━━━━━━━━━
📡 *Follow Our Official Channels:*  
☠ https://whatsapp.com/channel/0029Vak4dFAHQbSBzyxlGG13  
☠ https://whatsapp.com/channel/0029Vb4bj5zI7BeFm6aM8O1p  

━━━━━━━━━━━━━━━
🪸 *Pair Sites:*  
🍭 https://pair-9eqb.onrender.com/pair  
🍭 https://whiteshadow-x-pair.onrender.com/pair  
🍭 https://smart-pair-0c3d5d45b789.herokuapp.com/pair  
🍭 https://smartautomation-incm.onrender.com/

━━━━━━━━━━━━━━━
⚡ *Deploy Now (Heroku):*  
👑 https://heroku.com/deploy?template=https://github.com/cnw-db/Whiteshadow-vx.git

📍 *Repo:*  
🔗 https://github.com/cnw-db/Whiteshadow-vx.git

━━━━━━━━━━━━━━━
👤 *Owner:*  
📞 wa.me/${config.OWNER_NUMBER}

━━━━━━━━━━━━━━━
💎 *Powered By:* WHITESHADOW-MD ™
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
`;

    await conn.sendMessage(m.chat, {
      text: msg,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        externalAdReply: {
          title: "WHITESHADOW-MD • Official Support 💠",
          body: "Join our channels & follow updates 🚀",
          thumbnailUrl: "https://files.catbox.moe/fyr37r.jpg",
          sourceUrl: "https://github.com/cnw-db/Whiteshadow-vx.git",
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: mek });
  } catch (e) {
    console.log(e);
  }
});
