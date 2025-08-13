const { cmd } = require('../command');
const fetch = require('node-fetch');

cmd({
    pattern: "spotifydl",
    alias: ["spotify", "spt"],
    react: "🎧",
    desc: "Download audio from Spotify track URL",
    category: "download",
    use: ".spotifydl <Spotify URL> [--ptt]",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply("❌ Please provide a Spotify track URL!");

        const isPTT = q.includes("--ptt") || q.includes("-ptt");
        const spotifyUrl = q.replace("--ptt", "").replace("-ptt", "").trim();

        await reply("⏳ Processing your track...");

        // ===== Spotify Downloader Logic =====
        const s = {
            baseUrl: 'https://spotisongdownloader.to',
            baseHeaders: {
                'accept-encoding': 'gzip, deflate, br',
                'user-agent': 'Mozilla/5.0'
            },
            async toolsHit(desc, url, options, returnType = 'json') {
                const res = await fetch(url, options);
                if (!res.ok) throw new Error(`${desc} failed`);
                return returnType === 'json' ? await res.json() : await res.text();
            },
            async getCookie() {
                const res = await fetch(this.baseUrl, { headers: this.baseHeaders });
                let cookie = res.headers.get('set-cookie')?.split(';')[0] || '';
                if (!cookie) throw 'Failed to get cookie';
                return { cookie };
            },
            async ifCaptcha(cookieObj) {
                return { ...this.baseHeaders, ...cookieObj };
            },
            async singleTrack(spotifyUrl, headers) {
                const url = `${this.baseUrl}/api/composer/spotify/xsingle_track.php?url=${spotifyUrl}`;
                const stObj = await this.toolsHit('single track', url, { headers });
                if(!stObj || !stObj.song_name) throw new Error("Single track data missing");
                return stObj;
            },
            async downloadUrl(spotifyUrl, headers) {
                const body = new URLSearchParams({
                    song_name: '', artist_name: '', url: spotifyUrl, zip_download: 'false', quality: 'm4a'
                });
                const url = `${this.baseUrl}/api/composer/spotify/ssdw23456ytrfds.php`;
                const dlObj = await this.toolsHit('get download url', url, { headers, method: 'POST', body });
                if(!dlObj?.dlink) throw new Error("Download link missing");
                return dlObj;
            },
            async download(spotifyUrl) {
                const cookieObj = await this.getCookie();
                const headers = await this.ifCaptcha(cookieObj);
                const stObj = await this.singleTrack(spotifyUrl, headers);
                const dlObj = await this.downloadUrl(spotifyUrl, headers);
                return { ...dlObj, ...stObj };
            }
        }
        // ====================================

        const dl = await s.download(spotifyUrl);
        console.log(dl); // debug

        await conn.sendMessage(from, {
            audio: { url: dl.dlink },
            mimetype: 'audio/mpeg',
            ptt: isPTT,
            fileName: `${dl.song_name}.mp3`,
            contextInfo: {
                forwardingScore: 9999,
                isForwarded: true,
                externalAdReply: {
                    title: `Spotify Downloader`,
                    body: `${dl.song_name} | ${dl.artist}\nPowered by WHITESHADOW MD`,
                    mediaType: 1,
                    previewType: 0,
                    renderLargerThumbnail: true,
                    thumbnailUrl: dl.img,
                    sourceUrl: spotifyUrl
                }
            }
        }, { quoted: mek });

        await reply(`✅ *${dl.song_name}* downloaded successfully!${isPTT ? " (PTT Voice)" : ""}`);

    } catch (error) {
        console.error(error);
        await reply(`❌ Error: ${error.message}`);
    }
});
