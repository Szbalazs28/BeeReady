const express = require("express");
const rateLimit = require('express-rate-limit');
const router = express.Router();


const { authenticateToken, generateToken } = require("../middleware/jsonwebtoken.js");
const { getuserbyemail, passwordTest, encrypt, compare, emailTest, lengthtest, checkuserexists, getuserbyid, timetest } = require("../data_test.js");
const {calcquizpoints, delete_quiz, loadquestions, loadanswers, save_current_quiz_order, save_answer, save_question, save_quiz, getquizzes, getQnF, Insert_calendar_event, delete_calendar_event, get_calendar_events, adminCheck, admin_get_users, admin_update_user, admin_delete_user, add_task, get_tasks, delete_task, update_task, mark_task_done, newuser, updateuser, add_deck, getdeck, getdeckbydeck_id, getcards, addnewcard, deletecard, getcardbyid, updatecard, updatedeck, deletedeck, save_new_card_order, save_new_deck_order, save_new_event, get_events, changeselectedweek, get_saved_weektype, updateevent, delete_event, change_share_code, copy_deck } = require("../sql/querys.js");

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


router.post("/registration", async (req, res, next) => {
  try {
    const data = req.body
    lengthtest(data.username, 3, 20)
    emailTest(data.email)
    passwordTest(data.password)
    await checkuserexists(data.email, data.username)
    const password = await encrypt(data.password)
    const [user] = await newuser(data.username, data.email, password, data.profil_pic_url)
    const token = await generateToken(user[0].id, "1h")
    res.status(200).json({ token, redirect: "./main.html" })
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
    let expiresInTime = "1h";
    if (data.stay) {
      expiresInTime = "7d";
    }
    const token = await generateToken(rows[0].id, expiresInTime);
    res.status(200).json({ token, redirect: isAdmin ? "./admin.html" : "./main.html" })
  } catch (error) {
    next(error);
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
    const adatok = req.body
    const id = req.user.id
    lengthtest(adatok.deck_name, 1, 200)
    await add_deck(id, adatok.deck_name)
    res.status(200).json({ write: true, message: "Sikeres hozzáadás!" })
  } catch (error) {
    next(error)
  }
})

