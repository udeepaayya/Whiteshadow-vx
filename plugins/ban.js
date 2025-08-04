const fs = require("fs");
const path = require("path");
const { cmd } = require("../command");

const banFile = path.join(__dirname, "../lib/ban.json");

function loadBans() {
    if (!fs.existsSync(banFile)) fs.writeFileSync(banFile, "[]");
    return JSON.parse(fs.readFileSync(banFile, "utf-8"));
}

function saveBans(banned) {
    fs.writeFileSync(banFile, JSON.stringify([...new Set(banned)], null, 2));
}

// ✅ Ban Command
cmd({
    pattern: "ban",
    alias: ["blockuser", "addban"],
    desc: "Ban a user from using the bot",
    category: "owner",
    react: "⛔",
    filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
    if (!isCreator) return reply("_❗Only the bot owner can use this command!_");

    let target = m.mentionedJid?.[0] 
        || (m.quoted?.sender ?? null)
        || (args[0]?.replace(/[^0-9]/g, '') + "@s.whatsapp.net");

    if (!target || !target.includes("@s.whatsapp.net")) return reply("❌ Please tag, reply, or provide a valid number.");

    let banned = loadBans();

    if (banned.includes(target)) return reply("❌ This user is already banned.");

    banned.push(target);
    saveBans(banned);

    await conn.sendMessage(from, {
        image: { url: "https://files.catbox.moe/fnmvlq.jpg" },
        caption: `⛔ *User has been banned from using the bot.*\n\n👤 *ID:* ${target}`
    }, { quoted: mek });
});

// ✅ Unban Command
cmd({
    pattern: "unban",
    alias: ["removeban"],
    desc: "Unban a user",
    category: "owner",
    react: "✅",
    filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
    if (!isCreator) return reply("_❗Only the bot owner can use this command!_");

    let target = m.mentionedJid?.[0] 
        || (m.quoted?.sender ?? null)
        || (args[0]?.replace(/[^0-9]/g, '') + "@s.whatsapp.net");

    if (!target || !target.includes("@s.whatsapp.net")) return reply("❌ Please tag, reply, or provide a valid number.");

    let banned = loadBans();

    if (!banned.includes(target)) return reply("❌ This user is not banned.");

    saveBans(banned.filter(u => u !== target));

    await conn.sendMessage(from, {
        image: { url: "https://files.catbox.moe/fnmvlq.jpg" },
        caption: `✅ *User has been unbanned.*\n\n👤 *ID:* ${target}`
    }, { quoted: mek });
});

// ✅ List Ban Command
cmd({
    pattern: "listban",
    alias: ["banlist", "bannedusers"],
    desc: "List all banned users",
    category: "owner",
    react: "📋",
    filename: __filename
}, async (conn, mek, m, { from, isCreator, reply }) => {
    if (!isCreator) return reply("_❗Only the bot owner can use this command!_");

    let banned = loadBans();

    if (banned.length === 0) return reply("✅ No banned users found.");

    let msg = "⛔ *Banned Users List:*\n\n";
    msg += banned.map((id, i) => `${i + 1}. wa.me/${id.replace("@s.whatsapp.net", "")}`).join("\n");

    await conn.sendMessage(from, {
        image: { url: "https://files.catbox.moe/fnmvlq.jpg" },
        caption: msg
    }, { quoted: mek });
});
