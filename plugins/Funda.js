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
  desc: "Search & download Xvideos video",
  category: "fun",
  use: ".xvideo <search term>",
  filename: __filename
}, async (conn, mek, m, { text }) => {
  try {
    if (!text) return m.reply("🔍 *Please enter a search term!*\n\n_Example:_ .xvideo Indian girl");

    // 🕵️ Search request
    const search = await axios.get(`https://api.nekolabs.my.id/discovery/xvideos/search?q=${encodeURIComponent(text)}`);
    if (!search.data.success || !search.data.result?.length) return m.reply("⚠️ *No results found!* 😢");

    const video = search.data.result[0]; // get first result
    const { title, artist, duration, cover, url } = video;

    // 🧩 Download request
    const dl = await axios.get(`https://api.nekolabs.my.id/downloader/xvideos?url=${encodeURIComponent(url)}`);
    if (!dl.data.success) return m.reply("⚠️ *Error while fetching video!* 😢");

    const videoUrl = dl.data.result.videos.high || dl.data.result.videos.low;
    const thumb = dl.data.result.thumb;

    // 🎬 Send video reply (XNXX style)
    await conn.sendMessage(m.chat, {
      video: { url: videoUrl },
      caption: `⬤───〔 *🎞️ XVIDEOS RESULT* 〕───⬤

*🎬 Title:* ${title}
*👩‍🎤 Artist:* ${artist || "Unknown"}
*⏱ Duration:* ${duration}
*🔗 Source:* ${url}

> © WhiteShadow-MD 🔥`,
      thumbnail: thumb
    }, { quoted: mek });

  } catch (e) {
    console.error(e);
    return m.reply("⚠️ *Something went wrong while fetching Xvideos video!* 😢");
  }
});
