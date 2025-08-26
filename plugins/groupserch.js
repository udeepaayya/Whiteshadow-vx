// plugins/groupsearch.js
// Safe WhatsApp Group Search with Category Filter (filters NSFW and under-18 content)
// Author: WhiteShadow-MD
// Command: .groupsearch <query> [--limit N] [--cat category]
// Example: .groupsearch car --limit 10 --cat Sports

const axios = require("axios");
const { cmd } = require("../command");

// ---- Safety filters ---------------------------------------------------------
const BLOCK_PATTERNS = [
  /18\+/i,
  /adult/i,
  /nsfw/i,
  /sex/i,
  /porn/i,
  /bokep/i,
  /xxx/i,
  /hot/i,
  /nude/i,
  /call boy/i,
  /call girl/i,
  /escort/i,
  /service/i,
  /lesbian/i,
  /gay/i,
  /horny/i,
  /fetish/i,
  /dirty/i,
  /colmek/i,
  /coly/i,
  /okep/i
];

function isUnsafe(item) {
  const text = `${item?.name || ""} ${item?.description || ""} ${item?.category || ""}`.toLowerCase();
  if (BLOCK_PATTERNS.some(r => r.test(text))) return true;
  // filter minors like "16,17" or "age 15"
  if (/\b(1[0-7]|[0-9])\b/.test(text)) return true;
  if (/age\s*(\d{1,2})/.test(text)) {
    const n = parseInt(text.match(/age\s*(\d{1,2})/)[1], 10);
    if (n < 18) return true;
  }
  return false;
}

function fmtItem(it, idx) {
  return `*${idx}. ${it.name?.trim() || "(no title)"}* — ${it.country || "Unknown"}\nCategory: ${it.category || "N/A"}\nLink: ${it.link}`;
}

// ---- Command ----------------------------------------------------------------
cmd({
  pattern: "groupsearch",
  alias: ["grsearch", "cari"],
  use: ".groupsearch <query> [--limit N] [--cat category]",
  desc: "Search safe WhatsApp groups (filters NSFW & under-18)",
  category: "search",
  react: "🔎",
  filename: __filename
},
async (conn, mek, m, { args, reply }) => {
  try {
    if (!args.length) {
      return reply("*Usage:* .groupsearch <query> [--limit N] [--cat category]");
    }

    // default values
    let limit = 15;
    let categoryFilter = null;

    // parse flags
    args = args.filter((a, i) => {
      if (a === "--limit" && args[i+1] && /^\d+$/.test(args[i+1])) {
        limit = Math.min(30, Math.max(1, parseInt(args[i+1])));
        return false; // remove both
      }
      if (a === "--cat" && args[i+1]) {
        categoryFilter = args[i+1].toLowerCase();
        return false;
      }
      return true;
    });

    const query = args.join(" ");
    const url = `https://api.nazirganz.space/api/internet/carigroup?query=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url, { timeout: 15000 });

    if (!data || data.status !== true || !Array.isArray(data.data)) {
      return reply("❌ Invalid API response.");
    }

    // filter safe
    let results = data.data.filter(it => !isUnsafe(it));

    // category filter
    if (categoryFilter) {
      results = results.filter(it => (it.category || "").toLowerCase().includes(categoryFilter));
    }

    // dedupe by link
    const seen = new Set();
    results = results.filter(it => {
      if (!it.link || seen.has(it.link)) return false;
      seen.add(it.link);
      return true;
    });

    if (!results.length) {
      return reply(`⚠️ No *safe* results for “${query}”${categoryFilter ? ` in category ${categoryFilter}` : ""}.`);
    }

    results = results.slice(0, limit);

    let text = `*WhatsApp Group Search* — “${query}”\nSafe results: ${results.length}\n\n`;
    results.forEach((it, i) => {
      text += fmtItem(it, i + 1) + "\n\n";
    });

    await reply(text.trim());
  } catch (e) {
    console.error("[groupsearch]", e);
    return reply("❌ Failed to fetch results. Try again later.");
  }
});

module.exports = {};
