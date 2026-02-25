const express = require("express");
const rateLimit = require('express-rate-limit');
const router = express.Router();


const { authenticateToken, generateToken } = require("../middleware/jsonwebtoken.js");
const { passwordTest, titkositas, compare, usernameTest, emailTest, lengthtest } = require("../data_test.js");
const { add_task, get_tasks, delete_task, update_task, mark_task_done, toggle_task_completion, restore_task, userexists, newuser, userbyemail, userbyid, updateuser, add_deck, getdeck, getdeckbydeck_id, getcards, addnewcard, deletecard, getcardbyid, updatecard, updatedeck, deletedeck, save_new_card_order, save_new_deck_order, save_new_event, get_events, changeselectedweek, get_saved_weektype, updateevent, delete_event, get_calendar_events, Insert_calendar_event } = require("../sql/querys.js");

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
  let data = req.body;
  const usernameissues = usernameTest(data.username);
  const emailissues = emailTest(data.email);
  if (Object.keys(usernameissues).length != 0) {
    res.status(403).json({ success: false, issues: usernameissues });
  } else {
    if (Object.keys(emailissues).length != 0) {
      res.status(403).json({ success: false, issues: emailissues });
    } else {
      try {
        const [rows] = await userexists(data.email, data.username);
        if (rows.length == 0) {
          let issues = passwordTest(data.password);
          if (Object.keys(issues).length == 1) {
            const password = await titkositas(data.password);
            const [user] = await newuser(data.username, data.email, password, data.profil_pic_url);
            const token = await generateToken(user[0].id, "1h");
            res.status(200).json({ success: true, token, redirect: "./main.html" });
          } else {
            res.status(409).json({ success: false, issues }); // Visszaküldi a hibákat
          }
        } else {
          res.status(409).json({ success: false, message: "Ilyen E-mail cím vagy Felhasználónév már létezik!" });
        }
      } catch (error) {
        next(error);
      }
    }
  }
})

router.post("/login", loginLimiter, async (req, res, next) => {
  const data = req.body;
  try {
    const [rows] = await userbyemail(data.email);
    if (rows.length > 0) {
      const compare_result = await compare(data.password, rows[0].password);
      if (compare_result) {
        let expiresInTime = "1h";
        if (data.stay) {
          expiresInTime = "7d";
        }
        const token = await generateToken(rows[0].id, expiresInTime);
        res.status(200).json({ success: true, token, redirect: "./main.html" });
      } else {
        res.status(409).json({ success: false, message: "Hibás jelszó!" });
      }
    } else {
      res.status(409).json({ success: false, message: "Nem található emailcím!" });
    }
  } catch (error) {
    next(error)
  }
});

router.get("/edit_user", authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id;
    const [rows] = await userbyid(id);
    if (rows.length == 0) {
      res.status(404).json({ message: "Felhasználó nem található." });
    } else {
      res.status(200).json({ username: rows[0].username, email: rows[0].email, profil_pic_url: rows[0].profil_pic_url, });
    }
  } catch (error) {
    next(error)
  }
});

router.post("/edit_user_mentes", authenticateToken, async (req, res, next) => {
  const id = req.user.id;
  const adatok = req.body;
  const usernameissues = usernameTest(adatok.username);
  const emailissues = emailTest(adatok.email);
  if (Object.keys(usernameissues).length != 0) {
    res.status(403).json({ success: false, issues: usernameissues });
  } else {
    if (Object.keys(emailissues).length != 0) {
      res.status(403).json({ success: false, issues: emailissues });
    } else {
      try {
        const [rows] = await userbyid(id);
        if (await compare(adatok.password, rows[0].password)) {
          if (adatok.newpassword != "") {
            let issues = passwordTest(adatok.newpassword);
            if (Object.keys(issues).length == 1) {
              const newpassword = await titkositas(adatok.newpassword);
              adatok.newpassword = newpassword;
              await updateuser(rows, adatok, id);
              res.status(200).json({ success: true, message: "Sikeres mentés!" });
            } else {
              res.status(403).json({ success: false, issues });
            }
          } else {
            await updateuser(rows, adatok, id);
            res.status(200).json({ success: true, message: "Sikeres mentés!" });
          }
        } else {
          console.log(`[${new Date().toLocaleDateString()}] [${new Date().toLocaleTimeString()}] Hibás jelszó! - IP: ${req.socket.remoteAddress}`);
          res.status(403).json({ success: false, message: "Hibás jelszó!" });
        }
      } catch (error) {
        next(error);
      }
    }
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
    lengthtest(data.start_time, 5, 5)
    lengthtest(data.end_time, 5, 5)
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

// switched to POST so that year/month can be sent in the request body
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
    await Insert_calendar_event(data.date, data.title, req.user.id);
    res.status(200).json({ write: true, message: "Esemény hozzáadva!" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
