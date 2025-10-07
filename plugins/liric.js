// plugins/lyrics.js
// Lyrics search/download plugin for WhiteShadow-MD
// Usage: .lyrics <song name>  OR  .ly <song name>

const { cmd } = require("../command");
const axios = require("axios");

// -------------------------
// Base64-encoded base API (light obfuscation)
// Replace this value if you want to encode another base URL
const BASE64_API = "aHR0cHM6Ly9hcGkubmVrb2xhYnMubXkuaWQ="; // https://api.nekolabs.my.id
function getBaseApi() {
  try {
    return Buffer.from(BASE64_API, "base64").toString("utf8");
  } catch (e) {
    console.error("BASE64 decode error:", e);
    return "https://api.nekolabs.my.id";
  }
}
const BASE_API = getBaseApi();
// -------------------------

cmd({
  pattern: "lyrics",
  alias: ["ly", "songlyrics"],
  desc: "Search song lyrics (nekolabs). Usage: .lyrics <song name>",
  react: "🎵",
  category: "downloader",
  filename: __filename
}, async (conn, m, store, { from, q, reply }) => {
  try {
    if (!q || q.trim().length === 0) {
      return reply("❌ Please provide a song name.\n\n*Example:* .lyrics Lelena");
    }

    // show processing react (best-effort)
    try { await conn.sendMessage(from, { react: { text: "⏳", key: m.key } }); } catch(e){}

    const searchUrl = `${BASE_API}/discovery/lyrics/search?q=${encodeURIComponent(q.trim())}`;

    const res = await axios.get(searchUrl, { timeout: 20000 });
    const body = res.data;

    if (!body || !body.status || !Array.isArray(body.result) || body.result.length === 0) {
      return reply(`⚠️ No lyrics found for *${q.trim()}*.`);
    }

    // pick the first best match
    const item = body.result[0];
    const title = item.trackName || item.name || "Unknown";
    const artist = item.artistName || "Unknown";
    const album = item.albumName || "";
    const durationSec = item.duration || 0;
    const minutes = Math.floor(durationSec / 60);
    const seconds = durationSec % 60;
    const durationStr = durationSec ? `${minutes}:${String(seconds).padStart(2,"0")}` : "Unknown";

    const plainLyrics = item.plainLyrics && item.plainLyrics.trim().length ? item.plainLyrics.trim() : null;
    const syncedLyrics = item.syncedLyrics && item.syncedLyrics.trim() ? item.syncedLyrics.trim() : null;

    // Build message
    let text = [
      "🎶 *Lyrics Found!*",
      "",
      `*Title:* ${title}`,
      `*Artist:* ${artist}`,
      album ? `*Album:* ${album}` : "",
      `*Duration:* ${durationStr}`,
      "",
      plainLyrics ? "*Lyrics:*" : "No plain lyrics available.",
      plainLyrics ? plainLyrics.split("\n").slice(0, 50).join("\n") : "",
      "",
      syncedLyrics ? "🔽 Synced lyrics attached as .lrc file." : "",
      "",
      "> 🔰 Powered by WhiteShadow-MD"
    ].filter(Boolean).join("\n");

    // Send the text message (truncate if extremely long)
    const MAX_LENGTH = 6000;
    if (text.length > MAX_LENGTH) {
      // send header + short excerpt, then send full lyrics as file below
      await conn.sendMessage(from, { text: text.slice(0, MAX_LENGTH) }, { quoted: m });
    } else {
      await conn.sendMessage(from, { text }, { quoted: m });
    }

    // If syncedLyrics exist, send as .lrc file (and also send full plain lyrics as .txt if available)
    if (syncedLyrics) {
      const lrcBuffer = Buffer.from(syncedLyrics, "utf8");
      const fileNameSafe = `${(title + " - " + artist).replace(/[\/\\#%&\{\}\*:<>\?\"|\^~\[\]`]/g, "_").slice(0, 120)}.lrc`;

      try {
        await conn.sendMessage(from, {
          document: lrcBuffer,
          fileName: fileNameSafe,
          mimetype: "text/plain"
        }, { quoted: m });
      } catch (e) {
        // fallback: send synced lyrics as plain text if document send fails
        await conn.sendMessage(from, { text: "🔽 *Synced lyrics:* \n\n" + syncedLyrics }, { quoted: m });
      }
    } else if (plainLyrics && plainLyrics.length > 2000) {
      // if plainLyrics very long, offer as text file
      const txtBuffer = Buffer.from(plainLyrics, "utf8");
      const txtName = `${(title + " - " + artist).replace(/[\/\\#%&\{\}\*:<>\?\"|\^~\[\]`]/g, "_").slice(0, 120)}.txt`;
      try {
        await conn.sendMessage(from, {
          document: txtBuffer,
          fileName: txtName,
          mimetype: "text/plain"
        }, { quoted: m });
      } catch (e) {
        // fallback: split into chunks and send
        const chunks = plainLyrics.match(/[\s\S]{1,1800}/g) || [plainLyrics];
        for (const c of chunks) {
          await conn.sendMessage(from, { text: c }, { quoted: m });
        }
      }
    }

  } catch (err) {
    console.error("lyrics plugin error:", err && err.stack ? err.stack : err);
    try { reply("❌ Error searching lyrics. Try again later."); } catch(e){}
  }
});
