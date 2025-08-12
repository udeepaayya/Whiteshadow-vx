const axios = require("axios");
const FormData = require('form-data');
const fs = require('fs');
const os = require('os');
const path = require("path");
const { cmd, commands } = require("../command");

cmd({
  pattern: "upmf",
  alias: ["upmediafire", "mfupload"],
  react: '📤',
  desc: "Upload media to MediaFire",
  category: "utility",
  use: ".upmf [reply to media]",
  filename: __filename
}, async (client, message, args, { reply }) => {
  try {
    const quotedMsg = message.quoted ? message.quoted : message;
    const mimeType = (quotedMsg.msg || quotedMsg).mimetype || '';

    if (!mimeType) {
      throw "⚠️ Please reply to an image, video, audio, or document.";
    }

    const mediaBuffer = await quotedMsg.download();
    const tempFilePath = path.join(os.tmpdir(), `mediafire_upload_${Date.now()}`);
    fs.writeFileSync(tempFilePath, mediaBuffer);

    // Get extension
    let extension = '';
    if (mimeType.includes('image/jpeg')) extension = '.jpg';
    else if (mimeType.includes('image/png')) extension = '.png';
    else if (mimeType.includes('video')) extension = '.mp4';
    else if (mimeType.includes('audio')) extension = '.mp3';
    else if (mimeType.includes('application/pdf')) extension = '.pdf';
    else extension = '.bin'; // fallback

    const fileName = `file${extension}`;

    const form = new FormData();
    form.append('file', fs.createReadStream(tempFilePath), fileName);

    // Upload to MediaFire via FGSI API
    const response = await axios.post("https://fgsi.koyeb.app/api/upload/uploadMediaFire", form, {
      headers: {
        ...form.getHeaders(),
        'apikey': 'fgsiapi-213d7253-6d'
      }
    });

    const res = response.data?.data;
    fs.unlinkSync(tempFilePath);

    if (!res || !res.links?.normal_download) {
      throw "❌ Upload failed. Try again later.";
    }

    // Determine media type
    let mediaType = 'File';
    if (mimeType.includes('image')) mediaType = 'Image';
    else if (mimeType.includes('video')) mediaType = 'Video';
    else if (mimeType.includes('audio')) mediaType = 'Audio';

    // Fake vCard object
    const fakeVCard = {
      key: {
        fromMe: false,
        participant: '0@s.whatsapp.net',
        remoteJid: "status@broadcast"
      },
      message: {
        contactMessage: {
          displayName: "WHITESHADOW ✅",
          vcard: "BEGIN:VCARD\nVERSION:3.0\nFN: WHITESHADOW ✅\nORG: WHITESHADOW-MD;\nTEL;type=CELL;type=VOICE;waid=94704896880:+94704896880\nEND:VCARD",
          jpegThumbnail: Buffer.from([])
        }
      }
    };

    // Send message with channel-style forwarding
    await client.sendMessage(message.chat, {
      text:
        `*${mediaType} Uploaded to MediaFire*\n\n` +
        `*Name:* ${res.filename}\n` +
        `*Size:* ${res.size}\n` +
        `*URL:* ${res.links.normal_download}\n\n` +
        `> © WHITESHADOW-MD`,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363317972190466@newsletter',
          newsletterName: '👾ᏔᎻᎥᏆᎬՏᎻᎪᎠᎾᏇ ᎷᎠ👾',
          serverMessageId: 143
        },
        externalAdReply: {
          title: "WHITESHADOW ✅",
          body: "Uploaded to MediaFire",
          thumbnailUrl: res.links.normal_download, // Optional: replace with image link
          sourceUrl: res.links.normal_download,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: fakeVCard });

  } catch (error) {
    console.error(error);
    await reply(`Error: ${error.message || error}`);
  }
});
