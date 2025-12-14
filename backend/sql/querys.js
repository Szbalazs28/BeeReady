const pool = require('../sql/database');

async function userexists(email, username) {
    return await pool.execute("SELECT email, username FROM users WHERE email= ? or username=?", [email, username]);
}

async function newuser(username, email, password, profil_pic_url) {
    await pool.execute("INSERT INTO users (username, email, password, profil_pic_url) VALUES (?,?,?,?)", [username, email, password, profil_pic_url])
    return await pool.execute("SELECT id FROM users WHERE email= ?", [email]);
}

async function userbyemail(email) {
    return await pool.execute("SELECT * FROM users WHERE email = ?", [email]);
}

async function userbyid(id) {
    return await pool.execute("SELECT username, email, profil_pic_url, password FROM users WHERE id = ?", [id]);
}

async function add_deck(id, name) {
    await pool.execute("INSERT INTO flashcard_deck(user_id, deck_name) VALUES(?, ?)", [id, name])
}

async function  getdeck(id) {
    return await pool.execute("SELECT deck_name, deck_id FROM flashcard_deck WHERE user_id = ?",[id])
}

async function  getdeckbydeck_id(deck_id) {
    return await pool.execute("SELECT deck_name, deck_id FROM flashcard_deck WHERE deck_id = ?",[deck_id])
}

async function getcards(deck_id) {
    return await pool.execute("SELECT front_text, back_text, card_id, deck_id FROM flashcard_card WHERE deck_id = ?",[deck_id])
}

async function addnewcard(deck_id, front_text, back_text) {
    await pool.execute("INSERT INTO flashcard_card (`deck_id`, `front_text`, `back_text`) VALUES(?, ?, ?);", [deck_id, front_text, back_text])
}

async function deletecard(card_id) {
    await pool.execute("DELETE FROM flashcard_card WHERE flashcard_card.card_id = ?", [card_id])
}

async function card_counter(deck_id) {
    return await pool.execute("SELECT COUNT(*) as card_count FROM flashcard_card WHERE deck_id = ? GROUP BY deck_id;", [deck_id])
}

async function updateuser(rows, ujadatok, kit) {
    let valtoztatas = updatebuild(rows, ujadatok);
    for (let i = 0; i < valtoztatas.length; i++) {
        if(valtoztatas[i][0] === "username" || valtoztatas[i][0] === "email"){
            const [exists] = await isexist(valtoztatas[i]);
            if(exists.length > 0){
                throw new Error(`A ${valtoztatas[i][1]} már foglalt!`);
            }
            else{
                await pool.query(`UPDATE users SET ${valtoztatas[i][0]} = ?  WHERE id=?`, [valtoztatas[i][1], kit]);
            }
        }
        else{
            await pool.query(`UPDATE users SET ${valtoztatas[i][0]} = ?  WHERE id=?`, [valtoztatas[i][1], kit]);
        }
        
    }
    
}

function updatebuild(rows, ujadatok) {
    let valtoztatas = []
    if (rows[0].username != ujadatok.username) {
        valtoztatas.push(["username", ujadatok.username])
    }
    if (rows[0].email != ujadatok.email) {
        valtoztatas.push(["email", ujadatok.email])
    }
    if (rows[0].profil_pic_url != `../img/allatos_profilkepek/${ujadatok.newprofil_pic_url}`) {
        valtoztatas.push(["profil_pic_url", `../img/allatos_profilkepek/${ujadatok.newprofil_pic_url}`])
    }
    if(ujadatok.newpassword.length > 0){
        valtoztatas.push(["password", ujadatok.newpassword])
    }
    return valtoztatas;
}

async function isexist(data){
    return await pool.execute(`SELECT ${data[0]} FROM users WHERE ${data[0]} = ?`, [data[1]]);
}



module.exports = {
    userexists,
    newuser,
    userbyemail,
    userbyid,
    updateuser,
    add_deck,
    getdeck,
    getdeckbydeck_id,
    getcards,
    addnewcard, 
    deletecard,
    card_counter
};