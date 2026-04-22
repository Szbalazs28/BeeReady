const bcrypt = require('bcrypt');
const { save_result, userexists, userbyemail, userbyid, loadanswers } = require("./sql/querys.js");

function passwordTest(password) {
    let issue = false;
    let err = new Error("A jelszónak meg kell felelnie a követleményeknek: \n");
    if (password.length < 6) {
        err.message += "\n Legalább 6 karakternek kell lennie!";
        issue = true;
    }
    if (!includeuppercasech(password)) {
        err.message += "\n Kell tartalmaznia nagybetűt!";
        issue = true;
    }
    if (!includespecialch(password)) {
        err.message += "\n Kell tartalmaznia legalább egy speciális karaktert!";
        issue = true;
    }
    if (!includenumber(password)) {
        err.message += "\n Kell tartalmaznia legalább egy számot!";
        issue = true;
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
        const saltRounds = 12;
        const hash = await bcrypt.hash(password, saltRounds);
        return hash;
    }
    catch (err) {
        console.error("Hiba a jelszó titkosításakor: ", err);
    }

}

function admincheck(rows) {
    if (rows.length == 0) {
        const err = new Error("Nincs jogosultságod!");
        err.status = 403;
        throw err;
    }
}


function emailTest(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        const err = new Error("Hibás E-mail cím formátum!");
        err.status = 400;
        throw err;
    }
}

async function checkuserexists(email, username) {
    const [rows] = await userexists(email, username);
    if (rows.length != 0) {
        const err = new Error("Ilyen E-mail cím vagy Felhasználónév már létezik!");
        err.status = 409;
        throw err;
    }
}

async function getuserbyemail(email) {
    const [rows] = await userbyemail(email);
    if (rows.length == 0) {
        const err = new Error("Nem található E-mail cím!");
        err.status = 409;
        throw err;
    }
    return rows;

}

async function getuserbyid(id) {
    const [rows] = await userbyid(id);
    if (rows.length == 0) {
        const err = new Error("Nem található a felhasználó!");
        err.status = 409;
        throw err;
    }
    return rows;

}

async function compare(password, hash) {
    if (!await bcrypt.compare(password, hash)) {
        let err = new Error("Hibás jelszó!");
        err.status = 403;
        throw err;
    }

}

function timetest(start, end) {
    if (start.length < 5 || end.length < 5 || start[2] !== ':' || end[2] !== ':') {
        throw new Error("Az időpontnak HH:MM formátumúnak kell lennie!");
    }
    else {
        if (start >= end) {
            throw new Error("A kezdési időpontnak kisebbnek kell lennie, mint a befejezésinek!");
        }
    }

}

function affectedRowscheck(rows) {
    if (rows.affectedRows === 0) {
        throw new Error("Nem sikerült az adatok módosítása!");
    }
}

function lengthtest(input, min, max) {
    if (input.length < min || input.length > max) {
        const err = new Error(`A hossznak ${min} és ${max} karakter között kell lennie!`);
        err.status = 400;
        throw err;
    }
}

async function answer_validation(result_id, user, id) {
    let correct = false;
    let points = 0;
    const answers = await loadanswers(user.question_id, id);
    let answers_text = { answers: [] };
    if (user.question_type == "order") {
        if (answers[0].question_points != 0) {
            answers_text.ispartial = false;
            points = answers[0].question_points;
            for (let i = 0; i < answers.length && i < user.answers.length; i++) {
                let correct = true;
                if (answers[i].answer_id != user.answers[i]) {
                    correct = false;
                    points = 0;
                }
                answers_text.answers.push({ answer: user.answers[i], correct: correct });
            }
        }
        else {
            answers_text.ispartial = true;
            for (let i = 0; i < answers.length && i < user.answers.length; i++) {
                let correct = false;
                if (answers[i].answer_id == user.answers[i]) {
                    points++;
                    correct = true;
                }
                answers_text.answers.push({ answer: user.answers[i], points: correct ? 1 : 0, correct: correct });
            }
        }
    }
    else {
        if (user.question_type == "short") {
            let j = 0;
            while (j < answers.length && answers[j].answer_text != user.answers[0]) {
                j++;
            }
            if (j < answers.length) {
                correct = true;
                answers_text.answers.push({ answer: user.answers[0], correct: true });
                points = answers[0].question_points;
            }
            else {
                answers_text.answers.push({ answer: user.answers[0], correct: false });
            }
        }
        else {
            if (user.question_type == "fill") {
                const answer_words = JSON.parse(answers[0].answer_text).words;
                const answer_points = JSON.parse(answers[0].answer_text).points;
                for (let i = 0; i < answer_words.length && i < user.answers.length; i++) {
                    let correct = false;
                    if (answer_words[i] == user.answers[i]) {
                        correct = true;
                        points += answer_points[i];
                    }
                    answers_text.answers.push({ answer: user.answers[i], points: correct ? answer_points[i] : 0, correct: correct });
                }

            }
            else {
                if (user.question_type == "standard") {
                    for (let i = 0; i < answers.length && i < user.answers.length; i++) {
                        let correct = false;
                        if (answers[i].right_answer == user.answers[i]) {
                            correct = true;
                            points += answers[i].points;
                        }
                        answers_text.answers.push({ answer: user.answers[i], points: correct ? answers[i].points : 0, correct: correct });
                    }
                }
            }
        }
    }
    await save_result(result_id, user.question_id, JSON.stringify(answers_text), points);
}
module.exports = { admincheck, answer_validation, affectedRowscheck, getuserbyid, getuserbyemail, passwordTest, encrypt, compare, emailTest, lengthtest, checkuserexists, timetest };