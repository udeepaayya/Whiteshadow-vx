// nanobanana - obfuscated with required-prompt logic
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { cmd } = require("../command");

(function(){
  // Base64 string parts (hidden)
  const p1 = "aHR0cHM6Ly9hcGk";
  const p2 = "ubmVrb2xhYnMubXk";
  const p3 = "uaWQvYWkvZ2VtaW5p";
  const p4 = "L25hbm8tYmFuYW5h";
  const _enc = [p1,p2,p3,p4].join("");

  const _d = s => Buffer.from(s, "base64").toString("utf8");
  const _qe = v => encodeURIComponent(v);

  cmd({
    pattern: "nanobanana",
    alias: ["nb","nano","banana"],
    react: "🎨",
    desc: "AI image edit with custom prompt (Anyone can use)",
    use: ".nanobanana [prompt] (reply to image)",
    category: "fun",
    filename: __filename
  }, async (client, message, args, { reply }) => {
    try {
      const q = message.quoted ? message.quoted : message;
      const mime = (q.msg || q).mimetype || "";
      if (!mime || !mime.startsWith("image/")) return reply("🖼️ කරුණාකර රූපයක් reply කරන්න!");

      // download image buffer
      const buf = await q.download();
      const tfn = path.join(os.tmpdir(), `up_${Date.now()}.jpg`);
      fs.writeFileSync(tfn, buf);

      // upload to catbox
      const fd = new FormData();
      fd.append("fileToUpload", fs.createReadStream(tfn));
      fd.append("reqtype", "fileupload");

      const up = await axios.post("https://catbox.moe/user/api.php", fd, { headers: fd.getHeaders() });
      const imgUrl = (up.data || "").toString().trim();

      // --- NEW: require prompt ---
      let prompt = "";
      if (Array.isArray(args)) prompt = args.join(" ").trim();
      else if (typeof args === "string") prompt = args.trim();
      // If no prompt provided -> inform user and stop
      if (!prompt) {
        try { fs.unlinkSync(tfn); } catch(e){}
        return reply(
          "⚠️ Prompt එකක් දාන්න කියලා.\nඋදා: `.nanobanana turn into a watercolor portrait, soft lighting`\n(සිංහලෙන්ත් ලිය පුළුවන්.)"
        );
      }
      // --------------------------

      // build API URL dynamically from encoded base
      const apiBase = _d(_enc); // decode to: https://api.nekolabs.my.id/ai/gemini/nano-banana
      const apiUrl = `${apiBase}?prompt=${_qe(prompt)}&imageUrl=${_qe(imgUrl)}`;

      // call nano-banana
      const res = await axios.get(apiUrl);

      // cleanup temp
      try { fs.unlinkSync(tfn); } catch(e){}

      if (res.data && res.data.status && res.data.result) {
        await client.sendMessage(message.chat, {
          image: { url: res.data.result },
          caption: `✨ *AI Edited Image*\n> Prompt: ${prompt}\n> WHITESHADOW-MD ⚡`
        });
      } else {
        reply("⚠️ API එකෙන් වැලඳෙන ප්‍රතිඵලයක් නොලැබුණේ.");
      }

    } catch (err) {
      console.error(err);
      reply("❌ දෝෂය: " + (err && err.message ? err.message : String(err)));
    }
  });
})();
