const axios = require("axios");
const FormData = require('form-data');
const fs = require('fs');
const os = require('os');
const path = require("path");
const { cmd, commands } = require("../command");

cmd({
  'pattern': "tourl2",
  'alias': ["url2", "upl2", "link2"],
  'react': '🌐',
  'desc': "Convert media to Yupra CDN URL",
  'category': "utility",
  'use': ".tourl2 [reply to media]",
  'filename': __filename
}, async (client, message, args, { reply }) => {
  try {
    const quotedMsg = message.quoted ? message.quoted : message;
    const mimeType = (quotedMsg.msg || quotedMsg).mimetype || '';
    
    if (!mimeType) {
      throw "❌ Please reply to an image, video, audio or file";
    }

    // Download media
    const mediaBuffer = await quotedMsg.download();
    const tempFilePath = path.join(os.tmpdir(), `yupra_upload_${Date.now()}`);
    fs.writeFileSync(tempFilePath, mediaBuffer);

    // Get file extension
    let extension = '';
    if (mimeType.includes('image/jpeg')) extension = '.jpg';
    else if (mimeType.includes('image/png')) extension = '.png';
    else if (mimeType.includes('video')) extension = '.mp4';
    else if (mimeType.includes('audio')) extension = '.mp3';
    else extension = '.bin';

    const fileName = `file${extension}`;

    // Prepare form data
    const form = new FormData();
    form.append('files', fs.createReadStream(tempFilePath), fileName);

    // Upload to Yupra CDN
    const response = await axios.post("https://cdn.yupra.my.id/upload", form, {
      headers: {
        ...form.getHeaders(),
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36'
      },
      timeout: 120000
    });

    fs.unlinkSync(tempFilePath);

    if (!response.data || !response.data.success) {
      throw "❌ Error uploading to Yupra CDN";
    }

    const file = response.data.files[0];
    const mediaUrl = `https://cdn.yupra.my.id${file.url}`;

    // Detect type
    let mediaType = 'File';
    if (mimeType.includes('image')) mediaType = 'Image';
    else if (mimeType.includes('video')) mediaType = 'Video';
    else if (mimeType.includes('audio')) mediaType = 'Audio';

    // Send success message
    await reply(
      `✅ *${mediaType} Uploaded Successfully*\n\n` +
      `*Size:* ${formatBytes(mediaBuffer.length)}\n` +
      `*URL:* ${mediaUrl}\n\n` +
      `> © Uploaded by WHITESHADOW-MD🧑‍💻`
    );

  } catch (error) {
    console.error(error);
    await reply(`❌ Error: ${error.message || error}`);
  }
});

// Helper function
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
