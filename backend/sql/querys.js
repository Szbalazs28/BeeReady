const { share_code_generator } = require("../utils.js");
const pool = require('../sql/database');
const { isexistscheck } = require("../utils.js");

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

async function copy_deck(share_code, user_id) {
    if (await exists_share_code(share_code)) {
        const [deck] = await pool.execute("SELECT deck_name FROM flashcard_deck WHERE share_code = ?", [share_code]);
        let new_share_code = await uniquesharecode()
        await pool.execute("INSERT INTO flashcard_deck(user_id, deck_name, position, share_code) VALUES(?, ?, ?, ?)", [user_id, deck[0].deck_name, 0, new_share_code])
        const [cards] = await pool.execute("SELECT front_text, back_text FROM flashcard_card WHERE deck_id = (SELECT deck_id FROM flashcard_deck WHERE share_code = ?)", [share_code]);
        for (let i = 0; i < cards.length; i++) {
            await pool.execute("INSERT INTO flashcard_card (deck_id, front_text, back_text, position) VALUES ((SELECT deck_id FROM flashcard_deck WHERE share_code = ?), ?, ?, ?)", [new_share_code, cards[i].front_text, cards[i].back_text, i])
        }
    }
    else {
        let error = new Error("Nincs ilyen megosztási kód!")
        error.status = 400;
        throw error
    }
}

async function uniquesharecode() {
    let share_code = share_code_generator()
    while (await exists_share_code(share_code)) {
        share_code = share_code_generator()
    }
    return share_code
}

async function add_deck(id, name, isPublic = false) {
    let share_code = await uniquesharecode()
    const [maxposition] = await maxdeckposition(id);
    if (maxposition[0].max_position === null) {
        await pool.execute("INSERT INTO flashcard_deck(user_id, deck_name, position, share_code, public) VALUES(?, ?, 0, ?, ?)", [id, name, share_code, isPublic])
    }
    else {
        await pool.execute("INSERT INTO flashcard_deck(user_id, deck_name, position, share_code, public) VALUES(?, ?, ?, ?, ?)", [id, name, maxposition[0].max_position + 1, share_code, isPublic])
    }

}

async function change_share_code(id) {
    let share_code = share_code_generator()
    let [exists] = await pool.execute("SELECT share_code FROM flashcard_deck WHERE share_code = ?", [share_code]);
    while (exists.length > 0) {
        share_code = share_code_generator()
        [exists] = await pool.execute("SELECT share_code FROM flashcard_deck WHERE share_code = ?", [share_code]);
    }
    await pool.execute("UPDATE flashcard_deck SET share_code = ? WHERE deck_id = ?", [share_code, id])
    return share_code;
}

async function getdeck(id) {
    return await pool.execute("SELECT flashcard_deck.deck_name, flashcard_deck.deck_id, COUNT(flashcard_card.card_id) AS cardcount FROM flashcard_deck LEFT JOIN flashcard_card ON flashcard_deck.deck_id=flashcard_card.deck_id WHERE flashcard_deck.user_id = ? GROUP BY flashcard_deck.deck_id ORDER BY flashcard_deck.position ASC", [id])
}

async function getdeckbydeck_id(deck_id) {
    return await pool.execute("SELECT deck_name, deck_id, share_code FROM flashcard_deck WHERE deck_id = ?", [deck_id])
}

async function updatedeck(deck_name, deck_id, isPublic = null) {
    if (isPublic !== null) {
        await pool.execute("UPDATE flashcard_deck SET deck_name=?, public=? WHERE deck_id=?", [deck_name, isPublic, deck_id])
    } else {
        await pool.execute("UPDATE flashcard_deck SET deck_name=? WHERE deck_id=?", [deck_name, deck_id])
    }
}

async function deletedeck(deck_id) {
    await pool.execute("DELETE FROM flashcard_deck WHERE deck_id = ?", [deck_id])

}

async function getcards(deck_id) {
    return await pool.execute("SELECT * FROM flashcard_card WHERE deck_id = ? ORDER BY position ASC", [deck_id])
}

