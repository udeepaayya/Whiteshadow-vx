const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { cmd } = require("../command");

cmd({
  pattern: "url3",
  alias: ["ibb", "imgbb"],
  react: "🌐",
  desc: "Upload media or image URL to imgbb",
  category: "utility",
  use: ".url3 [reply to image / give url]",
  filename: __filename
}, async (client, message, args, { reply }) => {
  const cleanupFiles = (files) => {
    try {
      (Array.isArray(files) ? files : [files]).forEach(f => {
        if (f && fs.existsSync(f)) fs.unlinkSync(f);
      });
    } catch (e) { console.error("cleanup error:", e); }
  };

  try {
    let imageUrl;
    const quotedMsg = message.quoted ? message.quoted : message;
    const mimeType = (quotedMsg.msg || quotedMsg).mimetype || "";

    if (mimeType && mimeType.includes("image")) {
      // download image
      const mediaBuffer = await quotedMsg.download();
      if (!mediaBuffer) throw new Error("Failed to download image.");
      const tempFile = path.join(os.tmpdir(), `ibb_${Date.now()}.jpg`);
      fs.writeFileSync(tempFile, mediaBuffer);

      // upload file via form-data
      const form = new FormData();
      form.append("image", fs.createReadStream(tempFile));
      form.append("filename", "WhiteShadow");

      const res = await axios.post("https://delirius-apiofc.vercel.app/tools/ibb", form, {
        headers: form.getHeaders()
      });

      cleanupFiles(tempFile);
      imageUrl = res.data;
    } else if (/^https?:\/\//.test(args)) {
      // upload from link
      const res = await axios.get(
        `https://delirius-apiofc.vercel.app/tools/ibb?image=${encodeURIComponent(args)}&filename=WhiteShadow`
      );
      imageUrl = res.data;
    } else {
      throw "⚠️ Please reply to an image or provide a valid image URL.";
    }

    if (!imageUrl.status || !imageUrl.data) throw new Error("Upload failed!");

    const data = imageUrl.data;

    // Build verified-style card (text only, no vCard)
    const card =
`🔹 IBB Upload • Verified by WhiteShadow 🔹
────────────────────────
🆔 ID       : ${data.id}
📛 Name     : ${data.name}
📁 Filename : ${data.filename}
📄 Ext      : ${data.extension}
📏 Size     : ${data.size}
📐 Res      : ${data.width}x${data.height}
📅 Date     : ${data.published}
🔗 URL      : ${data.url}
🖼️ Direct   : ${data.image}
────────────────────────
© WhiteShadow-MD • ${new Date().toLocaleDateString()}
`;

    // send image preview + caption
    await client.sendMessage(message.from, {
      image: { url: data.image },
      caption: card
    }, { quoted: message });

  } catch (err) {
    console.error("url3 error:", err);
    await reply(`❌ Error: ${err.message || err}`);
  }
});
