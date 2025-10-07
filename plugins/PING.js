// nanoBananaCatbox.js
import { cmd } from "../command.js";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";

cmd({
  pattern: "nanobanana",
  alias: ["nbanana", "clothcolor"],
  desc: "Upload image to catbox and change cloth color using Nano-Banana AI",
  type: "plugin",
  react: "🎨",
  async handler(m, { args, quoted, client }) {
    try {
      // 1️⃣ Check if user replied to an image
      const media = quoted?.media;
      if (!media) return m.reply("කරුණාකර image එකක් reply කරන්න.");

      // 2️⃣ Download the image
      const buffer = await client.downloadMedia(quoted); // WHITESHADOW-MD download method
      const tempFile = `./temp_${Date.now()}.jpg`;
      fs.writeFileSync(tempFile, buffer);

      // 3️⃣ Upload image to catbox
      const form = new FormData();
      form.append("reqtype", "fileupload");
      form.append("fileToUpload", fs.createReadStream(tempFile));

      const catboxRes = await axios.post("https://catbox.moe/user/api.php", form, {
        headers: form.getHeaders(),
      });

      const imageUrl = catboxRes.data; // Catbox returns URL directly

      // 4️⃣ Get user prompt
      const prompt = args.join(" ") || "Change the colour of cloth black";

      // 5️⃣ Send request to Nano-Banana API
      const apiUrl = `https://api.nekolabs.my.id/ai/gemini/nano-banana?prompt=${encodeURIComponent(prompt)}&imageUrl=${encodeURIComponent(imageUrl)}`;
      const response = await axios.get(apiUrl);
      const resultUrl = response.data.result;

      if (resultUrl) {
        m.reply("🖤 Nano-Banana AI result:");
        m.sendImage(resultUrl, "nanobanana.png", m.id);
      } else {
        m.reply("⚠️ API returned empty response. Try again later.");
      }

      // Delete temp file
      fs.unlinkSync(tempFile);
    } catch (err) {
      console.log(err);
      m.reply("❌ Error occurred while processing the image.");
    }
  },
});
