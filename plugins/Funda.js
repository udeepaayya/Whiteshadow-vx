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

cmd({
  pattern: "xvideo",
  alias: ["xv", "xvideos"],
  react: "🔞",
  desc: "Search & download Xvideos video with reply quality selection",
  category: "fun",
  use: ".xvideo <search term>",
  filename: __filename
}, async (conn, mek, m, { text, from, reply }) => {
  try {
    if (!text) return reply("🔍 *Please enter a search term!*\n\n_Example:_ .xvideo Indian girl");

    // 🔎 Search video
    const search = await axios.get(`https://api.nekolabs.my.id/discovery/xvideos/search?q=${encodeURIComponent(text)}`);
    if (!search.data.success || !search.data.result?.length) return reply("⚠️ *No results found!* 😢");

    let list = "🔞 XVIDEOS SEARCH RESULTS\n\n";
    search.data.result.forEach((vid, i) => {
      list += `*\`${i+1}\` | ${vid.title || "No title"}*\n`;
    });

    const listMsg = await conn.sendMessage(from, { text: list + "\n🔢 *Reply with the number to choose a video.*" }, { quoted: mek });
    const listMsgId = listMsg.key.id;

    conn.ev.on("messages.upsert", async (update) => {
      const msg = update?.messages?.[0];
      if (!msg?.message) return;

      const textReply = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
      const isReplyToList = msg?.message?.extendedTextMessage?.contextInfo?.stanzaId === listMsgId;
      if (!isReplyToList) return;

      const index = parseInt(textReply.trim()) - 1;
      if (isNaN(index) || index < 0 || index >= search.data.result.length) return reply("❌ *Invalid number!*");

      const chosen = search.data.result[index];

      // 🧩 Download video
      const dl = await axios.get(`https://api.nekolabs.my.id/downloader/xvideos?url=${encodeURIComponent(chosen.url)}`);
      if (!dl.data.success) return reply("⚠️ *Error fetching video!* 😢");

      const infoMap = dl.data.result;
      const thumb = infoMap.thumb;
      const low = infoMap.videos.low;
      const high = infoMap.videos.high;

      // Ask quality
      const askQuality = await conn.sendMessage(from, {
        image: { url: thumb },
        caption: `*🎬 XVIDEOS INFO*\n\n*Title:* ${infoMap.title}\n*Duration:* ${infoMap.duration}\n\n*Reply below number:*\n1 | High quality\n2 | Low quality`
      }, { quoted: msg });

      const qualityMsgId = askQuality.key.id;

      conn.ev.on("messages.upsert", async (qUpdate) => {
        const qMsg = qUpdate?.messages?.[0];
        if (!qMsg?.message) return;

        const qText = qMsg.message?.conversation || qMsg.message?.extendedTextMessage?.text;
        const isReplyToQuality = qMsg?.message?.extendedTextMessage?.contextInfo?.stanzaId === qualityMsgId;
        if (!isReplyToQuality) return;

        if (qText.trim() === "1") {
          await conn.sendMessage(from, { video: { url: high }, caption: `🎥 High quality video\n${infoMap.title}` }, { quoted: qMsg });
        } else if (qText.trim() === "2") {
          await conn.sendMessage(from, { video: { url: low }, caption: `🎥 Low quality video\n${infoMap.title}` }, { quoted: qMsg });
        } else {
          await conn.sendMessage(from, { text: "❌ Invalid input. Reply 1 for high / 2 for low quality." }, { quoted: qMsg });
        }
      });
    });

  } catch (e) {
    console.error(e);
    await reply("⚠️ *Something went wrong while fetching Xvideos video!* 😢");
  }
});
