const express = require("express");
const rateLimit = require('express-rate-limit');
const router = express.Router();


const {get_time_left, authenticateToken, generateToken } = require("../middleware/jsonwebtoken.js");
const { admincheck, answer_validation, affectedRowscheck, getuserbyemail, passwordTest, encrypt, compare, emailTest, lengthtest, checkuserexists, getuserbyid, timetest } = require("../data_test.js");
const { admin_search_users, loadquizmeta, save_foreign_quiz, save_current_foreign_quiz_order, getforeignquizzes, loadanswers_withoutright, getuseranswers, getquizresult, restore_task, calcquizpoints, delete_quiz, loadquestions, loadanswers, save_current_quiz_order, save_answer, save_question, save_quiz, getquizzes, getQnF, Insert_calendar_event, delete_calendar_event, get_calendar_events, adminCheck, admin_get_users, admin_update_user, admin_delete_user, add_task, get_tasks, delete_task, update_task, mark_task_done, newuser, updateuser, add_deck, getdeck, getdeckbydeck_id, getcards, addnewcard, deletecard, getcardbyid, updatecard, updatedeck, deletedeck, save_new_card_order, save_new_deck_order, save_new_event, get_events, changeselectedweek, get_saved_weektype, updateevent, delete_event, change_share_code, copy_deck, toggleFavorite, getFavoriteCount, QnFSearch, quiz_submit } = require("../sql/querys.js");

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 percos időablak
  max: 5, // Maximum 5 próbálkozás a 5 perc alatt IP címenként
  message: {
    success: false,
    message: "Túl sok bejelentkezési kísérletet észleltünk erről az IP-címről. Kérem, próbálja újra 5 perc múlva."
  },
  standardHeaders: true,
  legacyHeaders: false,
});


router.post("/registration", loginLimiter, async (req, res, next) => {
  try {
    const data = req.body
    lengthtest(data.username, 3, 20)
    emailTest(data.email)
    passwordTest(data.password)
    await checkuserexists(data.email, data.username)
    const password = await encrypt(data.password)
    const [user] = await newuser(data.username, data.email, password, data.profil_pic_url)
    const token = await generateToken(user[0].id, "1h")
    res.status(200).json({ token, redirect: "../html/main.html" })
  } catch (error) {
    next(error)
  }

})

router.post("/login", loginLimiter, async (req, res, next) => {
  try {
    const data = req.body;
    const rows = await getuserbyemail(data.email);
    await compare(data.password, rows[0].password)
    const [adminRows] = await adminCheck(rows[0].id);
    const isAdmin = adminRows.length > 0;
    let expiresInTime = "70s";
    if (data.stay) {
      expiresInTime = "7d";
    }
    const token = await generateToken(rows[0].id, expiresInTime);
    res.status(200).json({ token, redirect: isAdmin ? "../html/admin.html" : "../html/main.html"})
  } catch (error) {
    next(error);
  }
});

router.get("/get_expire_time", authenticateToken, async (req, res, next) => {
  try {
    const time_left = await get_time_left(req.headers['authorization'].split(' ')[1]);
    res.status(200).json({ time_left });
  } catch (error) {
    next(error)
  }
});

router.get("/get_extended_time", authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id;    
    const token = await generateToken(id, "1h");
    res.status(200).json({ write: true, message: "Munkamenet meghosszabbítva 1 órával!", token: token });
  } catch (error) {
    next(error)
  }
});

router.get("/edit_user", authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id;
    const rows = await getuserbyid(id)
    res.status(200).json({ username: rows[0].username, email: rows[0].email, profil_pic_url: rows[0].profil_pic_url });
  } catch (error) {
    next(error)
  }
});

router.post("/edit_user_save", authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id;
    let data = req.body;
    lengthtest(data.username, 3, 20)
    emailTest(data.email);
    const currentdata = await getuserbyid(id);
    await compare(data.password, currentdata[0].password)
    if (data.newpassword != "") {
      passwordTest(data.newpassword)
      data.newpassword = await encrypt(data.newpassword)
    }
    await updateuser(currentdata, data, id);
    res.status(200).json({ write: true, message: "Sikeres módosítás!" })
  } catch (error) {
    next(error)
  }
});

