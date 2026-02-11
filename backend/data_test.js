const bcrypt = require('bcrypt')
const crypto = require('crypto');
const {userexists, userbyemail, userbyid} = require("../sql/querys.js");

function passwordTest(password) {
    let issue = false
    let err = new Error("A jelszónak meg kell felelnie a követleményeknek: ")
    if (password.length < 6) {
        err.message += "\n Legalább 6 karakternek kell lennie!"
        issue = true
    }
    if (!includeuppercasech(password)) {
        err.message += "\n Kell tartalmaznia nagybetűt!"
        issue = true
    }
    if (!includespecialch(password)) {
        err.message += "\n Kell tartalmaznia legalább egy speciális karaktert!"
        issue = true
    }
    if (!includenumber(password)) {
        err.message += "\n Kell tartalmaznia legalább egy számot!"
        issue = true
    }
    if (issue) {
        err.status = 400;
        throw err;
    }
}


function includeuppercasech(password) {
    // Regex: /(.*[A-Z].*)/
    // Jelentése: Bármilyen karakter (.*), amelyet követ legalább egy nagybetű ([A-Z]), 
    // amelyet ismét bármilyen karakter (.*) követ.
    return /[A-Z]/.test(password);
}

function includespecialch(password) {
    // Regex: /[!@#$%^&*(),.?":{}|<>]|/
    // A Regex a leggyakoribb speciális karaktereket keresi.
    // Figyelem: Mely karaktereket tartod speciálisnak, az függ a biztonsági követelményeidtől.
    return /[!@#$%^&*(),.?":{}|<>_-]/.test(password);
}

function includenumber(password) {
    // Regex: /\d/
    // A \d (digit) a 0-9 tartományban lévő bármely számjegyet jelöli.
    return /\d/.test(password);
}

async function encrypt(password) {
    try {
        const saltRounds = 12
        const hash = await bcrypt.hash(password, saltRounds)
        return hash
    }
    catch (err) {
        console.error("Hiba a jelszó titkosításakor: ", err);
    }

}

function share_code_generator() {
    return crypto.randomBytes(6).toString("base64url");
}



function emailTest(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        const err = new Error("Hibás E-mail cím formátum!")
        err.status = 400;
        throw err;
    }
}

async function checkuserexists(email, username) {
    const [rows] = await userexists(email, username);
    if (rows.length == 0) {
        const err = new Error("Ilyen E-mail cím vagy Felhasználónév már létezik!")
        err.status = 409;
        throw err;
    }
}

async function getuserbyemail(email){
    const [rows] = await userbyemail(email);
    if(rows.length==0){
        const err = new Error("Nem található E-mail cím!")
        err.status = 409;
        throw err;
    }
    return rows
    
}

async function getuserbyid(id){
    const [rows] = await userbyid(id);
    if(rows.length==0){
        const err = new Error("Nem található a felhasználó!")
        err.status = 409;
        throw err;
    }
    return rows
    
}

async function compare(password, hash) {
    if (!await bcrypt.compare(password, hash)) {
        const err = new Error("Hibás jelszó!")
        err.status = 403;
        throw err;
    }

}

function lengthtest(input, min, max) {
    if (input.length < min || input.length > max) {
        const err = new Error(`A hossznak ${min} és ${max} karakter között kell lennie!`);
        err.status = 400;
        throw err;
    }
}

module.exports = {getuserbyid, getuserbyemail, passwordTest, encrypt, compare, emailTest, lengthtest, share_code_generator, checkuserexists };