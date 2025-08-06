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

    // Send reply
    await reply(
      `*${mediaType} Uploaded to MediaFire*\n\n` +
      `*Name:* ${res.filename}\n` +
      `*Size:* ${res.size}\n` +
      `*URL:* ${res.links.normal_download}\n\n` +
      `> © WHITESHADOW-MD`
    );

  } catch (error) {
    console.error(error);
    await reply(`Error: ${error.message || error}`);
  }
});