router.post("/add_deck", authenticateToken, async (req, res, next) => {
  try {
    const data = req.body
    const id = req.user.id
    lengthtest(data.deck_name, 1, 200)
    await add_deck(id, data.deck_name)
    res.status(200).json({ write: true, message: "Sikeres hozzáadás!" })
  } catch (error) {
    next(error)
  }
})

router.get("/change_share_code", authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id
    const deck_id = req.query.deck_id
    const result = await change_share_code(deck_id, id)
    affectedRowscheck(result.rows)
    res.status(200).json({ write: false, share_code: result.share_code })
  } catch (error) {
    next(error)
  }
})

router.post("/copy_deck", authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id
    const share_code = req.body.share_code
    await copy_deck(share_code, id)
    res.status(200).json({ write: true, message: "Sikeres lekérés!" })
  } catch (error) {
    next(error)
  }
})


router.get("/deck_load", authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id
    const [rows] = await getdeck(id)
    res.status(200).json({ write: false, decks: rows })
  } catch (error) {
    next(error)
  }
})

router.get("/getdeckbydeck_id", authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id
    const deck_id = req.query.deck_id
    const [rows] = await getdeckbydeck_id(deck_id, id)
    affectedRowscheck(rows)
    res.status(200).json({ write: false, decks: rows })
  } catch (error) {
    next(error)
  }
})

router.get("/getcards", authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id
    const deck_id = req.query.deck_id
    const [rows] = await getcards(deck_id, id)
    res.status(200).json({ write: false, cards: rows })
  } catch (error) {
    next(error)
  }
})

router.post("/addnewcard", authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id
    const data = req.body
    lengthtest(data.front_text, 1, 255)
    lengthtest(data.back_text, 1, 1000)
    await addnewcard(data.deck_id, data.front_text, data.back_text, id)
    res.status(200).json({ write: true, message: "Sikeres hozzáadás!" })
  } catch (error) {
    next(error)
  }
})

router.delete("/deletecard", authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id
    const card_id = req.query.card_id
    const [rows] = await deletecard(card_id, id)
    affectedRowscheck(rows)
    res.status(200).json({ write: true, message: "Sikeres törlés!" })
  } catch (error) {
    next(error)
  }
})


router.post("/updatecard", authenticateToken, async (req, res, next) => {
  try {
    const data = req.body
    const id = req.user.id
    lengthtest(data.front_text, 1, 255)
    lengthtest(data.back_text, 1, 1000)
    const [rows] = await updatecard(data.front_text, data.back_text, data.card_id, id)
    affectedRowscheck(rows)
    res.status(200).json({ write: true, message: "Sikeres frissítés!" })
  } catch (error) {
    next(error)
  }
})

router.get("/getcardbyid", authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id
    const card_id = req.query.card_id
    const [rows] = await getcardbyid(card_id, id)
    res.status(200).json({ write: false, rows: rows[0] })
  } catch (error) {
    next(error)
  }
})

router.post("/updatedeck", authenticateToken, async (req, res, next) => {
  try {
    const data = req.body
    const id = req.user.id
    lengthtest(data.deck_name, 1, 200)
    const rows = await updatedeck(data.deck_name, data.deck_id, data.public, id)
    affectedRowscheck(rows)
    res.status(200).json({ write: true, message: "Sikeres frissítés!" })
  } catch (error) {
    next(error)
  }
})

router.delete("/deletedeck", authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id
    const deck_id = req.query.deck_id
    const [rows] = await deletedeck(deck_id, id)
    affectedRowscheck(rows)
    res.status(200).json({ write: true, message: "Sikeres törlés!" })
  } catch (error) {
    next(error)
  }
})

router.post("/save_new_card_order", authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id
    const data = req.body
    for (let i = 0; i < data.currentorder.length; i++) {
      const [rows] = await save_new_card_order(data.currentorder[i], i, id)
      affectedRowscheck(rows)
    }
    res.status(200).json({ write: false })
  }
  catch (error) {
    next(error)
  }
})

router.post("/save_new_deck_order", authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id
    const data = req.body
    for (let i = 0; i < data.currentorder.length; i++) {
      const [rows] = await save_new_deck_order(data.currentorder[i], i, id)
      affectedRowscheck(rows)
    }
    res.status(200).json({ write: false })
  }
  catch (error) {
    next(error)
  }
})

