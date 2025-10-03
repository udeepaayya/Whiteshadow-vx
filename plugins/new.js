/*
* Nama fitur : New Plugins Checker
* Type : Plugin
* Author : WhiteShadow
*/

import fs from "fs";
import path from "path";
import { cmd } from "../command.js";

const pluginFolder = path.join("./plugins");
const pluginDataFile = path.join(pluginFolder, "pluginData.json");

function ensurePluginData() {
    if (!fs.existsSync(pluginDataFile)) fs.writeFileSync(pluginDataFile, "[]");
}

function getNewPlugins() {
    ensurePluginData();

    const oldData = JSON.parse(fs.readFileSync(pluginDataFile, "utf-8") || "[]");

    const newPlugins = fs.readdirSync(pluginFolder).map(file => {
        const filePath = path.join(pluginFolder, file);
        const stats = fs.statSync(filePath);
        const old = oldData.find(p => p.name === file);
        if (!old) return { name: file, type: "new" };
        if (stats.mtimeMs > old.mtime) return { name: file, type: "updated" };
        return null;
    }).filter(Boolean);

    // Save current state
    const currentData = fs.readdirSync(pluginFolder).map(file => {
        const stats = fs.statSync(path.join(pluginFolder, file));
        return { name: file, mtime: stats.mtimeMs };
    });
    fs.writeFileSync(pluginDataFile, JSON.stringify(currentData, null, 2));

    return newPlugins;
}

cmd({
    pattern: "new",
    desc: "Show newly added or updated plugins",
    category: "bot",
    react: "🆕",
    filename: __filename
}, async (m, { client }) => {
    const newPlugins = getNewPlugins();
    if (!newPlugins.length) return m.reply("අලුත් plugin එකක් නෑ! ✅");

    let msg = "🆕 *New / Updated Plugins* 🆕\n\n";
    newPlugins.forEach(p => {
        msg += `• ${p.name} (${p.type})\n`;
    });

    m.reply(msg);
});
