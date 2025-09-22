const { cmd } = require('../command');
const axios = require("axios");

cmd({
  pattern: "ibb",
  alias: ["imgbb", "uploadibb", "url3"],
  react: "🖼️",
  desc: "Upload image to imgbb & return fake verified vCard",
  category: "utility",
  filename: __filename
}, async (conn, m, { reply, q, isQuotedImage }) => {
  try {
    let imageUrl;

    // Get image either from quoted message or from text URL
    if (isQuotedImage) {
      const mediaBuffer = await m.quoted.download();
      const base64 = mediaBuffer.toString("base64");
      imageUrl = `data:image/jpeg;base64,${base64}`;
    } else if (/^https?:\/\//.test(q)) {
      imageUrl = q;
    } else {
      return reply("⚠️ Please reply to an image or provide a valid image URL.");
    }

    // Call Delirius API
    const apiRes = await axios.get(`https://delirius-apiofc.vercel.app/tools/ibb?image=${encodeURIComponent(imageUrl)}&filename=WhiteShadow`);
    const data = apiRes.data?.data;

    if (!data || !data.url) return reply("❌ Upload failed!");

    // Build caption / verified style vCard
    const vcardMsg = {
      contacts: {
        displayName: `WHITESHADOW Upload • ${data.name}`,
        contacts: [{
          vcard: `BEGIN:VCARD
VERSION:3.0
FN:${data.name}
ORG:WHITESHADOW-MD
TEL;type=CELL;type=VOICE;waid=94704896880:+94 70 489 6880
URL:${data.url}
NOTE:Filename: ${data.filename}\nSize: ${data.size}\nResolution: ${data.width}x${data.height}
PHOTO;VALUE=URI:${data.image}
END:VCARD`
        }]
      }
    };

    // Send fake verified contact
    await conn.sendMessage(m.chat, vcardMsg, { quoted: m });

    // Send image with caption as preview
    const caption = `⬤───〔 *IBB UPLOAD* 〕───⬤
🆔 ID: ${data.id}
📛 Name: ${data.name}
📁 Filename: ${data.filename}
📄 Ext: ${data.extension}
📏 Size: ${data.size}
📐 Res: ${data.width}x${data.height}
📅 Published: ${data.published}
🔗 Link: ${data.url}
🖼️ Direct: ${data.image}
────────────────────
© WHITESHADOW-MD`;

    await conn.sendMessage(m.chat, { image: { url: data.image }, caption }, { quoted: m });

  } catch (e) {
    console.log(e);
    reply(`❌ Error: ${e.message || e}`);
  }
});
