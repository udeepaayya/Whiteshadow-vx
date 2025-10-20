const fetch = require('node-fetch');
const config = require('../config');
const { cmd } = require('../command');

cmd({
    pattern: "repo",
    alias: ["sc", "script", "info"],
    desc: "Fetch GitHub repository information",
    react: "📂",
    category: "info",
    filename: __filename,
},
async (conn, mek, m, { from, reply }) => {
    const githubRepoURL = 'https://github.com/cnw-db/Whiteshadow-vx.git';
    const channelLink = "https://whatsapp.com/channel/0029Vaj3Xnu17EmtDxTNnQ0G";

    try {
        const cleanUrl = githubRepoURL.replace(/\.git$/, "").replace(/\/+$/, "");
        const match = cleanUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (!match) return reply("⚠️ Invalid GitHub repo URL set in code!");

        const [, username, repoName] = match;
        const response = await fetch(`https://api.github.com/repos/${username}/${repoName}`);
        if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);

        const repoData = await response.json();

        const caption = `📦 *Repository*: ${repoData.name}
👑 *Owner*: ${repoData.owner.login}
⭐ *Stars*: ${repoData.stargazers_count}
🍴 *Forks*: ${repoData.forks_count}
🛠 *Issues*: ${repoData.open_issues_count}
📅 *Updated*: ${new Date(repoData.updated_at).toLocaleDateString()}
🔗 *URL*: ${repoData.html_url}

📝 *Description*: ${repoData.description || 'No description'}

> ${config.DESCRIPTION}`;

        // Send repo info with interactive buttons
        await conn.sendMessage(from, {
            image: { url: config.MENU_IMAGE_URL || "https://files.catbox.moe/cz2592.jpeg" },
            caption,
            footer: `👑 ${config.BOT_NAME || 'WHITESHADOW-MD'} 👑`,
            buttons: [
                { buttonId: "repo_stars", buttonText: { displayText: `⭐ Stars (${repoData.stargazers_count})` }, type: 1 },
                { buttonId: "repo_forks", buttonText: { displayText: `🍴 Forks (${repoData.forks_count})` }, type: 1 },
                { buttonId: "repo_channel", buttonText: { displayText: "📢 Join Channel" }, type: 1 }
            ],
            headerType: 4
        }, { quoted: mek });

        await conn.sendMessage(from, {
            audio: { url: "https://files.catbox.moe/mpt43m.mp3" },
            mimetype: "audio/mp4",
            ptt: true
        }, { quoted: mek });

    } catch (error) {
        console.error("Repo command error:", error);
        reply(`❌ Error: ${error.message}`);
    }
});


// ---------------------------
// ✅ පුක සුදුද
// ---------------------------
cmd({
    pattern: "repo_btn",
    dontAddCommandList: true,
    on: "message"
}, async (conn, mek, m, { from, reply }) => {
    try {
        const btn = m?.message?.buttonsResponseMessage?.selectedButtonId;
        if (!btn) return;

        if (btn === "repo_stars") {
            return reply("🌟 Stars show repo popularity. More stars = more users love this project!");
        } else if (btn === "repo_forks") {
            return reply("🍴 Forks mean how many developers copied this repo to work on.");
        } else if (btn === "repo_channel") {
            return conn.sendMessage(from, {
                text: "📢 Join our WhatsApp Channel:\nhttps://whatsapp.com/channel/0029Vaj3Xnu17EmtDxTNnQ0G"
            }, { quoted: mek });
        }
    } catch (e) {
        console.error("Button handler error:", e);
    }
});
