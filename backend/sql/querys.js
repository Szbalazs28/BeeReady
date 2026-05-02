const { share_code_generator } = require("../utils.js");
const { isexistscheck } = require("../utils.js");
const pool = require('../sql/database');

async function userexists(email, username) {
    return await pool.execute("SELECT email, username FROM users WHERE email= ? or username=?", [email, username]);
}

async function newuser(username, email, password, profil_pic_url) {
    await pool.execute("INSERT INTO users (username, email, password, profil_pic_url) VALUES (?,?,?,?)", [username, email, password, profil_pic_url]);
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
        let new_share_code = await uniquesharecode();
        await pool.execute("INSERT INTO flashcard_deck(user_id, deck_name, position, share_code) VALUES(?, ?, ?, ?)", [user_id, deck[0].deck_name, 0, new_share_code]);
        const [cards] = await pool.execute("SELECT front_text, back_text FROM flashcard_card WHERE deck_id = (SELECT deck_id FROM flashcard_deck WHERE share_code = ?)", [share_code]);
        for (let i = 0; i < cards.length; i++) {
            await pool.execute("INSERT INTO flashcard_card (deck_id, front_text, back_text, position) VALUES ((SELECT deck_id FROM flashcard_deck WHERE share_code = ?), ?, ?, ?)", [new_share_code, cards[i].front_text, cards[i].back_text, i]);
        }
    }
    else {
        let error = new Error("Nincs ilyen megosztási kód!");
        error.status = 400;
        throw error;
    }
}

async function uniquesharecode() {
    let share_code = share_code_generator();
    while (await exists_share_code(share_code)) {
        share_code = share_code_generator();
    }
    return share_code;
}

async function add_deck(id, name) {
    let share_code = await uniquesharecode();
    const [maxposition] = await maxdeckposition(id);
    if (maxposition[0].max_position === null) {
        await pool.execute("INSERT INTO flashcard_deck(user_id, deck_name, position, share_code) VALUES(?, ?, 0, ?)", [id, name, share_code]);
    }
    else {
        await pool.execute("INSERT INTO flashcard_deck(user_id, deck_name, position, share_code) VALUES(?, ?, ?, ?)", [id, name, maxposition[0].max_position + 1, share_code]);
    }

}

async function change_share_code(id, user_id) {
    let share_code = share_code_generator();
    let [exists] = await pool.execute("SELECT share_code FROM flashcard_deck WHERE share_code = ?", [share_code]);
    while (exists.length > 0) {
        share_code = share_code_generator()
        [exists] = await pool.execute("SELECT share_code FROM flashcard_deck WHERE share_code = ?", [share_code]);
    }
    const rows = await pool.execute("UPDATE flashcard_deck SET share_code = ? WHERE deck_id = ? AND user_id = ?", [share_code, id, user_id]);
    return { rows: rows, share_code: share_code };
}

async function getdeck(id) {
    return await pool.execute("SELECT flashcard_deck.deck_name, flashcard_deck.deck_id, COUNT(flashcard_card.card_id) AS cardcount FROM flashcard_deck LEFT JOIN flashcard_card ON flashcard_deck.deck_id=flashcard_card.deck_id WHERE flashcard_deck.user_id = ? GROUP BY flashcard_deck.deck_id ORDER BY flashcard_deck.position ASC", [id]);
}

async function getdeckbydeck_id(deck_id, user_id) {
    return await pool.execute("SELECT deck_name, deck_id, share_code, public FROM flashcard_deck WHERE deck_id = ? AND (user_id = ? or flashcard_deck.public)", [deck_id, user_id]);
}

async function updatedeck(deck_name, deck_id, public, user_id) {
    return await pool.execute("UPDATE flashcard_deck SET deck_name=?, public=? WHERE deck_id=? AND user_id = ?", [deck_name, public, deck_id, user_id]);
}

async function deletedeck(deck_id, user_id) {
    return await pool.execute("DELETE FROM flashcard_deck WHERE deck_id = ? AND user_id = ?", [deck_id, user_id]);
}

