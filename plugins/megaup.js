/*
 * 🧩 Feature : Mega.nz Uploader
 * 👨‍💻 Author  : ZenzzXD | Modified for WhiteShadow-MD
 */

import { Storage } from "megajs";
import { cmd } from "../command.js";

const email = "xabor97197@colimarl.com";      // Mega.nz email (register first)
const password = "xabor97197@colimarl.com";    // Mega.nz password

// === Function : Upload File to Mega.nz ===
async function uploadToMega(fileName, buffer) {
  const storage = await new Storage({ email, password }).ready;
  const file = await storage.upload(fileName, buffer).complete;
  return await file.link();
}

cmd({
  pattern: "upmeganz",
  alias: ["upmega", "megaupload"],
  react: "📤",
  desc: "Upload any media/file (doc, video, audio, image, etc) to Mega.nz cloud storage.",
  category: "tools",
  use: ".upmeganz [reply media/file]",
},
async (conn, m) => {
  try {
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || "";
    if (!mime) return await m.reply("⚠️ Reply a *document/video/audio/image* with *.upmeganz* to upload.");

    const buffer = await q.download();
    if (!buffer) return await m.reply("❌ Failed to download file.");

    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    // Auto detect file name
    let fileName = q.filename || `WhiteShadow_${Date.now()}.${mime.split("/")[1] || "bin"}`;

    const link = await uploadToMega(fileName, buffer);

    await m.reply(
      `✅ *Upload Success!*\n\n` +
      `📂 *File:* ${fileName}\n` +
      `🔗 *Link:* ${link}\n\n` +
      `⚡ Uploaded via *WhiteShadow-MD*`
    );

  } catch (err) {
    await m.reply(`❌ Upload Error:\n\`\`\`${err.message}\`\`\``);
  }
});
