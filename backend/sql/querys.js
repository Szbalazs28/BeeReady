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

async function add_task(user_id, task_name, task_description, importance) {
    await pool.execute(
        "INSERT INTO todo_tasks (user_id, task_name, task_description, importance) VALUES (?, ?, ?, ?)", 
        [user_id, task_name, task_description, importance]
    );
}

// Feladatok lekérése felhasználó szerint (időrendben visszafelé)
async function get_tasks(user_id) {
    return await pool.execute(`SELECT * FROM todo_tasks 
    WHERE user_id = ? 
    ORDER BY 
    importance ASC, 
    created_at ASC;`, [user_id]);
}

async function delete_task(task_id) {
    await pool.execute("DELETE FROM todo_tasks WHERE id = ?", [task_id]);
}

async function update_task(task_id, task_name, task_description, importance) {
    await pool.execute(
        "UPDATE todo_tasks SET task_name = ?, task_description = ?, importance = ? WHERE id = ?", 
        [task_name, task_description, importance, task_id]
    );
}

async function mark_task_done(task_id) {
    await pool.execute(
        "UPDATE todo_tasks SET importance = 'done' WHERE id = ?",
        [task_id]
    );
}




async function updateuser(rows, newdata, id) {
    let changes = updatebuild(rows, newdata);
    for (let i = 0; i < changes.length; i++) {
        if(changes[i][0] === "username" || changes[i][0] === "email"){
            const [exists] = await isexist(changes[i]);
            if(exists.length > 0){
                throw new Error(`A ${changes[i][1]} már foglalt!`);
            }
            else{
                await pool.query(`UPDATE users SET ${changes[i][0]} = ?  WHERE id=?`, [changes[i][1], id]);
            }
        }
        else{
            await pool.query(`UPDATE users SET ${changes[i][0]} = ?  WHERE id=?`, [changes[i][1], id]);
        }
        
    }
    
}

function updatebuild(rows, newdata) {
    let changes = []
    if (rows[0].username != newdata.username) {
        changes.push(["username", newdata.username])
    }
    if (rows[0].email != newdata.email) {
        changes.push(["email", newdata.email])
    }
    if (rows[0].profil_pic_url != `../img/allatos_profilkepek/${newdata.newprofil_pic_url}`) {
        changes.push(["profil_pic_url", `../img/allatos_profilkepek/${newdata.newprofil_pic_url}`])
    }
    if(newdata.newpassword.length > 0){
        changes.push(["password", newdata.newpassword])
    }
    return changes;
}

async function isexist(data){
    return await pool.execute(`SELECT ${data[0]} FROM users WHERE ${data[0]} = ?`, [data[1]]);
}

async function add_task(user_id, task_name, task_description, importance) {
    await pool.execute(
        "INSERT INTO todo_tasks (user_id, task_name, task_description, importance) VALUES (?, ?, ?, ?)", 
        [user_id, task_name, task_description, importance]
    );
}

// Feladatok lekérése felhasználó szerint (időrendben visszafelé)
async function get_tasks(user_id) {
    return await pool.execute(`SELECT 
        id,
        user_id,
        task_name,
        task_description,
        importance,
        is_completed,
        created_at
    FROM todo_tasks 
    WHERE user_id = ? 
    ORDER BY 
    is_completed ASC,
    importance ASC, 
    created_at ASC;`, [user_id]);
}

async function delete_task(task_id) {
    await pool.execute("DELETE FROM todo_tasks WHERE id = ?", [task_id]);
}

async function update_task(task_id, task_name, task_description, importance) {
    await pool.execute(
        "UPDATE todo_tasks SET task_name = ?, task_description = ?, importance = ? WHERE id = ?", 
        [task_name, task_description, importance, task_id]
    );
}

async function toggle_task_completion(task_id, is_completed) {
    await pool.execute(
        "UPDATE todo_tasks SET is_completed = ? WHERE id = ?",
        [is_completed, task_id]
    );
}

async function mark_task_done(task_id) {
    await pool.execute(
        "UPDATE todo_tasks SET is_completed = TRUE WHERE id = ?",
        [task_id]
    );
}

async function restore_task(task_id) {
    await pool.execute(
        "UPDATE todo_tasks SET is_completed = FALSE WHERE id = ?",
        [task_id]
    );
}

async function get_calendar_events(yrs, mnth, user_id) {
    // return id, formatted date, title and description so front end can display/delete
    return await pool.execute(
        "SELECT event_id, DATE_FORMAT(event_date, '%Y-%m-%d') AS event_date, title, description " +
        "FROM events WHERE YEAR(event_date) = ? AND MONTH(event_date) = ? AND user_id = ?",
        [yrs, mnth, user_id]
    );
}

async function Insert_calendar_event(date, title, user_id, description = null) {
    await pool.execute(
        "INSERT INTO events (event_date, title, user_id, description) VALUES (?, ?, ?, ?)",
        [date, title, user_id, description]
    );
}

async function delete_calendar_event(event_id, user_id) {
    await pool.execute(
        "DELETE FROM events WHERE event_id = ? AND user_id = ?",
        [event_id, user_id]
    );
}

async function adminCheck(id) {
    return await pool.execute("SELECT * FROM admins WHERE user_id = ?", [id]);
}

async function admin_get_users() {
    return await pool.execute(
        "SELECT id, username, email, profil_pic_url FROM users"
    );
}

async function admin_update_user(user_id, username, email, profil_pic_url) {
    await pool.execute(
        "UPDATE users SET username=?, email=?, profil_pic_url=? WHERE id=?",
        [username, email, profil_pic_url, user_id]
    );
}

async function admin_delete_user(user_id) {
    await pool.execute("DELETE FROM users WHERE id=?", [user_id]);
}

module.exports = {
    delete_task,
    add_task,
    get_tasks,
    update_task,
    mark_task_done,
    userexists,
    newuser,
    userbyemail,
    userbyid,
    adminCheck,
    admin_delete_user,
    admin_get_users,
    admin_update_user,
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
    toggle_task_completion,
    restore_task,
    get_calendar_events,
    Insert_calendar_event,
    delete_calendar_event,
    change_share_code,
    copy_deck
};