const { cmd } = require('../command');
const fetch = require('node-fetch');

cmd({
  pattern: "url3",
  alias: ["ibb", "imgbb"],
  react: "🌐",
  desc: "Upload image to imgbb and send fake verified vCard style",
  category: "tools",
  use: ".url3 <reply image / image url>",
  filename: __filename
}, async (conn, m, mek, { from, q, reply, isQuotedImage }) => {
  try {
    let imageUrl;

    if (isQuotedImage) {
      // downloadAndSaveMediaMessage expected to be available in your conn
      let mediaPath = await conn.downloadAndSaveMediaMessage(mek.quoted);
      imageUrl = mediaPath;
    } else if (/^https?:\/\//.test(q)) {
      imageUrl = q;
    } else {
      return reply("⚠️ Please reply to an image or give me a valid image url.");
    }

    const apiUrl = `https://delirius-apiofc.vercel.app/tools/ibb?image=${encodeURIComponent(imageUrl)}&filename=WhiteShadow`;
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (!data.status || !data.data) return reply("❌ Upload failed or invalid response!");

    // build caption
    let txt = `⬤───〔 *🌐 IBB UPLOADER* 〕───⬤\n\n`;
    txt += `🆔 ID: ${data.data.id}\n`;
    txt += `📛 Name: ${data.data.name}\n`;
    txt += `📁 Filename: ${data.data.filename}\n`;
    txt += `📄 Extension: ${data.data.extension}\n`;
    txt += `📏 Size: ${data.data.size}\n`;
    txt += `📐 Resolution: ${data.data.width}x${data.data.height}\n`;
    txt += `📅 Published: ${data.data.published}\n`;
    txt += `🔗 URL: ${data.data.url}\n`;
    txt += `🖼️ Direct: ${data.data.image}\n\n`;
    txt += `© WhiteShadow-MD`;

    // ------------- FAKE VERIFIED vCard STYLE -------------
    // Customize these fields as you like
    const groupName = `${data.data.name} • WhiteShadow`;
    const verifiedBadge = "✅"; // use any emoji to mimic verification
    const displayName = `${groupName} ${verifiedBadge}`;
    const fakeWhatsAppId = "94704896880"; // use your bot owner or any number you want to show
    const fakeInviteLink = `${data.data.url}`; // use uploaded url as "link"

    // vCard string - shown as a contact (Baileys style)
    const vcard =
`BEGIN:VCARD
VERSION:3.0
FN:${displayName}
ORG:WhiteShadow-MD;
TITLE:Verified Group
NOTE:Official group • Verified by WhiteShadow
TEL;type=CELL;waid=${fakeWhatsAppId}:${fakeWhatsAppId}
URL:${fakeInviteLink}
END:VCARD`;

    // send the fake vCard contact first (so it looks like a verified contact/group)
    try {
      await conn.sendMessage(from, {
        contacts: {
          displayName: displayName,
          contacts: [{ vcard }]
        }
      }, { quoted: mek });
    } catch (err) {
      // if contacts sending fails in this environment, ignore and continue to send image
      console.log('Failed to send vCard (non-fatal):', err?.message || err);
    }

    // send image with caption (the upload preview)
    await conn.sendMessage(from, { image: { url: data.data.image }, caption: txt }, { quoted: mek });

    // Optionally: send a small "verified group" text message to make it feel more official
    const verifiedText = `*${displayName}*\n🔒 This group is *verified*\n🔗 Link: ${fakeInviteLink}`;
    await conn.sendMessage(from, { text: verifiedText }, { quoted: mek });

  } catch (e) {
    console.log(e);
    reply("❌ Error occurred while uploading!");
  }
});
