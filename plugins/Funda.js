/**
                                    ⣀⡠⢤⡀          
                                 ⢀⡴⠟⠃  ⠙⣄         
                                ⣠⠋      ⠘⣆        
                              ⢠⠾⢛⠒       ⢸⡆       
                              ⣿⣶⣄⡈⠓⢄⠠⡀   ⣄⣷       
                             ⢀⣿⣷ ⠈⠱⡄⠑⣌⠆  ⡜⢻       
                             ⢸⣿⡿⠳⡆⠐⢿⣆⠈⢿  ⡇⠘⡆      
                              ⢿⣿⣷⡇  ⠈⢆⠈⠆⢸  ⢣      
                              ⠘⣿⣿⣿⣧  ⠈⢂ ⡇  ⢨⠓⣄    
                               ⣸⣿⣿⣿⣦⣤⠖⡏⡸ ⣀⡴⠋ ⠈⠢⡀  
                             ⢠⣾⠁⣹⣿⣿⣿⣷⣾⠽⠖⠊⢹⣀⠄   ⠈⢣⡀
                             ⡟⣇⣰⢫⢻⢉⠉ ⣿⡆  ⡸⡏      ⢇
                            ⢨⡇⡇⠈⢸⢸⢸  ⡇⡇  ⠁⠻⡄⡠⠂   ⠘
⢤⣄                         ⢠⠛⠓⡇ ⠸⡆⢸ ⢠⣿    ⣰⣿⣵⡆    
⠈⢻⣷⣦⣀                     ⣠⡿⣦⣀⡇ ⢧⡇  ⢺⡟   ⢰⠉⣰⠟⠊⣠⠂ ⡸
  ⢻⣿⣿⣷⣦⣀                 ⣠⢧⡙⠺⠿⡇ ⠘⠇  ⢸⣧  ⢠⠃⣾⣌⠉⠩⠭⠍⣉⡇
   ⠻⣿⣿⣿⣿⣿⣦⣀            ⣠⣞⣋ ⠈ ⡳⣧     ⢸⡏  ⡞⢰⠉⠉⠉⠉⠉⠓⢻⠃
    ⠹⣿⣿⣿⣿⣿⣿⣷⡄  ⢀⣀⠠⠤⣤⣤⠤⠞⠓⢠⠈⡆ ⢣⣸⣾⠆     ⢀⣀⡼⠁⡿⠈⣉⣉⣒⡒⠢⡼ 
     ⠘⣿⣿⣿⣿⣿⣿⣿⣎⣽⣶⣤⡶⢋⣤⠃⣠⡦⢀⡼⢦⣾⡤⠚⣟⣁⣀⣀⣀⣀ ⣀⣈⣀⣠⣾⣅ ⠑⠂⠤⠌⣩⡇ 
      ⠘⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡁⣺⢁⣞⣉⡴⠟⡀   ⠁⠸⡅ ⠈⢷⠈⠏⠙ ⢹⡛ ⢉   ⣀⣀⣼⡇ 
        ⠈⠻⣿⣿⣿⣿⣿⣿⣿⣿⣽⣿⡟⢡⠖⣡⡴⠂⣀⣀⣀⣰⣁⣀⣀⣸    ⠈⠁  ⠈ ⣠⠜⠋⣠⠁ 
           ⠙⢿⣿⣿⣿⡟⢿⣿⣿⣷⡟⢋⣥⣖⣉ ⠈⢁⡀⠤⠚⠿⣷⡦⢀⣠⣀⠢⣄⣀⡠⠔⠋⠁ ⣼⠃  
             ⠈⠻⣿⣿⡄⠈⠻⣿⣿⢿⣛⣩⠤⠒⠉⠁     ⠉⠒⢤⡀⠉⠁     ⢀⡿   
               ⠈⠙⢿⣤⣤⠴⠟⠋⠉             ⠈⠑⠤     ⢩⠇   
                  ⠈                               


**/
const { cmd } = require('../command');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const pending = new Map(); // track pending quality selection

cmd({
  pattern: "xvideo",
  alias: ["xv", "xvideos"],
  react: "🔞",
  desc: "Search Xvideos & download (reply quality select)",
  category: "fun",
  use: ".xvideo <search term>",
  filename: __filename
}, async (conn, mek, m, { text }) => {
  try {
    if (!text) return m.reply("🔍 Please enter a search term!");

    // 1️⃣ Search API
    const search = await axios.get(`https://api.nekolabs.my.id/discovery/xvideos/search?q=${encodeURIComponent(text)}`);
    if (!search.data.success || !search.data.result?.length) return m.reply("⚠️ No results found!");

    const video = search.data.result[0];
    const { title, artist, duration, cover, url } = video;

    // 2️⃣ Download API
    const dl = await axios.get(`https://api.nekolabs.my.id/downloader/xvideos?url=${encodeURIComponent(url)}`);
    if (!dl.data.success) return m.reply("⚠️ Error fetching video!");

    const vids = dl.data.result.videos;
    const keys = Object.keys(vids); // ["low","high","HLS"]

    // 3️⃣ Send thumbnail + quality options
    let menu = `🎬 *${title}*\n⏱ Duration: ${duration}\n\nReply with number to choose quality:\n`;
    keys.forEach((k, i) => {
      let label = k === 'low' ? '360p (Low)' : k === 'high' ? '720p/1080p (High)' : 'HLS (Stream)';
      menu += `${i + 1}️⃣ ${label}\n`;
    });

    const msg = await conn.sendMessage(m.chat, { image: { url: cover }, caption: menu }, { quoted: mek });

    // 4️⃣ Store pending
    pending.set(m.chat, {
      vids,
      keys,
      msgId: msg.key.id,
      title
    });

    // Auto-clear pending after 1 minute
    setTimeout(() => pending.delete(m.chat), 60000);

  } catch (e) {
    console.log(e);
    m.reply("⚠️ Something went wrong! 😢");
  }
});

// ===============================
// Reply listener to send video
// ===============================
conn.ev.on("messages.upsert", async (update) => {
  try {
    const msg = update?.messages?.[0];
    if (!msg?.message) return;

    const chatId = msg.key.remoteJid;
    const text = msg.message.conversation?.trim();
    if (!text || !pending.has(chatId)) return;

    const data = pending.get(chatId);
    pending.delete(chatId);

    // Check reply is to correct message (optional)
    // const isReply = msg.message.extendedTextMessage?.contextInfo?.stanzaId === data.msgId;
    // if (!isReply) return;  // we ignore strict stanzaId, allow any text reply

    const index = parseInt(text) - 1;
    if (isNaN(index) || index < 0 || index >= data.keys.length) {
      return conn.sendMessage(chatId, { text: "❌ Invalid number. Reply 1/2/3." }, { quoted: msg });
    }

    const key = data.keys[index];
    let url = data.vids[key];

    // HLS stream send as link
    if (key.toLowerCase() === 'hls' || url.endsWith('.m3u8')) {
      return conn.sendMessage(chatId, { text: `🔗 Stream link (${key}):\n${url}` }, { quoted: msg });
    }

    // Download video to temp
    const tmpFile = path.join(__dirname, `temp_${Date.now()}.mp4`);
    const writer = fs.createWriteStream(tmpFile);
    const response = await axios({ url, method: 'GET', responseType: 'stream' });
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    // Send video
    await conn.sendMessage(chatId, {
      video: { url: tmpFile },
      caption: `✅ Download ready (${key})\n*${data.title}*`
    }, { quoted: msg });

    // Delete temp
    fs.unlinkSync(tmpFile);

  } catch (e) {
    console.log("Reply handler error", e);
  }
});
