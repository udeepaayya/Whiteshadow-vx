const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

async function uploadToTelegraph(path) {
    const form = new FormData();
    form.append("file", fs.createReadStream(path));

    const { data } = await axios.post("https://telegra.ph/upload", form, {
        headers: form.getHeaders()
    });

    if (data.error) throw new Error(data.error);
    return "https://telegra.ph" + data[0].src;
}

module.exports = { uploadToTelegraph };
