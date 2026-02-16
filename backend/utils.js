const crypto = require('crypto');

function share_code_generator() {
    return crypto.randomBytes(6).toString("base64url");
}

module.exports = { share_code_generator };