import { cmd } from '../command.js';
import axios from 'axios';

let chatbotEnabled = true; // default ON

cmd({
    pattern: 'chat',
    desc: 'Chat with WHITESHADOW AI',
    category: 'ai',
    react: '🤖',
    filename: __filename
}, async (m, { text, socket, sender, msg, isOwner }) => {
    try {
        const userMessage = text || m.message?.conversation || '';
        if (!userMessage) return await socket.sendMessage(sender, { text: "පණිවිඩයක් type කරන්න 😅" }, { quoted: msg });

        // Admin toggle command
        if (isOwner && userMessage.toLowerCase().startsWith('chatbot ')) {
            const arg = userMessage.split(' ')[1]?.toLowerCase();
            if (!['on','off'].includes(arg)) {
                return await socket.sendMessage(sender, { text: 'Usage: chatbot on/off' }, { quoted: msg });
            }
            chatbotEnabled = arg === 'on';
            return await socket.sendMessage(sender, { text: `✅ Chatbot is now ${arg.toUpperCase()}` }, { quoted: msg });
        }

        // Check if chatbot is enabled
        if (!chatbotEnabled) {
            return await socket.sendMessage(sender, { text: '❌ Chatbot is currently OFF' }, { quoted: msg });
        }

        // Send message to WHITESHADOW AI endpoint
        const response = await axios.post('https://aiapi-a5a03b488008.herokuapp.com/ai', {
            message: userMessage
        });

        const aiReply = response.data?.reply || '❌ පිළිතුරක් ලැබුණේ නැහැ.';
        await socket.sendMessage(sender, { text: aiReply }, { quoted: msg });

    } catch (err) {
        console.error('Chatbot Plugin Error:', err.message);
        await socket.sendMessage(sender, { text: '❌ අයියෝ error එකක් වුණා 😢' }, { quoted: msg });
    }
});
