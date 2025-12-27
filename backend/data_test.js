const bcrypt = require('bcrypt')


function passwordTest(password) {
    let hibak = {}
    hibak["alap"] = "A jelszónak meg kell felelnie a következő követelményeknek:"
    if (password.length < 6) {
        hibak["hossz"] = "Legalább 6 karakternek kell lennie!"

    }
    if (!nagybetuellenorzes(password)) {
        hibak["nagybetu"] = "Kell tartalmaznia nagybetűt!"

    }
    if (!specialiskarakterellenorzes(password)) {
        hibak["specialis"] = "Kell tartalmaznia legalább egy speciális karaktert!"

    }
    if (!szamjegyellenorzes(password)) {
        hibak["szam"] = "Kell tartalmaznia legalább egy számot!"
    }
    return hibak;
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

async function compare(password, hash) {
    return await bcrypt.compare(password, hash)
}


function usernameTest(username) {
    let hibak = {}
    if (username.length < 3) {
        hibak["rovid"] = "Legalább 3 karakternek kell lennie!"
    }
    if (username.length > 20) {
        hibak["hosszu"] = "Legfeljebb 20 karakter lehet!"
    }
    return hibak;

}

function emailTest(email) {
    let hibak = {}
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        hibak["formatum"] = "Érvénytelen e-mail formátum!"
    }
    return hibak;
}

module.exports = { passwordTest, titkositas, compare, usernameTest, emailTest };