router.post("/change_share_code", authenticateToken, async (req, res, next) => {
  try {
    const id = req.body.deck_id
    const new_share_code = await change_share_code(id)
    res.status(200).json({ write: false, share_code: new_share_code })
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


router.post("/deck_load", authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id
    const [rows] = await getdeck(id)
    res.status(200).json({ write: false, decks: rows })
  } catch (error) {
    next(error)
  }
})

router.post("/getdeckbydeck_id", authenticateToken, async (req, res, next) => {
  try {
    const deck_id = req.body.deck_id
    const [rows] = await getdeckbydeck_id(deck_id)
    res.status(200).json({ write: false, decks: rows })
  } catch (error) {
    next(error)
  }
})

router.post("/getcards", authenticateToken, async (req, res, next) => {
  try {
    const deck_id = req.body.deck_id
    const [rows] = await getcards(deck_id)
    res.status(200).json({ write: false, cards: rows })
  } catch (error) {
    next(error)
  }
})

router.post("/addnewcard", authenticateToken, async (req, res, next) => {
  try {
    const adatok = req.body
    lengthtest(adatok.front_text, 1, 255)
    lengthtest(adatok.back_text, 1, 1000)
    await addnewcard(adatok.deck_id, adatok.front_text, adatok.back_text)
    res.status(200).json({ write: true, message: "Sikeres hozzáadás!" })
  } catch (error) {
    next(error)
  }
})

router.post("/deletecard", authenticateToken, async (req, res, next) => {
  try {
    const card_id = req.body.card_id
    await deletecard(card_id)
    res.status(200).json({ write: true, message: "Sikeres törlés!" })
  } catch (error) {
    next(error)
  }
})


router.post("/updatecard", authenticateToken, async (req, res, next) => {
  try {
    const adatok = req.body
    lengthtest(adatok.front_text, 1, 255)
    lengthtest(adatok.back_text, 1, 1000)
    await updatecard(adatok.front_text, adatok.back_text, adatok.card_id)
    res.status(200).json({ write: true, message: "Sikeres frissítés!" })
  } catch (error) {
    next(error)
  }
})

router.post("/getcardbyid", authenticateToken, async (req, res, next) => {
  try {
    const card_id = req.body.card_id
    const [rows] = await getcardbyid(card_id)
    res.status(200).json({ write: false, rows: rows[0] })
  } catch (error) {
    next(error)
  }
})

router.post("/updatedeck", authenticateToken, async (req, res, next) => {
  try {
    const data = req.body
    lengthtest(data.deck_name, 1, 200)
    await updatedeck(data.deck_name, data.deck_id)
    res.status(200).json({ write: true, message: "Sikeres frissítés!" })
  } catch (error) {
    next(error)
  }
})

router.post("/deletedeck", authenticateToken, async (req, res, next) => {
  try {
    const deck_id = req.body.deck_id
    await deletedeck(deck_id)
    res.status(200).json({ write: true, message: "Sikeres törlés!" })
  } catch (error) {
    next(error)
  }
})

router.post("/save_new_card_order", authenticateToken, async (req, res, next) => {
  try {
    const data = req.body
    for (let i = 0; i < data.currentorder.length; i++) {
      await save_new_card_order(data.currentorder[i], i)
    }
    res.status(200).json({ write: false })
  }
  catch (error) {
    next(error)
  }
})

router.post("/save_new_deck_order", authenticateToken, async (req, res, next) => {
  try {
    const data = req.body
    for (let i = 0; i < data.currentorder.length; i++) {
      await save_new_deck_order(data.currentorder[i], i)
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
    lengthtest(data.start_time, 5, 5)
    lengthtest(data.end_time, 5, 5)
    lengthtest(data.subject, 1, 100)
    lengthtest(data.location, 1, 50)
    await save_new_event(id, data.day, data.start_time, data.end_time, data.subject, data.location, data.week_type)
    res.status(200).json({ write: true, message: "Sikeres hozzáadás!" })
  }
  catch (error) {
    next(error)
  }
})

router.post("/get_events", authenticateToken, async (req, res, next) => {
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
    const data = req.body
    timetest(data.start_time),
      timetest(data.end_time),
      lengthtest(data.subject, 1, 100)
    lengthtest(data.location, 1, 50)
    await updateevent(data.event_id, data.day, data.start_time, data.end_time, data.subject, data.location, data.week_type)
    res.status(200).json({ write: true, message: "Sikeres frissítés!" })
  }
  catch (error) {
    next(error)
  }
})

router.post("/delete_event", authenticateToken, async (req, res, next) => {
  try {
    const data = req.body
    await delete_event(data.event_id)
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
    const [rows] = await get_tasks(req.user.id);
    res.status(200).json({ write: false, tasks: rows });
  } catch (error) {
    next(error);
  }
});

router.post("/deletetask", authenticateToken, async (req, res, next) => {
  try {
    const data = req.body;
    await delete_task(data.task_id);
    res.status(200).json({ write: true, message: "Feladat törölve!" });
  } catch (error) {
    next(error);
  }
});

router.post("/updatetask", authenticateToken, async (req, res, next) => {
  try {
    const data = req.body;
    lengthtest(data.task_name, 1, 100)
    await update_task(data.task_id, data.task_name, data.task_description, data.importance);
    res.status(200).json({ write: true, message: "Feladat frissítve!" });
  } catch (error) {
    next(error);
  }
});

router.post("/marktaskdone", authenticateToken, async (req, res, next) => {
  try {
    const data = req.body;
    await mark_task_done(data.task_id);
    res.status(200).json({ write: true, message: "Feladat megjelölve!" });
  } catch (error) {
    next(error);
  }
});

router.post("/restoretask", authenticateToken, async (req, res, next) => {
  try {
    const data = req.body;
    await restore_task(data.task_id);
    res.status(200).json({ write: true, message: "Feladat visszahozva!" });
  } catch (error) {
    next(error);
  }
});

router.post("/toggletaskcompletion", authenticateToken, async (req, res, next) => {
  try {
    const data = req.body;
    await toggle_task_completion(data.task_id, data.is_completed);
    res.status(200).json({ write: true, message: "Feladat állapota frissítve!" });
  } catch (error) {
    next(error);
  }
});

router.post("/get_calendar_events", authenticateToken, async (req, res, next) => {
  try {
    const data = req.body;
    const [rows] = await get_calendar_events(data.year, data.month, req.user.id);
    res.status(200).json({ write: false, events: rows });
  } catch (error) {
    next(error);
  }
});

router.post("/insert_calendar_event", authenticateToken, async (req, res, next) => {
  try {
    const data = req.body;
    lengthtest(data.title, 1, 255)
    await Insert_calendar_event(data.date, data.title, req.user.id, data.description);
    res.status(200).json({ write: true, message: "Esemény hozzáadva!" });
  } catch (error) {
    next(error);
  }
});

router.post("/delete_calendar_event", authenticateToken, async (req, res, next) => {
  try {
    const data = req.body;
    await delete_calendar_event(data.event_id, req.user.id);
    res.status(200).json({ write: true, message: "Esemény törölve!" });
  } catch (error) {
    next(error);
  }
});

router.get("/admin/users", authenticateToken, async (req, res, next) => {
  try {
    const [adminRows] = await adminCheck(req.user.id);
    if (!adminRows.length) return res.status(403).json({ message: "Nincs jogosultságod!" });

    const [rows] = await admin_get_users();
    res.status(200).json({ users: rows });
  } catch (error) { next(error); }
});

router.post("/admin/update_user", authenticateToken, async (req, res, next) => {
  try {
    const [adminRows] = await adminCheck(req.user.id);
    if (!adminRows.length) return res.status(403).json({ message: "Nincs jogosultságod!" });

    const { user_id, username, email, profil_pic_url } = req.body;
    await admin_update_user(user_id, username, email, profil_pic_url);
    res.status(200).json({ write: true, message: "Sikeres mentés!" });
  } catch (error) { next(error); }
});

router.post("/admin/delete_user", authenticateToken, async (req, res, next) => {
  try {
    const [adminRows] = await adminCheck(req.user.id);
    if (!adminRows.length) return res.status(403).json({ message: "Nincs jogosultságod!" });

    await admin_delete_user(req.body.user_id);
    res.status(200).json({ write: true, message: "Törölve!" });
  } catch (error) { next(error); }
});


router.get("/getQnF", authenticateToken, async (req, res, next) => {
  try {
    const [qnf_rows] = await getQnF();
    res.status(200).json({
      write: false,
      qnf: qnf_rows
    });
  } catch (error) { next(error); }
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

router.post("/savequiz", authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id;
    const data = req.body
    lengthtest(data.title, 1, 200)
    const insertedID = await save_quiz(data.title, data.description, data.public, id, data.randomize_questions, data.total_points);
    res.status(200).json({ write: false, quiz_id: insertedID });
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
    await save_answer(data.question_id, data.answer_text, data.right_answer, id, data.position);
    res.status(200).json({ write: true, message: "Sikeres mentés!" });
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

router.delete("/deletequiz", authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id;
    const quiz_id = req.query.quiz_id
    await delete_quiz(quiz_id, id);
    res.status(200).json({ write: true, message: "Kvíz törölve!" });
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
    res.status(200).json({ write: true, message: "A kvíz beadva!" });
  }
  catch (error) {
    next(error);
  }
});

module.exports = router;