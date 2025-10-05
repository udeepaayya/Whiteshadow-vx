/**
 * Plugin: AI3 (WHITESHADOW AI Tester)
 * Author: Chamod Nimsara
 * Bot: WHITESHADOW-MD
 */

import axios from "axios";
import { cmd } from "../command.js";

cmd({
  pattern: "ai3",
  alias: ["ai-test", "chat3"],
  desc: "Test WHITESHADOW AI response",
  category: "ai",
  react: "🤖",
  use: ".ai3 <message>",
  filename: __filename
}, async (m, { text, reply }) => {
  try {
    if (!text) return reply("💬 *Please type a message to ask WHITESHADOW AI.*\n\nExample: .ai3 Hello!");

    // Call your deployed API (Gemini 2.0 flash)
    const api = `https://whiteshadow-thz2.onrender.com/ai/gpt-5-mini?query=${encodeURIComponent(text)}`;

    const { data } = await axios.get(api);

    if (data.status && data.answer) {
      await reply(`💭 *WHITESHADOW AI says:*\n\n${data.answer}`);
    } else {
      await reply(`⚠️ *No valid response from AI.*`);
    }

  } catch (e) {
    console.error("AI3 Error:", e.message);
    await reply("❌ *Error connecting to WHITESHADOW AI server.*");
  }
});
