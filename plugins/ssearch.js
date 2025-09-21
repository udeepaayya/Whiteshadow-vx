/**
✨ Feature: Sticker Search (ssearch)
📝 Creator: chamod 
⚡ Modified: WhiteShadow-MD (using sticker-utils.js)
*/

import fetch from "node-fetch";
import { fetchImage, fetchGif, gifToSticker } from "../lib/sticker-utils.js";
import { cmd } from "../command.js";

cmd({
  pattern: "ssearch",
  alias: ["stickersearch", "searchsticker"],
  react: "🔎",
  desc: "Search and download stickers from Stickerly",
  category: "sticker",
  use: ".ssearch <keyword>",
  filename: __filename
}, async (conn, m, mek, { from, q, reply, prefix, command }) => {
  if (!q) return reply(`❌ Please enter a keyword!\n\n📌 Example: ${prefix + command} patrick`);

  try {
    let res = await fetch(`https://api-furina.vercel.app/search/stickerly?q=${encodeURIComponent(q)}`);
    if (!res.ok) return reply(`⚠️ API Error: ${await res.text()}`);

    let json = await res.json();
    if (!json.status || !json.results || !json.results.length) return reply(`❌ No stickers found.`);

    let stickers = json.results.slice(0, 10);

    for (let s of stickers) {
      try {
        let stickerBuffer;

        if (s.url.endsWith(".gif")) {
          // If GIF → convert to WebP
          const gifBuffer = await fetchGif(s.url);
          stickerBuffer = await gifToSticker(gifBuffer);
        } else {
          // If image → fetch as image buffer
          stickerBuffer = await fetchImage(s.url);
        }

        if (stickerBuffer) {
          await conn.sendFile(from, stickerBuffer, "sticker.webp", "", m, { quoted: mek });
        }
      } catch (e) {
        console.error(`❌ Failed to convert: ${s.url}`, e);
      }
    }

  } catch (e) {
    console.error(e);
    reply(`❌ Failed to search stickers!`);
  }
});
