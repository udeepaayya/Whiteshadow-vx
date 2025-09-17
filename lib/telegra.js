// lib/telegra.js

const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

/**
 * Upload file to Telegraph
 * @param {string} path - Local file path
 * @returns {Promise<string>} Telegraph URL
 */
async function uploadToTelegraph(path) {
    try {
        // Create form data and append file
        const form = new FormData();
        form.append("file", fs.createReadStream(path));

        // Send upload request
        const { data } = await axios.post("https://telegra.ph/upload", form, {
            headers: form.getHeaders()
        });

        // Handle response
        if (data.error) {
            throw new Error(data.error);
        }

        // Return telegraph URL
        return "https://telegra.ph" + data[0].src;
    } catch (err) {
        console.error("Telegraph upload failed:", err.message);
        throw err;
    }
}

module.exports = { uploadToTelegraph };
