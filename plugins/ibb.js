const { cmd } = require('../command');
const fetch = require('node-fetch');

cmd({
  pattern: "url3",
  alias: ["ibb", "imgbb"],
  react: "🌐",
  desc: "Upload image to imgbb",
  category: "tools",
  use: ".url3 <reply image / image url>",
  filename: __filename
}, async (conn, m, mek, { from, q, reply, isQuotedImage }) => {
  try {
    let imageUrl;

    if (isQuotedImage) {
      let media = await conn.downloadAndSaveMediaMessage(mek.quoted);
      imageUrl = media; 
    } else if (/^https?:\/\//.test(q)) {
      imageUrl = q;
    } else {
      return reply("⚠️ Please reply to an image or give me a valid image url.");
    }

    const apiUrl = `https://delirius-apiofc.vercel.app/tools/ibb?image=${encodeURIComponent(imageUrl)}&filename=WhiteShadow`;
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (!data.status) return reply("❌ Upload failed!");

    let txt = `⬤───〔 *🌐 IBB UPLOADER* 〕───⬤\n\n`;
    txt += `🆔 ID: ${data.data.id}\n`;
    txt += `📛 Name: ${data.data.name}\n`;
    txt += `📁 Filename: ${data.data.filename}\n`;
    txt += `📄 Extension: ${data.data.extension}\n`;
    txt += `📏 Size: ${data.data.size}\n`;
    txt += `📐 Resolution: ${data.data.width}x${data.data.height}\n`;
    txt += `📅 Published: ${data.data.published}\n`;
    txt += `🔗 URL: ${data.data.url}\n`;
    txt += `🖼️ Direct: ${data.data.image}\n\n`;
    txt += `© WhiteShadow-MD`;

    await conn.sendMessage(from, { image: { url: data.data.image }, caption: txt }, { quoted: mek });
  } catch (e) {
    console.log(e);
    reply("❌ Error occurred while uploading!");
  }
});
