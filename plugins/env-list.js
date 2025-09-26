const fs = require("fs");
const path = require("path");
const config = require("../config");
const { cmd } = require("../command");

const envPath = path.join(__dirname, "..", ".env");

// helper to show ✅ ❌
function check(val) {
  return val && val.toString().toLowerCase() === "true" ? "✅" : "❌";
}

// read .env file
function readEnv() {
  if (!fs.existsSync(envPath)) return {};
  let content = fs.readFileSync(envPath, "utf-8").split("\n");
  let env = {};
  content.forEach(line => {
    if (line && line.includes("=")) {
      let [key, ...val] = line.split("=");
      env[key.trim()] = val.join("=").trim();
    }
  });
  return env;
}

// write .env file
function writeEnv(newEnv) {
  let content = Object.entries(newEnv)
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
  fs.writeFileSync(envPath, content, "utf-8");
}

cmd({
  pattern: "env",
  alias: ["config", "settings"],
  desc: "Show config & toggle ON/OFF (Owner Only, Permanent)",
  category: "system",
  react: "⚙️",
  filename: __filename,
}, 
async (conn, mek, m, { from, reply, isCreator }) => {
  if (!isCreator) return reply("🚫 *Owner Only!*");

  let env = readEnv();

  let text = `
╭───〔 ⚙️ ${config.BOT_NAME} SETTINGS 〕───❏

├─ ⚡ CORE
│ 1. PUBLIC_MODE   : ${check(env.PUBLIC_MODE)}
│ 2. ALWAYS_ONLINE : ${check(env.ALWAYS_ONLINE)}
│ 3. READ_MESSAGE  : ${check(env.READ_MESSAGE)}
│ 4. READ_CMD      : ${check(env.READ_CMD)}

├─ 🤖 AUTO
│ 5. AUTO_REPLY    : ${check(env.AUTO_REPLY)}
│ 6. AUTO_REACT    : ${check(env.AUTO_REACT)}
│ 7. CUSTOM_REACT  : ${check(env.CUSTOM_REACT)}
│ 8. AUTO_STICKER  : ${check(env.AUTO_STICKER)}
│ 9. AUTO_VOICE    : ${check(env.AUTO_VOICE)}

├─ 📢 STATUS
│ 10. AUTO_STATUS_SEEN   : ${check(env.AUTO_STATUS_SEEN)}
│ 11. AUTO_STATUS_REPLY  : ${check(env.AUTO_STATUS_REPLY)}
│ 12. AUTO_STATUS_REACT  : ${check(env.AUTO_STATUS_REACT)}

├─ 🛡 SECURITY
│ 13. ANTI_LINK    : ${check(env.ANTI_LINK)}
│ 14. ANTI_BAD     : ${check(env.ANTI_BAD)}
│ 15. ANTI_VV      : ${check(env.ANTI_VV)}
│ 16. DELETE_LINKS : ${check(env.DELETE_LINKS)}

├─ ⏳ MISC
│ 17. AUTO_TYPING  : ${check(env.AUTO_TYPING)}
│ 18. AUTO_RECORDING : ${check(env.AUTO_RECORDING)}

╰───〔 Reply with a number (1-18) to toggle 〕
`;

  await conn.sendMessage(from, { text }, { quoted: mek });
});

// toggle system with permanent save
cmd({
  pattern: ".*",
  dontAddCommandList: true
}, async (conn, mek, m, { from, body, reply, isCreator }) => {
  if (!isCreator) return;

  let choice = body.trim();
  const map = {
    "1": "PUBLIC_MODE",
    "2": "ALWAYS_ONLINE",
    "3": "READ_MESSAGE",
    "4": "READ_CMD",
    "5": "AUTO_REPLY",
    "6": "AUTO_REACT",
    "7": "CUSTOM_REACT",
    "8": "AUTO_STICKER",
    "9": "AUTO_VOICE",
    "10": "AUTO_STATUS_SEEN",
    "11": "AUTO_STATUS_REPLY",
    "12": "AUTO_STATUS_REACT",
    "13": "ANTI_LINK",
    "14": "ANTI_BAD",
    "15": "ANTI_VV",
    "16": "DELETE_LINKS",
    "17": "AUTO_TYPING",
    "18": "AUTO_RECORDING"
  };

  if (map[choice]) {
    let env = readEnv();
    let key = map[choice];
    let current = env[key] ? env[key].toLowerCase() : "false";
    let newVal = current === "true" ? "false" : "true";
    env[key] = newVal;
    writeEnv(env);
    return reply(`✅ *${key}* is now *${newVal.toUpperCase()}* (saved to .env)`);
  }
});
