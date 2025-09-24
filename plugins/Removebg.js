/**
  ✧ Removebg - tool ✧ ───────────────────────
  𖣔 Type   : Plugin CMD
  𖣔 API    : https://api.zenzxz.my.id
  𖣔 Upload : Catbox.moe
*/

const fetch = require("node-fetch");
const FormData = require("form-data");
const { cmd } = require("../command");
const fs = require("fs");
const path = require("path");
const os = require("os");

// Upload to Catbox
async function catboxUpload(buffer) {
  let tmpFile = path.join(os.tmpdir(), Date.now() + ".jpg");
  fs.writeFileSync(tmpFile, buffer);

  let form = new FormData();
  form.append("reqtype", "fileupload");
  form.append("fileToUpload", fs.createReadStream(tmpFile));

  let res = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: form
  });

  fs.unlinkSync(tmpFile); // delete temp file
  return await res.text();
}

cmd({
  pattern: "removebg",
  alias: ["rbg"],
  desc: "Remove background from an image",
  category: "tools",
  react: "🖼️",
  filename: __filename
},
async (conn, m, { usedPrefix, command }) => {
  try {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || "";

    if (!mime || !/image\/(jpe?g|png)/.test(mime)) {
      return m.reply(`🍀 Please reply to or send a JPG/PNG image with the caption: ${usedPrefix + command}`);
    }

    let media = await q.download();
    if (!media) return m.reply("⚠️ Failed to download the image.");

    let up = await catboxUpload(media).catch(() => null);
    if (!up) return m.reply("⚠️ Failed to upload image to Catbox server.");

    let apiUrl = `https://api.zenzxz.my.id/tools/removebg?url=${encodeURIComponent(up)}`;
    let res = await fetch(apiUrl);

    if (!res.ok) return m.reply("🍂 Failed to connect to the RemoveBG API!");

    let json = await res.json();
    if (!json.status || !json.result?.url) {
      return m.reply("🍂 Failed to process the image. Please try another one.");
    }

    let buffer = Buffer.from(await (await fetch(json.result.url)).arrayBuffer());

    await conn.sendFile(
      m.chat,
      buffer,
      "removebg.png",
      `✨ *Background removed successfully!*\n📷 Preview: ${json.result.preview_demo}`,
      m
    );

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (e) {
    console.error(e);
    m.reply("🍂 An error occurred while removing the background.");
  }
});
