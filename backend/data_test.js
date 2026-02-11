const bcrypt = require('bcrypt')


function passwordTest(password) {
    let issues = {}
    issues["alap"] = "A jelszónak meg kell felelnie a következő követelményeknek:"
    if (password.length < 6) {
        issues["hossz"] = "Legalább 6 karakternek kell lennie!"

    }
    if (!nagybetuellenorzes(password)) {
        issues["nagybetu"] = "Kell tartalmaznia nagybetűt!"

    }
    if (!specialiskarakterellenorzes(password)) {
        issues["specialis"] = "Kell tartalmaznia legalább egy speciális karaktert!"

    }
    if (!szamjegyellenorzes(password)) {
        issues["szam"] = "Kell tartalmaznia legalább egy számot!"
    }
    return issues;
}

function nagybetuellenorzes(password) {
    // Regex: /(.*[A-Z].*)/
    // Jelentése: Bármilyen karakter (.*), amelyet követ legalább egy nagybetű ([A-Z]), 
    // amelyet ismét bármilyen karakter (.*) követ.
    return /[A-Z]/.test(password);
}
function specialiskarakterellenorzes(password) {
    // Regex: /[!@#$%^&*(),.?":{}|<>]|/
    // A Regex a leggyakoribb speciális karaktereket keresi.
    // Figyelem: Mely karaktereket tartod speciálisnak, az függ a biztonsági követelményeidtől.
    return /[!@#$%^&*(),.?":{}|<>_-]/.test(password);
}

function szamjegyellenorzes(password) {
    // Regex: /\d/
    // A \d (digit) a 0-9 tartományban lévő bármely számjegyet jelöli.
    return /\d/.test(password);
}

async function titkositas(password) {
    try {
        const saltRounds = 12
        const hash = await bcrypt.hash(password, saltRounds)
        return hash
    }
    catch (err) {
        console.error("Hiba a jelszó titkosításakor: ", err);
    }
}

function share_code_generator(){
      return crypto.randomBytes(6).toString("base64url"); 
}

async function compare(password, hash) {
    return await bcrypt.compare(password, hash)
}


function usernameTest(username) {
    let issues = {}
    if (username.length < 3) {
        issues["rovid"] = "Legalább 3 karakternek kell lennie!"
    }
    if (username.length > 20) {
        issues["hosszu"] = "Legfeljebb 20 karakter lehet!"
    }
    return issues;

}

function emailTest(email) {
    let issues = {}
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        issues["formatum"] = "Érvénytelen e-mail formátum!"
    }
    return issues;
}

function lengthtest(input, min, max) {    
    if (input.length < min || input.length > max) {
        const err = new Error(`A hossznak ${min} és ${max} karakter között kell lennie!`);
        err.status = 400; 
        throw err;
    }
    return true
}

module.exports = { passwordTest, titkositas, compare, usernameTest, emailTest, lengthtest };