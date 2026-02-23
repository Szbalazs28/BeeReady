const crypto = require('crypto');

function share_code_generator() {
    return crypto.randomBytes(6).toString("base64url");
}

function isexistscheck(rows, name, mode){
    if(mode){
        if(rows.length > 0){
            const err = new Error(`"${name}" már létezik!`)
            err.status = 409;
            throw err;
        }
    }
    else{
        if(rows.length == 0){
            const err = new Error(`"${name}" nem található!`)
            err.status = 409;
            throw err;
        }
    }
}

module.exports = { share_code_generator, isexistscheck };