const { cmd } = require('../command');

cmd({
    pattern: "add",
    alias: ["a", "invite"],
    desc: "Add a member to the group",
    category: "admin",
    react: "➕",
    filename: __filename
},
async (conn, mek, m, {
    from, q, isGroup, isBotAdmins, isAdmins, reply
}) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        if (!isAdmins) return reply("⚠️ Only group admins can use this command!");
        if (!isBotAdmins) return reply("⚠️ I need to be an admin to add members!");

        let number;
        if (m.quoted) {
            number = m.quoted.sender.split("@")[0];
        } else if (q) {
            // Remove spaces, plus, @ etc → keep only numbers
            number = q.replace(/[^0-9]/g, "");
        } else {
            return reply("⚠️ Please reply to a user, mention a number, or type a number to add.\n\n📌 Example:\n.add +94705059895\n.add 94705059895");
        }

        if (!number) return reply("⚠️ Invalid number format!");

        // If number starts with 0 → convert to 94 (Sri Lanka)
        if (number.startsWith("0")) {
            number = "94" + number.slice(1);
        }

        const jid = number + "@s.whatsapp.net";

        if (jid === conn.user.id) return reply("⚠️ I cannot add myself!");

        await conn.groupParticipantsUpdate(from, [jid], "add");

        return conn.sendMessage(from, {
            text: `✅ Successfully added @${number}`,
            mentions: [jid]
        }, { quoted: mek });

    } catch (error) {
        console.error("Add command error:", error);
        reply("❌ Failed to add the member. They might have left recently, blocked group invites, or the number is invalid.");
    }
});