async function getcards(deck_id, user_id) {
    return await pool.execute("SELECT flashcard_card.front_text, flashcard_card.back_text, flashcard_card.card_id, flashcard_card.position, flashcard_deck.deck_id FROM flashcard_card JOIN flashcard_deck ON flashcard_card.deck_id = flashcard_deck.deck_id WHERE flashcard_card.deck_id = ? AND (flashcard_deck.user_id = ? OR flashcard_deck.public) ORDER BY position ASC", [deck_id, user_id]);
}

async function addnewcard(deck_id, front_text, back_text, user_id) {
    const [rows] = await pool.execute("SELECT deck_name FROM flashcard_deck WHERE deck_id = ? AND user_id = ?", [deck_id, user_id]);
    if (rows.length === 0) {
        const error = new Error("Nincs jogosultságod ehhez a paklihoz!");
        error.status = 403;
        throw error;
    }
    const [maxposition] = await maxcardposition(deck_id);
    if (maxposition[0].max_position === null) {
        await pool.execute("INSERT INTO flashcard_card (`deck_id`, `front_text`, `back_text`, `position`) VALUES(?, ?, ?, 0);", [deck_id, front_text, back_text]);
    }
    else {
        await pool.execute("INSERT INTO flashcard_card (`deck_id`, `front_text`, `back_text`, `position`) VALUES(?, ?, ?, ?);", [deck_id, front_text, back_text, maxposition[0].max_position + 1]);
    }

}

async function maxdeckposition(user_id) {
    return await pool.execute("SELECT MAX(position) AS max_position FROM flashcard_deck WHERE user_id = ?", [user_id]);
}

async function maxcardposition(deck_id) {
    return await pool.execute("SELECT MAX(position) AS max_position FROM flashcard_card WHERE deck_id = ?", [deck_id]);
}

async function deletecard(card_id, user_id) {
    return await pool.execute("DELETE flashcard_card FROM flashcard_card JOIN flashcard_deck ON flashcard_card.deck_id = flashcard_deck.deck_id WHERE flashcard_card.card_id = ? AND flashcard_deck.user_id = ?;", [card_id, user_id]);
}

async function updatecard(front_text, back_text, card_id, user_id) {
    return await pool.execute("UPDATE flashcard_card JOIN flashcard_deck ON flashcard_card.deck_id = flashcard_deck.deck_id SET flashcard_card.front_text=?, flashcard_card.back_text=? WHERE flashcard_card.card_id=? AND flashcard_deck.user_id = ?;", [front_text, back_text, card_id, user_id]);

}

async function getcardbyid(card_id, user_id) {
    return await pool.execute("SELECT flashcard_card.card_id, flashcard_card.front_text, flashcard_card.back_text,flashcard_card.deck_id, flashcard_card.position FROM flashcard_card JOIN flashcard_deck ON flashcard_card.deck_id = flashcard_deck.deck_id WHERE flashcard_card.card_id=? AND flashcard_deck.user_id = ?", [card_id, user_id]);
}

async function save_new_card_order(card_id, new_position, user_id) {
    return await pool.execute("UPDATE flashcard_card JOIN flashcard_deck ON flashcard_card.deck_id = flashcard_deck.deck_id SET flashcard_card.position = ? WHERE flashcard_card.card_id = ? AND flashcard_deck.user_id = ?", [new_position, card_id, user_id]);
}

