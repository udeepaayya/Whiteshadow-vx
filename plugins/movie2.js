/**
 * SinhalaSub Movie Search + 480p Downloader
 *  — Command:  .movie2 Titanic
 */
const { cmd } = require('../command');   // 👈 exec ↠ cmd
const axios = require('axios');

cmd(
  {
    pattern: 'movie2',        // ⬅️ නම clash නොවෙන්න movie2 / moviedl වගේ
    react:   '🎬',
    category:'download',
    filename: __filename,
    desc:    'Search SinhalaSub & download 480p movie'
  },

  async (conn, mek, m, { from, args, reply, react }) => {

    // movie name get
    const text = args.length ? args.join(' ') : '';
    if (!text) return reply('Please provide a movie name to search');

    await react('🔍');
    reply('🔍 Searching for SinhalaSub movies...');

    // --- search call ---
    let res = await axios.get(
      `https://sadiya-tech-apis.vercel.app/movie/sinhalasub-search`,
      { params: { text, apikey: 'sadiya' } }
    ).then(r => r.data).catch(() => ({}));

    if (!res.status || !res.result?.length)
      return reply('❌ No movies found for your search query');

    global.movieResults = res.result.slice(0, 5);   // keep top-5 only

    // build list
    let list = '🎬 *SinhalaSub Movie Results*\n\n' +
      global.movieResults.map((v, i) => `*${i+1}.* ${v.title}`).join('\n') +
      '\n\n*Reply with the number to download the movie*';

    // send list & set up collector
    const listMsg = await conn.sendMessage(from, { text: list }, { quoted: mek });
    const hookId  = listMsg.key.id;

    conn.nonSender(hookId, async (msg, txt, sender) => {

      const pick = parseInt(txt);
      if (isNaN(pick) || pick < 1 || pick > global.movieResults.length)
        return conn.sendMessage(sender, { text: '❌ Invalid option!' }, { quoted: msg });

      const chosen = global.movieResults[pick - 1];
      if (!chosen?.link)
        return conn.sendMessage(sender, { text: '❌ Movie link not available' }, { quoted: msg });

      await conn.sendMessage(sender, { text: `📥 Getting links for: ${chosen.title}` }, { quoted: msg });

      // --- download call ---
      let dl = await axios.get(
        `https://sadiya-tech-apis.vercel.app/movie/sinhalasub-dl`,
        { params: { url: chosen.link, apikey: 'sadiya' } }
      ).then(r => r.data).catch(() => ({}));

      const info = dl.result || {};
      const link480 = info.pixeldrain_dl_link?.find(x => x.quality === 'SD 480p');

      if (!link480)
        return conn.sendMessage(sender, { text: '❌ 480p quality not available' }, { quoted: msg });

      // caption
      let cap =
        `🎬 *${info.title || chosen.title}*\n` +
        (info.date          ? `📅 *Date:* ${info.date}\n` : '') +
        (info.tmdbRate      ? `⭐ *TMDB Rate:* ${info.tmdbRate}/10\n` : '') +
        (info.subtitle_author ? `📝 *Subtitle by:* ${info.subtitle_author}\n` : '') +
        `\n📱 *Quality:* ${link480.quality}\n` +
        `📦 *Size:* ${link480.size}\n` +
        `⬇️ *Downloading...*`;

      // send poster + details
      if (info.image)
        await conn.sendMessage(sender, { image: { url: info.image }, caption: cap }, { quoted: msg });
      else
        await conn.sendMessage(sender, { text: cap }, { quoted: msg });

      // send file
      await conn.sendMessage(sender, {
        document: { url: link480.link },
        fileName: `${(info.title || chosen.title).replace(/[^\w\s.-]/g, '')} - 480p.mp4`,
        mimetype: 'video/mp4'
      }, { quoted: msg });

      delete global.movieResults;          // clean up memory
    });

  } // handler
);