router.post("/save_new_event", authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id
    const data = req.body
    timetest(data.start_time, data.end_time)
    lengthtest(data.subject, 1, 100)
    lengthtest(data.location, 0, 50)
    await save_new_event(id, data.day, data.start_time, data.end_time, data.subject, data.location, data.week_type)
    res.status(200).json({ write: true, message: "Sikeres hozzáadás!" })
  }
  catch (error) {
    next(error)
  }
})

router.get("/get_events", authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id
    const [rows] = await get_events(id)
    const [weektype_rows] = await get_saved_weektype(id)
    res.status(200).json({ write: false, events: rows, selected_week_type: weektype_rows[0].selected_week_type })
  }
  catch (error) {
    next(error)
  }
})

router.post("/change_selected_week", authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id
    const week_type = req.body.week_type
    await changeselectedweek(id, week_type)
    res.status(200).json({ write: false })
  }
  catch (error) {
    next(error)
  }
})

router.post("/updateevent", authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id
    const data = req.body
    timetest(data.start_time, data.end_time),
      lengthtest(data.subject, 1, 100)
    lengthtest(data.location, 0, 50)
    await updateevent(data.event_id, data.day, data.start_time, data.end_time, data.subject, data.location, data.week_type, id)
    res.status(200).json({ write: true, message: "Sikeres frissítés!" })
  }
  catch (error) {
    next(error)
  }
})

router.delete("/delete_event", authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id
    const event_id = req.query.event_id
    await delete_event(event_id, id)
    res.status(200).json({ write: true, message: "Sikeres törlés!" })
  }
  catch (error) {
    next(error)
  }
})

router.post("/taskadd", authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id
    const data = req.body;
    lengthtest(data.task_name, 1, 100)
    await add_task(id, data.task_name, data.task_description, data.importance);
    res.status(200).json({ write: true, message: "Feladat sikeresen hozzáadva!" });
  } catch (error) {
    next(error);
  }
});

router.get("/gettasks", authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id;
    const [rows] = await get_tasks(id);
    res.status(200).json({ write: false, tasks: rows });
  } catch (error) {
    next(error);
  }
});

router.delete("/deletetask", authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id;
    const task_id = req.query.id;
    await delete_task(task_id, id);
    res.status(200).json({ write: true, message: "Feladat törölve!" });
  } catch (error) {
    next(error);
  }
});

router.post("/updatetask", authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id;
    const data = req.body;
    lengthtest(data.task_name, 1, 100)
    await update_task(data.task_id, data.task_name, data.task_description, data.importance, id);
    res.status(200).json({ write: true, message: "Feladat frissítve!" });
  } catch (error) {
    next(error);
  }
});

router.post("/marktaskdone", authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id;
    const data = req.body;
    await mark_task_done(data.task_id, id);
    res.status(200).json({ write: true, message: "Feladat megjelölve!" });
  } catch (error) {
    next(error);
  }
});

router.post("/restoretask", authenticateToken, async (req, res, next) => {
  try {
    const data = req.body;
    const id = req.user.id;
    await restore_task(data.task_id, id);
    res.status(200).json({ write: true, message: "Feladat visszahozva!" });
  } catch (error) {
    next(error);
  }
});

router.post("/toggletaskcompletion", authenticateToken, async (req, res, next) => {
  try {
    const data = req.body;
    const id = req.user.id;
    await toggle_task_completion(data.task_id, data.is_completed, id);
    res.status(200).json({ write: true, message: "Feladat állapota frissítve!" });
  } catch (error) {
    next(error);
  }
});

router.post("/get_calendar_events", authenticateToken, async (req, res, next) => {
  try {
    const data = req.body;
    const id = req.user.id;
    const [rows] = await get_calendar_events(data.year, data.month, id);
    res.status(200).json({ write: false, events: rows });
  } catch (error) {
    next(error);
  }
});

router.post("/insert_calendar_event", authenticateToken, async (req, res, next) => {
  try {
    const data = req.body;
    const id = req.user.id;
    lengthtest(data.title, 1, 255)
    await Insert_calendar_event(data.date, data.title, id, data.description);
    res.status(200).json({ write: true, message: "Esemény hozzáadva!" });
  } catch (error) {
    next(error);
  }
});