async function addnewcard(deck_id, front_text, back_text) {
    const [maxposition] = await maxcardposition(deck_id);
    if (maxposition[0].max_position === null) {
        await pool.execute("INSERT INTO flashcard_card (`deck_id`, `front_text`, `back_text`, `position`) VALUES(?, ?, ?, 0);", [deck_id, front_text, back_text])
    }
    else {
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

async function updatecard(front_text, back_text, card_id) {
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
        if (changes[i][0] === "username" || changes[i][0] === "email") {
            const [exists] = await isexist(changes[i]);
            if (exists.length > 0) {
                throw new Error(`A ${changes[i][1]} már foglalt!`);
            }
            else {
                await pool.query(`UPDATE users SET ${changes[i][0]} = ?  WHERE id=?`, [changes[i][1], id]);
            }
        }
        else {
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
    if (newdata.newpassword.length > 0) {
        changes.push(["password", newdata.newpassword])
    }
    return changes;
}

async function isexist(data) {
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
        `SELECT users.id, users.username, users.email, users.profil_pic_url
        FROM users 
        LEFT JOIN admins ON users.id = admins.user_id 
        WHERE admins.user_id IS NULL 
        ORDER BY users.id DESC;`
    );
    //left join csak a nem admin felhasznalokat adja vissza
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


async function getQnF() {
    return await pool.execute(`
SELECT
    'flashcard' AS type,
    fd.deck_id AS id,
    fd.deck_name AS title,
    u.username AS author,
    fd.create_date AS created_at,
    NULL AS description,
    COUNT(DISTINCT fc.card_id) AS item_count,
    COUNT(DISTINCT uf.user_id) AS favorite_count
FROM flashcard_deck fd
JOIN users u ON fd.user_id = u.id
LEFT JOIN flashcard_card fc ON fd.deck_id = fc.deck_id
LEFT JOIN user_favorites uf ON uf.item_id = fd.deck_id AND uf.item_type = 'flashcard'
WHERE fd.public = TRUE
GROUP BY fd.deck_id, fd.deck_name, fd.share_code, u.username, u.id, fd.create_date

UNION ALL

SELECT
    'quiz' AS type,
    q.quiz_id AS id,
    q.title AS title,
    u.username AS author,
    q.last_modified AS created_at,
    q.description AS description,
    COUNT(DISTINCT qq.question_id) AS item_count,
    COUNT(DISTINCT uf.user_id) AS favorite_count
FROM quizzes q
JOIN users u ON q.user_id = u.id
LEFT JOIN quiz_questions qq ON q.quiz_id = qq.quiz_id
LEFT JOIN user_favorites uf ON uf.item_id = q.quiz_id AND uf.item_type = 'quiz'
WHERE q.public = TRUE
GROUP BY q.quiz_id, q.title, u.username, u.id, q.last_modified, q.description

ORDER BY created_at DESC;`)
};


async function getquizzes(user_id) {
    return await pool.execute("SELECT quizzes.quiz_id, quizzes.user_id, quizzes.title,quizzes.description,quizzes.last_modified,quizzes.public,quizzes.last_result,quizzes.position, COUNT(quiz_questions.question_id) AS question_count, users.username as created_by, quizzes.public, quizzes.randomize_questions, quizzes.total_points FROM quizzes LEFT JOIN quiz_questions ON quizzes.quiz_id=quiz_questions.quiz_id JOIN users ON quizzes.user_id=users.id WHERE user_id = ? GROUP BY quizzes.quiz_id ORDER BY quizzes.position;", [user_id]);
}

async function save_quiz(title, description, public, user_id, randomize_questions, total_points) {
    const [data] = await pool.execute("SELECT title FROM quizzes WHERE user_id = ? AND title = ?", [user_id, title]);
    isexistscheck(data, title, true)
    const [maxposition] = await pool.execute("SELECT COALESCE(MAX(position) + 1, 0) AS max_position FROM quizzes WHERE user_id = ?", [user_id]);
    const [result] = await pool.execute("INSERT INTO quizzes (user_id, title, description, public, position, randomize_questions, total_points) VALUES (?, ?, ?, ?, ?, ?, ?)", [user_id, title, description, public, maxposition[0].max_position, randomize_questions, total_points]);
    return result.insertId;
}

async function save_question(quiz_id, question_text, id, type, position, points) {
    const [checkexistquiz] = await pool.execute("SELECT quiz_id FROM quizzes WHERE quiz_id = ? AND user_id = ?", [quiz_id, id]);
    isexistscheck(checkexistquiz, "Kvíz", false)
    const [checkexistquestion] = await pool.execute("SELECT quiz_questions.question_id FROM quiz_questions JOIN quizzes ON quiz_questions.quiz_id = quizzes.quiz_id WHERE quiz_questions.quiz_id = ? AND quizzes.user_id = ? AND quiz_questions.question_text = ?", [quiz_id, id, question_text]);
    isexistscheck(checkexistquestion, "Kérdés", true)
    const [result] = await pool.execute("INSERT INTO quiz_questions (quiz_id, question_text, question_type, position, points) VALUES (?, ?, ?, ?, ?)", [quiz_id, question_text, type, position, points]);
    return result.insertId;
}

async function save_answer(question_id, answer_text, right_answer, id, position) {
    const [checkexistquestion] = await pool.execute("SELECT question_id FROM quiz_questions JOIN quizzes ON quiz_questions.quiz_id = quizzes.quiz_id WHERE question_id = ? AND quizzes.user_id = ?", [question_id, id]);
    isexistscheck(checkexistquestion, "Kérdés", false)
    const [checkexistanswer] = await pool.execute("SELECT answer_id FROM quiz_answers WHERE question_id = ? AND answer_text = ?", [question_id, answer_text]);
    isexistscheck(checkexistanswer, "Válasz", true)
    await pool.execute("INSERT INTO quiz_answers (question_id, answer_text, right_answer, position) VALUES (?, ?, ?, ?)", [question_id, answer_text, right_answer, position]);
}

async function save_current_quiz_order(quiz_id, position, user_id) {
    await pool.execute("UPDATE quizzes SET position = ? WHERE quiz_id = ? AND user_id = ?", [position, quiz_id, user_id])
}



async function loadquestions(quiz_id, user_id) {
    const [rows] = await pool.execute("SELECT quiz_questions.question_id, quiz_questions.quiz_id, quiz_questions.question_text, quiz_questions.question_type, quiz_questions.position, quiz_questions.points FROM quiz_questions JOIN quizzes ON quiz_questions.quiz_id = quizzes.quiz_id WHERE quiz_questions.quiz_id = ? AND quizzes.user_id = ? order by quiz_questions.position", [quiz_id, user_id]);
    return rows
}

async function loadanswers(question_id, user_id) {
    const [rows] = await pool.execute("SELECT quiz_answers.answer_id, quiz_answers.question_id, quiz_answers.answer_text, quiz_answers.right_answer FROM quiz_answers JOIN quiz_questions ON quiz_answers.question_id = quiz_questions.question_id JOIN quizzes ON quiz_questions.quiz_id = quizzes.quiz_id WHERE quiz_questions.question_id = ? AND quizzes.user_id = ? order by quiz_answers.position", [question_id, user_id]);
    return rows
}

async function loadcorrectanswers(question_id, user_id) {
    const [rows] = await pool.execute("SELECT quiz_questions.points, quiz_answers.answer_id, quiz_answers.question_id, quiz_answers.answer_text, quiz_answers.right_answer FROM quiz_answers JOIN quiz_questions ON quiz_answers.question_id = quiz_questions.question_id JOIN quizzes ON quiz_questions.quiz_id = quizzes.quiz_id WHERE quiz_answers.right_answer = 1 AND quiz_questions.question_id = ? AND quizzes.user_id = ? order by quiz_answers.position ", [question_id, user_id]);
    return rows
}

async function delete_quiz(quiz_id, user_id) {
    await pool.execute("DELETE FROM quizzes WHERE quiz_id = ? AND user_id = ?", [quiz_id, user_id]);
}

async function quiz_submit(quiz_id, user_id, total_points) {
    const [result] = await pool.execute("INSERT INTO quiz_submit (quiz_id, user_id, total_points) VALUES (?, ?, ?)", [quiz_id, user_id, total_points]);
    return result.insertId;
}

async function save_result(result_id, question_id, answer, correct, points_earned) {
    await pool.execute("INSERT INTO quiz_results (result_id, question_id, answer, correct, points_earned) VALUES (?, ?, ?, ?, ?)", [result_id, question_id, JSON.stringify(answer), correct, points_earned])
}


async function calcquizpoints(result_id, user_id) {
    const [sum] = await pool.execute("SELECT SUM(quiz_results.points_earned) as earned_points FROM `quiz_results` JOIN quiz_submit ON quiz_results.result_id=quiz_submit.result_id WHERE quiz_submit.user_id=? AND quiz_results.result_id = ?", [user_id, result_id]);
    await pool.execute("UPDATE quiz_submit set earned_points = ? where quiz_submit.result_id = ? and quiz_submit.user_id = ?", [sum[0].earned_points, result_id, user_id]);

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
    copy_deck,
    getQnF,
    calcquizpoints,
    quiz_submit,
    loadcorrectanswers,
    save_result,
    delete_quiz,
    loadquestions,
    loadanswers,
    save_current_quiz_order,
    save_answer,
    save_question,
    save_quiz,
    getquizzes
};