async function save_new_deck_order(deck_id, new_position, user_id) {
    return await pool.execute("UPDATE flashcard_deck SET position = ? WHERE deck_id = ? AND user_id = ?", [new_position, deck_id, user_id]);
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

async function updateevent(event_id, day, startTime, endTime, subject, location, weekType, user_id) {
    await pool.execute("UPDATE timetable SET day = ?, start_time = ?, end_time = ?, subject = ?, location = ?, week_type = ? WHERE event_id = ? AND user_id = ?", [day, startTime, endTime, subject, location, weekType, event_id, user_id]);
}

async function delete_event(event_id, user_id) {
    await pool.execute("DELETE FROM timetable WHERE event_id = ? AND user_id = ?", [event_id, user_id]);
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

async function delete_task(task_id, user_id) {
    await pool.execute("DELETE FROM todo_tasks WHERE id = ? AND user_id = ?", [task_id, user_id]);
}

async function update_task(task_id, task_name, task_description, importance, user_id) {
    await pool.execute(
        "UPDATE todo_tasks SET task_name = ?, task_description = ?, importance = ? WHERE id = ? AND user_id = ?",
        [task_name, task_description, importance, task_id, user_id]
    );
}

async function toggle_task_completion(task_id, is_completed, user_id) {
    await pool.execute(
        "UPDATE todo_tasks SET is_completed = ? WHERE id = ? AND user_id = ?",
        [is_completed, task_id, user_id]
    );
}


async function restore_task(task_id, user_id) {
    await pool.execute(
        "UPDATE todo_tasks SET is_completed = FALSE WHERE id = ? AND user_id = ?",
        [task_id, user_id]
    );
}

async function mark_task_done(task_id, user_id) {
    await pool.execute(
        "UPDATE todo_tasks SET is_completed = true WHERE id = ? AND user_id = ?",
        [task_id, user_id]
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
        `SELECT users.id, users.username, users.email, users.password, users.profil_pic_url
        FROM users 
        LEFT JOIN admins ON users.id = admins.user_id 
        WHERE admins.user_id IS NULL`
    );
    //left join csak a nem admin felhasznalokat adja vissza
}

async function admin_get_admins() {
    return await pool.execute(
        `SELECT users.id, users.username, users.email, users.password, users.profil_pic_url
        FROM admins
        JOIN users ON users.id = admins.user_id `
    );
}

async function admin_update_user(user_id, username, password, email, profil_pic_url) {
    const [emailcheck] = await pool.execute("SELECT id FROM users WHERE email = ? AND id != ?", [email, user_id]);
    const [usernamecheck] = await pool.execute("SELECT id FROM users WHERE username = ? AND id != ?", [username, user_id]);
    isexistscheck(emailcheck, "E-mail", true);
    isexistscheck(usernamecheck, "Felhasználónév", true);
    await pool.execute(
        "UPDATE users SET username=?, password=?, email=?, profil_pic_url=? WHERE id=?",
        [username, password, email, profil_pic_url, user_id]
    );
}

async function save_new_admin(username, password, email) {
    const [emailcheck] = await pool.execute("SELECT id FROM users WHERE email = ?", [email]);
    const [usernamecheck] = await pool.execute("SELECT id FROM users WHERE username = ?", [username]);
    isexistscheck(emailcheck, "E-mail", true);
    isexistscheck(usernamecheck, "Felhasználónév", true);
    const [result] = await pool.execute(
        "INSERT INTO users (username, password, email, profil_pic_url) VALUES (?, ?, ?, ?);",
        [username, password, email, null]
    );
    await pool.execute("INSERT INTO admins (user_id) VALUES (?)", [result.insertId]);
}

async function admin_delete_user(user_id) {
    await pool.execute("DELETE FROM users WHERE id=?", [user_id]);
}

async function admin_search_users(query) {
    return await pool.execute(
        `SELECT users.id, users.username, users.email, users.password, users.profil_pic_url
        FROM users
        LEFT JOIN admins ON users.id = admins.user_id
        WHERE admins.user_id IS NULL
        AND users.username LIKE ?`,
        [`%${query}%`]
    );
}

async function admin_search_admins(query) {
    return await pool.execute(
        `SELECT users.id, users.username, users.email, users.password, users.profil_pic_url
        FROM users
        join admins ON users.id = admins.user_id
        where users.username like ?`,
        [`%${query}%`]
    );
}

async function getQnF(user_id) {
    return await pool.execute(`
SELECT
    'flashcard' AS type,
    fd.deck_id AS id,
    fd.deck_name AS title,
    u.username AS author,
    fd.create_date AS created_at,
    fd.share_code AS share_code,
    NULL AS description,
    (fd.user_id = ?) AS is_mine,
    COUNT(DISTINCT fc.card_id) AS item_count,
    COUNT(DISTINCT uf.user_id) AS favorite_count,
    (EXISTS(SELECT 1 FROM user_favorites WHERE user_id = ? AND item_type = 'flashcard' AND item_id = fd.deck_id)) AS is_saved_by_user
FROM flashcard_deck fd
JOIN users u ON fd.user_id = u.id
LEFT JOIN flashcard_card fc ON fd.deck_id = fc.deck_id
LEFT JOIN user_favorites uf ON uf.item_id = fd.deck_id AND uf.item_type = 'flashcard'
WHERE fd.public
GROUP BY fd.deck_id

UNION ALL

SELECT
    'quiz' AS type,
    q.quiz_id AS id,
    q.title AS title,
    u.username AS author,
    q.last_modified AS created_at,
    null as share_code,
    q.description AS description,
    (q.user_id = ?) AS is_mine,
    COUNT(DISTINCT qq.question_id) AS item_count,
    COUNT(DISTINCT uf.user_id) AS favorite_count,
    (EXISTS(SELECT 1 FROM user_favorites WHERE user_id = ? AND item_type = 'quiz' AND item_id = q.quiz_id)) AS is_saved_by_user
FROM quizzes q
JOIN users u ON q.user_id = u.id
LEFT JOIN quiz_questions qq ON q.quiz_id = qq.quiz_id
LEFT JOIN user_favorites uf ON uf.item_id = q.quiz_id AND uf.item_type = 'quiz'
WHERE q.public
GROUP BY q.quiz_id

ORDER BY created_at DESC;`, [user_id, user_id, user_id, user_id]);
};

// Szavakra bontani!!!
async function QnFSearch({ userId, type = null, searchTerm = null, favoritesOnly = false }) {
    const searchPattern = searchTerm ? `%${searchTerm}%` : null;

    const query = `
    SELECT * FROM (
        -- FLASHCARD RÉSZ
        SELECT 
            'flashcard' AS type,
            fd.deck_id AS id,
            fd.deck_name AS title,
            u.username AS author,
            fd.create_date AS created_at,
            fd.share_code AS share_code,
            NULL AS description,
            (fd.user_id = ?) AS is_mine,
            COUNT(DISTINCT fc.card_id) AS item_count,
            COUNT(DISTINCT uf_all.user_id) AS favorite_count,
            EXISTS(SELECT 1 FROM user_favorites WHERE user_id = ? AND item_type = 'flashcard' AND item_id = fd.deck_id) AS is_saved_by_user
        FROM flashcard_deck fd
        JOIN users u ON fd.user_id = u.id
        LEFT JOIN flashcard_card fc ON fd.deck_id = fc.deck_id
        LEFT JOIN user_favorites uf_all ON uf_all.item_id = fd.deck_id AND uf_all.item_type = 'flashcard'
        WHERE fd.public
        GROUP BY fd.deck_id

        UNION ALL

        -- QUIZ RÉSZ
        SELECT 
            'quiz' AS type,
            q.quiz_id AS id,
            q.title AS title,
            u.username AS author,
            q.last_modified AS created_at,
            null AS share_code,
            q.description AS description,
            (q.user_id = ?) AS is_mine,
            COUNT(DISTINCT qq.question_id) AS item_count,
            COUNT(DISTINCT uf_all.user_id) AS favorite_count,
            EXISTS(SELECT 1 FROM user_favorites WHERE user_id = ? AND item_type = 'quiz' AND item_id = q.quiz_id) AS is_saved_by_user
        FROM quizzes q
        JOIN users u ON q.user_id = u.id
        LEFT JOIN quiz_questions qq ON q.quiz_id = qq.quiz_id
        LEFT JOIN user_favorites uf_all ON uf_all.item_id = q.quiz_id AND uf_all.item_type = 'quiz'
        WHERE q.public 
        GROUP BY q.quiz_id
    ) AS results
    WHERE 
        (? IS NULL OR type = ?) 
        AND (? IS NULL OR title LIKE ? OR author LIKE ?)
        AND (? = FALSE OR is_saved_by_user = 1)
    ORDER BY created_at DESC;
    `;

    const params = [
        userId,
        userId,
        userId,
        userId,
        type, type,
        searchPattern, searchPattern, searchPattern,
        favoritesOnly

    ];

    return await pool.execute(query, params);
}

async function toggleFavorite(user_id, item_type, item_id) {
    const [existing] = await pool.execute(
        "SELECT id FROM user_favorites WHERE user_id = ? AND item_type = ? AND item_id = ?",
        [user_id, item_type, item_id]
    );

    if (existing.length > 0) {
        await pool.execute(
            "DELETE FROM user_favorites WHERE user_id = ? AND item_type = ? AND item_id = ?",
            [user_id, item_type, item_id]
        );
        return false;
    } else {
        await pool.execute(
            "INSERT INTO user_favorites (user_id, item_type, item_id) VALUES (?, ?, ?)",
            [user_id, item_type, item_id]
        );
        return true;
    }
}

async function getFavoriteCount(item_type, item_id) {
    const [result] = await pool.execute(
        "SELECT COUNT(id) as count FROM user_favorites WHERE item_type = ? AND item_id = ?",
        [item_type, item_id]
    );
    return result[0].count;
}



async function getquizzes(user_id) {
    return await pool.execute("SELECT quizzes.quiz_id, quizzes.user_id, quizzes.title,quizzes.description,quizzes.last_modified,quizzes.public,quizzes.position, COUNT(quiz_questions.question_id) AS question_count, users.username as created_by, quizzes.public, quizzes.randomize_questions, quizzes.total_points FROM quizzes LEFT JOIN quiz_questions ON quizzes.quiz_id=quiz_questions.quiz_id JOIN users ON quizzes.user_id=users.id WHERE user_id = ? GROUP BY quizzes.quiz_id ORDER BY quizzes.position;", [user_id]);
}

async function getforeignquizzes(user_id) {
    const [quizzes] = await pool.execute("select quizzes.quiz_id, quizzes.user_id, quizzes.title,quizzes.description,quizzes.last_modified,quizzes.public,quiz_share.position, COUNT(quiz_questions.question_id) AS question_count, users.username as created_by, quizzes.public, quizzes.randomize_questions, quizzes.total_points from quiz_share join quizzes ON quiz_share.quiz_id=quizzes.quiz_id JOIN users on quizzes.user_id=users.id LEFT JOIN quiz_questions ON quizzes.quiz_id=quiz_questions.quiz_id WHERE quiz_share.user_id = ? AND quizzes.user_id != ? AND quizzes.public=1 GROUP BY quizzes.quiz_id ORDER BY quiz_share.position", [user_id, user_id]);
    return quizzes;
}

async function save_quiz(title, description, public, user_id, randomize_questions, total_points) {
    const [data] = await pool.execute("SELECT title FROM quizzes WHERE user_id = ? AND title = ?", [user_id, title]);
    isexistscheck(data, title, true);
    const [maxposition] = await pool.execute("SELECT COALESCE(MAX(position) + 1, 0) AS max_position FROM quizzes WHERE user_id = ?", [user_id]);
    const [result] = await pool.execute("INSERT INTO quizzes (user_id, title, description, public, position, randomize_questions, total_points) VALUES (?, ?, ?, ?, ?, ?, ?)", [user_id, title, description, public, maxposition[0].max_position, randomize_questions, total_points]);
    return result.insertId;
}

async function save_question(quiz_id, question_text, id, type, position, points) {
    const [checkexistquiz] = await pool.execute("SELECT quiz_id FROM quizzes WHERE quiz_id = ? AND user_id = ?", [quiz_id, id]);
    isexistscheck(checkexistquiz, "Kvíz", false);
    const [result] = await pool.execute("INSERT INTO quiz_questions (quiz_id, question_text, question_type, position, points) VALUES (?, ?, ?, ?, ?)", [quiz_id, question_text, type, position, points]);
    return result.insertId;
}

async function save_answer(question_id, answer_text, right_answer, id, points) {
    const [checkexistquestion] = await pool.execute("SELECT question_id FROM quiz_questions JOIN quizzes ON quiz_questions.quiz_id = quizzes.quiz_id WHERE question_id = ? AND quizzes.user_id = ?", [question_id, id]);
    isexistscheck(checkexistquestion, "Kérdés", false);
    await pool.execute("INSERT INTO quiz_answers (question_id, answer_text, right_answer, points) VALUES (?, ?, ?, ?)", [question_id, answer_text, right_answer, points]);
}

async function save_current_quiz_order(quiz_id, position, user_id) {
    await pool.execute("UPDATE quizzes SET position = ? WHERE quiz_id = ? AND user_id = ?", [position, quiz_id, user_id]);
}
async function save_current_foreign_quiz_order(quiz_id, position, user_id) {
    await pool.execute("UPDATE quiz_share SET position = ? WHERE quiz_id = ? AND user_id = ?", [position, quiz_id, user_id]);
}



async function loadquestions(quiz_id, user_id) {
    const [rows] = await pool.execute("SELECT quiz_questions.question_id, quiz_questions.quiz_id, quiz_questions.question_text, quiz_questions.question_type, quiz_questions.position, quiz_questions.points FROM quiz_questions JOIN quizzes ON quiz_questions.quiz_id = quizzes.quiz_id WHERE quiz_questions.quiz_id = ? AND (quizzes.user_id = ? OR quizzes.public = 1) order by quiz_questions.position", [quiz_id, user_id]);
    return rows;
}


async function loadanswers_withoutright(question_id, user_id) {
    const [rows] = await pool.execute("SELECT quiz_answers.answer_id, quiz_answers.question_id, quiz_answers.answer_text, quiz_answers.points FROM quiz_answers JOIN quiz_questions ON quiz_answers.question_id = quiz_questions.question_id JOIN quizzes ON quiz_questions.quiz_id = quizzes.quiz_id WHERE quiz_questions.question_id = ? AND (quizzes.user_id = ? OR quizzes.public = 1)", [question_id, user_id]);
    return rows;
}

async function loadanswers(question_id, user_id) {
    const [rows] = await pool.execute("SELECT quiz_questions.points as question_points, quiz_answers.answer_id as answer_id, quiz_answers.question_id as question_id, quiz_answers.answer_text as answer_text, quiz_answers.right_answer as right_answer, quiz_answers.points as points FROM quiz_answers JOIN quiz_questions ON quiz_answers.question_id = quiz_questions.question_id JOIN quizzes ON quiz_questions.quiz_id = quizzes.quiz_id WHERE quiz_questions.question_id = ? AND (quizzes.user_id = ? OR quizzes.public = 1) ", [question_id, user_id]);
    return rows;
}

async function delete_quiz(quiz_id, user_id, isForeign) {
    if (isForeign) {
        await pool.execute("DELETE FROM quiz_share WHERE quiz_id = ? AND user_id = ?", [quiz_id, user_id]);
        await pool.execute("DELETE FROM quiz_submit WHERE quiz_id = ? AND user_id = ?", [quiz_id, user_id]);
    } else {
        await pool.execute("DELETE FROM quizzes WHERE quiz_id = ? AND user_id = ?", [quiz_id, user_id]);
    }
}

async function loadquizmeta(quiz_id) {
    const [row] = await pool.execute("SELECT quizzes.quiz_id, quizzes.title, quizzes.description, quizzes.public, users.username as author, quizzes.randomize_questions, quizzes.total_points FROM quizzes JOIN users ON quizzes.user_id=users.id WHERE quizzes.quiz_id = ? AND quizzes.public", [quiz_id]);
    return row;
}

async function save_foreign_quiz(result_id, quiz_id, user_id) {
    const [checkexistquiz] = await pool.execute("SELECT quiz_id FROM quizzes WHERE quiz_id = ? AND public", [quiz_id]);
    isexistscheck(checkexistquiz, "Kvíz", false);
    pool.execute("INSERT INTO quiz_share (result_id, quiz_id, user_id) VALUES (?, ?, ?)", [result_id, quiz_id, user_id]);
}

async function quiz_submit(quiz_id, user_id, total_points) {
    const [result] = await pool.execute("INSERT INTO quiz_submit (quiz_id, user_id, total_points) VALUES (?, ?, ?)", [quiz_id, user_id, total_points]);
    return result.insertId;
}

async function save_result(result_id, question_id, answer_text, points_earned) {
    await pool.execute("INSERT INTO quiz_results (result_id, question_id, answer_text, points_earned) VALUES (?, ?, ?, ?)", [result_id, question_id, answer_text, points_earned]);
}


async function calcquizpoints(result_id, user_id) {
    const [sum] = await pool.execute("SELECT SUM(quiz_results.points_earned) as earned_points FROM `quiz_results` JOIN quiz_submit ON quiz_results.result_id=quiz_submit.result_id WHERE quiz_submit.user_id=? AND quiz_results.result_id = ?", [user_id, result_id]);
    await pool.execute("UPDATE quiz_submit set earned_points = ? where quiz_submit.result_id = ? and quiz_submit.user_id = ?", [sum[0].earned_points, result_id, user_id]);

}

async function getquizresult(user_id, quiz_id) {
    const [rows] = await pool.execute("SELECT ROUND((quiz_submit.earned_points/quiz_submit.total_points)*100, 2) AS result, quiz_submit.taken_at, quiz_submit.total_points, quiz_submit.earned_points, quiz_submit.result_id FROM `quiz_submit` WHERE quiz_submit.quiz_id = ? AND quiz_submit.user_id = ?", [quiz_id, user_id]);
    return rows;
}

async function getuseranswers(id, result_id, question_id) {
    const [rows] = await pool.execute("SELECT quiz_results.question_id as question_id, quiz_results.answer_text as answer_text, quiz_results.points_earned as points_earned FROM `quiz_results` JOIN quiz_submit ON quiz_results.result_id=quiz_submit.result_id WHERE quiz_results.question_id = ? AND quiz_results.result_id = ? AND quiz_submit.user_id = ?", [question_id, result_id, id]);
    return rows;
}

async function updateuser(data, id) {
            const [exists] = await isexist(id, data.email, data.username);
            if (exists.length > 0) {
                const err = new Error(`Az E-mail cím vagy a felhasználónév már foglalt!`)
                err.status = 409;
                throw err;
            }
            else {
                await pool.query(`UPDATE users SET username = ?, email = ?, profil_pic_url = ?, password = ? WHERE id = ?`, [data.username, data.email, `../img/allatos_profilkepek/${data.newprofil_pic_url}`, data.newpassword, id]);
            }

}

async function isexist(id, email, username) {
    return await pool.execute(`SELECT email, username FROM users WHERE id <> ? AND (email = ? OR username = ?)`, [id, email, username]);
}



module.exports = {
    save_new_admin,
    loadquizmeta,
    save_foreign_quiz,
    getFavoriteCount,
    toggleFavorite,
    QnFSearch,
    getQnF,
    admin_delete_user,
    admin_update_user,
    admin_get_users,
    adminCheck,
    admin_get_admins,
    admin_search_users,
    admin_search_admins,
    delete_calendar_event,
    Insert_calendar_event,
    get_calendar_events,
    restore_task,
    toggle_task_completion,
    save_current_foreign_quiz_order,
    getforeignquizzes,
    loadanswers_withoutright,
    getuseranswers,
    getquizresult,
    calcquizpoints,
    quiz_submit,
    save_result,
    delete_quiz,
    loadquestions,
    loadanswers,
    save_current_quiz_order,
    save_answer,
    save_question,
    save_quiz,
    getquizzes,
    delete_task,
    add_task,
    get_tasks,
    update_task,
    mark_task_done,
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