router.post("/delete_calendar_event", authenticateToken, async (req, res, next) => {
  try {
    const data = req.body;
    const id = req.user.id;
    await delete_calendar_event(data.event_id, id);
    res.status(200).json({ write: true, message: "Esemény törölve!" });
  } catch (error) {
    next(error);
  }
});

router.get("/admin/users", authenticateToken, async (req, res, next) => {
  try {
    const [adminRows] = await adminCheck(req.user.id);
    admincheck(adminRows)
    const [rows] = await admin_get_users();
    res.status(200).json({ users: rows });
  } catch (error) { next(error); }
});

router.post("/admin/update_user", authenticateToken, async (req, res, next) => {
  try {
    const [adminRows] = await adminCheck(req.user.id);
    admincheck(adminRows)
    const { user_id, password, username, email, profil_pic_url } = req.body;
    lengthtest(username, 3, 20);
    emailTest(email);
    await admin_update_user(user_id, username, password, email, profil_pic_url);
    res.status(200).json({ write: true, message: "Sikeres mentés!" });
  } catch (error) { next(error); }
});

router.delete("/admin/delete_user/:name", authenticateToken, async (req, res, next) => {
  try {
    const [adminRows] = await adminCheck(req.user.id);
    admincheck(adminRows)
    await admin_delete_user(req.params.name);
    res.status(200).json({ write: true, message: "Törölve!" });
  } catch (error) { next(error); }
});

router.get("/admin/search_users/:name", authenticateToken, async (req, res, next) => {
    try {
        const [adminRows] = await adminCheck(req.user.id);
        admincheck(adminRows);
        const query = req.params.name || '';
        lengthtest(query, 1, 100);
        const [rows] = await admin_search_users(query);
        res.status(200).json({ users: rows });
    } catch (error) { next(error); }
});

router.get("/getQnF", authenticateToken, async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const [qnf_rows] = await getQnF(user_id);
    res.status(200).json({
      write: false,
      qnf: qnf_rows
    });
  } catch (error) { next(error); }
});

router.post("/qnfsearch", authenticateToken, async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const searchTerm = req.body.search;
    const type = req.body.type;
    if (!searchTerm || searchTerm.trim().length === 0) {
      return res.status(400).json({ write: false, results: [] });
    }
    const [results] = await QnFSearch(searchTerm, user_id,);
    res.status(200).json({ write: false, results: results });
  } catch (error) { next(error); }
});

router.post("/toggleFavorite", authenticateToken, async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { item_type, item_id } = req.body;
    
    const is_favorited = await toggleFavorite(user_id, item_type, item_id);
    res.status(200).json({is_favorited});
  } catch (error) {
    next(error);
  }
});


router.get("/hive", authenticateToken, async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const { type, search, favorites } = req.query;

        const [result] = await QnFSearch({
            userId: user_id,
            type: type === 'all' ? null : type,
            searchTerm: search || null,
            favoritesOnly: favorites === 'true'
        });

        res.status(200).json({qnf: result});
    } catch (error) {
        next(error);
    }
});

router.get("/getfavorites", authenticateToken, async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const [result] = await getUserFavorites(user_id);
    res.status(200).json({ qnf: result });
  } catch (error) {
    next(error);
  }
});

router.post("/getfavoritecount", authenticateToken, async (req, res, next) => {
  try {
    const { item_type, item_id } = req.body;
    const count = await getFavoriteCount(item_type, item_id);
    res.status(200).json({count});
  } catch (error) {
    next(error);
  }
});


router.get("/getquizzes", authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id;
    const [rows] = await getquizzes(id);
    res.status(200).json({ write: false, quizzes: rows });
  } catch (error) {
    next(error);
  }
});

router.get("/getforeignquizzes", authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id;
    const quizzes = await getforeignquizzes(id);
    res.status(200).json({ write: false, quizzes: quizzes });
  } catch (error) {
    next(error);
  }
});

router.post("/savequiz", authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id;
    const data = req.body
    lengthtest(data.title, 1, 200)
    const insertedID = await save_quiz(data.title, data.description, data.public, id, data.randomize_questions, data.total_points);
    res.status(200).json({ write: true, message: "Kvíz sikeresen mentve!", quiz_id: insertedID });
  } catch (error) {
    next(error);
  }
});

