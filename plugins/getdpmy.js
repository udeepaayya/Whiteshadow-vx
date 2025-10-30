const { cmd } = require('../command');
const { getBuffer } = require('../lib/functions');

cmd({
    pattern: "getdp",
    react: "🖼️",
    alias: ["getprofilepic", "fetchdp"],
    desc: "Get someone's WhatsApp profile picture and info using phone number",
    category: "utility",
    use: '.getdp 94712345678',
    filename: __filename
},
async (conn, mek, m, { from, reply, args }) => {
    try {
        // 1. CHECK NUMBER
        if (!args[0]) return reply("❌ Please provide a phone number.\nExample: *.getdp 94712345678*");

        // 2. FORMAT NUMBER
        let number = args[0].replace(/[^0-9]/g, ""); // remove special chars
        if (!number.startsWith("94")) number = "94" + number; // auto add country code if missing
        const userJid = number + "@s.whatsapp.net";

        // 3. VERIFY USER EXISTS
        const [user] = await conn.onWhatsApp(userJid).catch(() => []);
        if (!user?.exists) return reply("❌ That number is not registered on WhatsApp.");

        // 4. TRY TO GET PROFILE PICTURE
        let ppUrl;
        try {
            ppUrl = await conn.profilePictureUrl(userJid, 'image');
        } catch {
            ppUrl = 'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png'; // default
        }

        // 5. TRY TO GET STATUS (About)
        let bio = "No bio available";
        try {
            const status = await conn.fetchStatus(userJid);
            if (status?.status) bio = status.status;
        } catch (e) {}

        // 6. FORMAT OUTPUT
        const caption = `
*👤 USER PROFILE INFO*
📛 *Number:* ${number}
📝 *About:* ${bio}
`.trim();

        // 7. SEND RESULT
        await conn.sendMessage(from, {
            image: { url: ppUrl },
            caption
        }, { quoted: mek });

    } catch (e) {
        console.error("getdp command error:", e);
        reply(`❌ Error: ${e.message || "Failed to get profile picture"}`);
    }
});
