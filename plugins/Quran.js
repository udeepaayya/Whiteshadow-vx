const fetch = require('node-fetch');
const { cmd, commands } = require('../command');
const { fetchJson } = require('../lib/functions');
const { translate } = require('@vitalets/google-translate-api');

cmd({
  pattern: "quran",
  alias: ["surah"],
  react: "🤍",
  desc: "Get Quran Surah details and explanation.",
  category: "main",
  filename: __filename
}, async (conn, mek, m, { from, sender, reply, args }) => {
  try {
    let surahInput = args[0];

    if (!surahInput) {
      return reply('Type Surah Number or Type *.quranmenu* to view Surah list.');
    }

    let surahListRes = await fetchJson('https://quran-endpoint.vercel.app/quran');
    let surahList = surahListRes.data;

    let surahData = surahList.find(surah =>
      surah.number === Number(surahInput) ||
      surah.asma.en.short.toLowerCase() === surahInput.toLowerCase()
    );

    if (!surahData) {
      return reply(`Couldn't find Surah "${surahInput}". Please check the number or name.`);
    }

    let res = await fetch(`https://quran-endpoint.vercel.app/quran/${surahData.number}`);
    if (!res.ok) {
      let error = await res.json();
      return reply(`API request failed (${res.status}): ${error.message}`);
    }

    let json = await res.json();

    let translatedTafsirEnglish = await translate(json.data.tafsir.id, { to: 'en', autoCorrect: true });

    let quranSurah = `
🕋 *Quran Kareem*
📖 Surah ${json.data.number}: ${json.data.asma.en.long}
💫 Type: ${json.data.type.en}
✅ Verses: ${json.data.ayahCount}

🔮 *Explanation:*
${translatedTafsirEnglish.text}
`;

    await conn.sendMessage(from, {
      image: { url: `https://files.catbox.moe/fyr37r.jpg` },
      caption: quranSurah,
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363317972190466@newsletter',
          newsletterName: 'WHITESHADOW-MD',
          serverMessageId: 143
        }
      }
    }, { quoted: mek });

    await conn.sendMessage(from, {
      audio: { url: 'https://files.catbox.moe/mpt43m.mp3' },
      mimetype: 'audio/mp4',
      ptt: false
    }, { quoted: mek });

  } catch (error) {
    console.error(error);
    reply(`Error: ${error.message}`);
  }
});

cmd({
  pattern: "quranmenu",
  alias: ["surahmenu", "surahlist"],
  desc: "View Surah list",
  category: "menu",
  react: "❤️",
  filename: __filename
}, async (conn, mek, m, { from, sender, reply }) => {
  try {
    let surahMenu = `
❤️  ⊷┈ *QURAN KAREEM SURAH LIST* ┈⊷ 🤍
💫 Use .quran <number> to get Surah details

1️⃣ Al-Fatiha (The Opening)
2️⃣ Al-Baqarah (The Cow)
3️⃣ Aali Imran (The Family of Imran)
4️⃣ An-Nisa (The Women)
5️⃣ Al-Ma'idah (The Table Spread)
6️⃣ Al-An'am (The Cattle)
7️⃣ Al-A'raf (The Heights)
8️⃣ Al-Anfal (The Spoils of War)
9️⃣ At-Tawbah (The Repentance)
10️⃣ Yunus (Jonah)
...

💡 *Note:* Use .quran <number>
`;

    await conn.sendMessage(from, {
      image: { url: `https://files.catbox.moe/fyr37r.jpg` },
      caption: surahMenu,
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363317972190466@newsletter',
          newsletterName: 'WHITESHADOW-MD',
          serverMessageId: 143
        }
      }
    }, { quoted: mek });

    await conn.sendMessage(from, {
      audio: { url: 'https://files.catbox.moe/mpt43m.mp3' },
      mimetype: 'audio/mp4',
      ptt: false
    }, { quoted: mek });

  } catch (e) {
    console.error(e);
    reply(`Error: ${e.message}`);
  }
});