router.post("/savequestion", authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id;
    const data = req.body
    lengthtest(data.question_text, 1, 1000)
    const insertedID = await save_question(data.quiz_id, data.question_text, id, data.type, data.position, data.points);
    res.status(200).json({ write: false, question_id: insertedID });
  } catch (error) {
    next(error);
  }
});

router.post("/saveanswer", authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id;
    const data = req.body
    lengthtest(data.answer_text, 1, 1000)
    await save_answer(data.question_id, data.answer_text, data.right_answer, id, data.position, data.points);
    res.status(200).json({ write: false });
  } catch (error) {
    next(error);
  }
});

router.post("/save_current_quiz_order", authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id;
    const currentorder = req.body.currentorder
    for (let i = 0; i < currentorder.length; i++) {
      await save_current_quiz_order(currentorder[i], i, id)
    }
    res.status(200).json({ write: false });
  } catch (error) {
    next(error);
  }
});

router.post("/save_current_foreign_quiz_order", authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id;
    const currentorder = req.body.currentorder
    for (let i = 0; i < currentorder.length; i++) {
      await save_current_foreign_quiz_order(currentorder[i], i, id)
    }
    res.status(200).json({ write: false });
  } catch (error) {
    next(error);
  }
});


router.get("/getquizquestions", authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id;
    const quiz_id = req.query.quiz_id
    const questions = await loadquestions(quiz_id, id)
    res.status(200).json({ write: false, questions: questions });
  } catch (error) {
    next(error);
  }
});

router.get("/getforeignquizquestions", authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id;
    const quiz_id = req.query.quiz_id
    const questions = await loadquestions(quiz_id, id)
    res.status(200).json({ write: false, questions: questions });
  } catch (error) {
    next(error);
  }
});

router.get("/getquizmeta", authenticateToken, async (req, res, next) => {
  try {
    const quiz_id = req.query.quiz_id
    const quiz_meta = await loadquizmeta(quiz_id)
    res.status(200).json({ write: false, quiz_meta: quiz_meta });
  } catch (error) {
    next(error);
  }
});

router.get("/getquestionanswers", authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id;
    const question_id = req.query.question_id
    const answers = await loadanswers(question_id, id)
    res.status(200).json({ write: false, answers: answers });
  } catch (error) {
    next(error);
  }
});

router.get("/getquestionanswersforstart", authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id;
    const question_id = req.query.question_id
    const answers = await loadanswers_withoutright(question_id, id)
    res.status(200).json({ write: false, answers: answers });
  } catch (error) {
    next(error);
  }
});

router.delete("/deletequiz", authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id;
    const quiz_id = req.query.quiz_id
    const isForeign = req.query.isforeign === "true";
    await delete_quiz(quiz_id, id, isForeign);
    res.status(200).json({ write: false, message: "Kvíz törölve!" });
  } catch (error) {
    next(error);
  }
});

router.post("/saveForeignquiz", authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id;
    const quiz_id = req.query.quiz_id
    const result_id = req.query.result_id
    await save_foreign_quiz(result_id, quiz_id, id);
    res.status(200).json({ write: false});
  } catch (error) {
    next(error);
  }
});

router.post("/savequizresult", authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id;
    const data = req.body
    const result_id = await quiz_submit(data[0], id, data[1])
    for (let i = 2; i < data.length; i++) {
      await answer_validation(result_id, data[i], id)
    }
    await calcquizpoints(result_id, id)
    res.status(200).json({ write: true, message: "A kvíz beadva!", result_id: result_id });
  }
  catch (error) {
    next(error);
  }

});

router.get("/getquizresult", authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id;
    const quiz_id = req.query.quiz_id
    const result = await getquizresult(id, quiz_id)
    res.status(200).json({ write: false, result: result });
  }
  catch (error) {
    next(error);
  }
});

router.get("/getuseranswers", authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id;
    const result_id = req.query.result_id
    const question_id = req.query.question_id
    const user_answer = await getuseranswers(id, result_id, question_id)
    res.status(200).json({ write: false, user_answer: user_answer });
  }
  catch (error) {
    next(error);
  }
});


router.post("/generatehash", authenticateToken, async (req, res, next) => {
  try {
    const data = req.body.data
    passwordTest(data)
    const hash = await encrypt(data)
    res.status(200).json({ write: false, hash: hash });
  }
  catch (error) {
    next(error);
  }
});






module.exports = router;
