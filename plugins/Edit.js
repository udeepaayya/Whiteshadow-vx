const { cmd } = require('../command')
const axios = require("axios")
const FormData = require("form-data")

// Catbox uploader
async function uploadToCatbox(buffer) {
    const form = new FormData()
    form.append("reqtype", "fileupload")
    form.append("fileToUpload", buffer, "image.jpg")

    const res = await axios.post("https://catbox.moe/user/api.php", form, {
        headers: form.getHeaders(),
    })
    return res.data // catbox URL
}

cmd({
    pattern: "edit",
    alias: ["imageedit", "imgedit"],
    desc: "Edit image with custom prompt",
    category: "image",
    react: "🎨",
    use: ".edit <prompt> (reply to image)",
    filename: __filename
}, async (conn, mek, m, { q }) => {
    try {
        if (!q) return m.reply("⚠️ Please provide a prompt.\nExample: `.edit make it look like a cartoon`")

        let url
        if (m.quoted && m.quoted.mtype === 'imageMessage') {
            let buff = await m.quoted.download()
            url = await uploadToCatbox(buff)
        } else {
            return m.reply("❌ Reply to an image with your prompt to edit it.")
        }

        let api = `https://api.zenzxz.my.id/maker/imagedit?url=${encodeURIComponent(url)}&prompt=${encodeURIComponent(q)}`
        let res = await axios.get(api, { responseType: 'arraybuffer' })

        await conn.sendMessage(
            m.chat,
            { image: res.data, caption: `✨ Image edited with prompt: *${q}*` },
            { quoted: m }
        )
    } catch (e) {
        console.log(e)
        m.reply("❌ Error while editing image.")
    }
})
