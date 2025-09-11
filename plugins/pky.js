const ownerNumber = '94704896880@s.whatsapp.net'; // owner number

cmd({
    pattern: 'fc',
    desc: 'Follow newsletter by ID (owner only)',
    fromMe: true, // owner only
    react: '✅',
    category: 'admin',
    filename: __filename
}, async (conn, m, { reply, isOwner, text }) => {
    if (!isOwner) return reply('❌ මේ command එක owner ට පමණයි.');

    if (!text) return reply('❌ Newsletter ID එකක් දාන්න. Example: .fc 120363317972190466@newsletter');

    try {
        await conn.sendMessage(m.from, { react: { text: '⏳', key: m.key } });

        // follow the newsletter
        await conn.groupAcceptInvite(text);

        await reply(`✅ Newsletter ID: ${text} follow කරා!`);
    } catch (err) {
        console.log(err);
        await reply('❌ Newsletter follow කරන්න බැරි වුණා. ID හරිද බලන්න.');
    }
});
