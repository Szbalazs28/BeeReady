const { share_code_generator } = require("../utils.js");
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

async function exists_share_code(share_code) {
    const [exists] = await pool.execute("SELECT share_code FROM flashcard_deck WHERE share_code = ?", [share_code]);
    return exists.length > 0;
}

async function  copy_deck(share_code, user_id) {
    if(await exists_share_code(share_code)){
        const [deck] = await pool.execute("SELECT deck_name FROM flashcard_deck WHERE share_code = ?", [share_code]);
        let new_share_code = await uniquesharecode()
        await pool.execute("INSERT INTO flashcard_deck(user_id, deck_name, position, share_code) VALUES(?, ?, ?, ?)", [user_id, deck[0].deck_name, 0, new_share_code])
        const [cards] = await pool.execute("SELECT front_text, back_text FROM flashcard_card WHERE deck_id = (SELECT deck_id FROM flashcard_deck WHERE share_code = ?)", [share_code]);
        for(let i = 0; i<cards.length; i++){
            await pool.execute("INSERT INTO flashcard_card (deck_id, front_text, back_text, position) VALUES ((SELECT deck_id FROM flashcard_deck WHERE share_code = ?), ?, ?, ?)", [new_share_code, cards[i].front_text, cards[i].back_text, i])
        }
    }
    else{
        let error = new Error("Nincs ilyen megosztási kód!")
        error.status = 400;
        throw error
    }
}

async function uniquesharecode(){
    let share_code = share_code_generator()
    while(await exists_share_code(share_code)){
        share_code = share_code_generator()        
    }
    return share_code
}

async function add_deck(id, name) {
    let share_code = await uniquesharecode()
    const [maxposition] = await maxdeckposition(id);
    if(maxposition[0].max_position === null){
        await pool.execute("INSERT INTO flashcard_deck(user_id, deck_name, position, share_code) VALUES(?, ?, 0, ?)", [id, name, share_code])    
    }
    else{
        await pool.execute("INSERT INTO flashcard_deck(user_id, deck_name, position, share_code) VALUES(?, ?, ?, ?)", [id, name, maxposition[0].max_position + 1, share_code])
    }

}

async function change_share_code(id) {
    let share_code = share_code_generator()
    let [exists] = await pool.execute("SELECT share_code FROM flashcard_deck WHERE share_code = ?", [share_code]);
    while(exists.length > 0){
        share_code = share_code_generator()
        [exists] = await pool.execute("SELECT share_code FROM flashcard_deck WHERE share_code = ?", [share_code]);
    }
    await pool.execute("UPDATE flashcard_deck SET share_code = ? WHERE deck_id = ?", [share_code, id])
    return share_code;
}

async function  getdeck(id) {
    return await pool.execute("SELECT flashcard_deck.deck_name, flashcard_deck.deck_id, COUNT(flashcard_card.card_id) AS cardcount FROM flashcard_deck LEFT JOIN flashcard_card ON flashcard_deck.deck_id=flashcard_card.deck_id WHERE flashcard_deck.user_id = ? GROUP BY flashcard_deck.deck_id ORDER BY flashcard_deck.position ASC",[id])
}

async function  getdeckbydeck_id(deck_id) {
    return await pool.execute("SELECT deck_name, deck_id, share_code FROM flashcard_deck WHERE deck_id = ?",[deck_id])
}

async function updatedeck(deck_name, deck_id) {
    await pool.execute("UPDATE flashcard_deck SET deck_name=? WHERE deck_id=?", [deck_name, deck_id])
}

async function  deletedeck(deck_id) {    
    await pool.execute("DELETE FROM flashcard_deck WHERE deck_id = ?", [deck_id])
    
}

async function getcards(deck_id) {
    return await pool.execute("SELECT * FROM flashcard_card WHERE deck_id = ? ORDER BY position ASC",[deck_id])
}

async function addnewcard(deck_id, front_text, back_text) {
    const [maxposition] = await maxcardposition(deck_id);
    if(maxposition[0].max_position === null){
        await pool.execute("INSERT INTO flashcard_card (`deck_id`, `front_text`, `back_text`, `position`) VALUES(?, ?, ?, 0);", [deck_id, front_text, back_text])
    }
    else{
        await pool.execute("INSERT INTO flashcard_card (`deck_id`, `front_text`, `back_text`, `position`) VALUES(?, ?, ?, ?);", [deck_id, front_text, back_text, maxposition[0].max_position + 1])
    }
    
}

async function maxdeckposition(user_id) {
    return await pool.execute("SELECT MAX(position) AS max_position FROM flashcard_deck WHERE user_id = ?", [user_id]);
}

async function maxcardposition(deck_id) {
    return await pool.execute("SELECT MAX(position) AS max_position FROM flashcard_card WHERE deck_id = ?", [deck_id]);
}

async function deletecard(card_id) {
    await pool.execute("DELETE FROM flashcard_card WHERE flashcard_card.card_id = ?", [card_id])
}

async function  updatecard(front_text, back_text, card_id) {
    await pool.execute("UPDATE flashcard_card SET front_text=?, back_text=? WHERE card_id=?", [front_text, back_text, card_id])
    
}

async function getcardbyid(card_id) {
    return await pool.execute("SELECT * FROM flashcard_card WHERE card_id=?", [card_id])
}

async function save_new_card_order(card_id, new_position) {
    await pool.execute("UPDATE flashcard_card SET position = ? WHERE card_id = ?", [new_position, card_id])
}

async function save_new_deck_order(deck_id, new_position) {
    await pool.execute("UPDATE flashcard_deck SET position = ? WHERE deck_id = ?", [new_position, deck_id])
}

async function get_events(user_id) {
    return await pool.execute("SELECT event_id, day, start_time, end_time, subject, location, week_type FROM timetable WHERE user_id = ? AND week_type = (SELECT selected_week_type FROM users WHERE id = ?) ORDER BY day ASC, start_time ASC, end_time ASC", [user_id, user_id]);
}

async function get_saved_weektype(user_id) {
    return await pool.execute("SELECT selected_week_type FROM users WHERE id = ?", [user_id]);
}

async function save_new_event(id, day, startTime, endTime, subject, location, weekType) {
    await pool.execute("INSERT INTO timetable (user_id, day, start_time, end_time, subject, location, week_type) VALUES (?,?,?,?,?,?,?)", [id, day, startTime, endTime, subject, location, weekType]);
    
}

async function changeselectedweek(id, week_type) {
    await pool.execute("UPDATE users SET selected_week_type = ? WHERE id = ?", [week_type, id]);
}

async function updateevent(event_id, day, startTime, endTime, subject, location, weekType) {
    await pool.execute("UPDATE timetable SET day = ?, start_time = ?, end_time = ?, subject = ?, location = ?, week_type = ? WHERE event_id = ?", [day, startTime, endTime, subject, location, weekType, event_id]);
}

async function delete_event(event_id) {
    await pool.execute("DELETE FROM timetable WHERE event_id = ?", [event_id]);
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
    updatecard,
    getcardbyid,
    updatedeck,
    deletedeck,
    save_new_card_order,
    save_new_deck_order,
    save_new_event,
    get_events,
    changeselectedweek,
    get_saved_weektype,
    updateevent,
    delete_event,
    change_share_code,
    copy_deck
};