const express = require("express");
const rateLimit = require('express-rate-limit');
const router = express.Router();


const { authenticateToken, generateToken } = require("../middleware/jsonwebtoken.js");
const { getuserbyemail, passwordTest, encrypt, compare, emailTest, lengthtest, checkuserexists, getuserbyid } = require("../data_test.js");
const { newuser, updateuser, add_deck, getdeck, getdeckbydeck_id, getcards, addnewcard, deletecard, getcardbyid, updatecard, updatedeck, deletedeck, save_new_card_order, save_new_deck_order, save_new_event, get_events, changeselectedweek, get_saved_weektype, updateevent, delete_event, change_share_code, copy_deck } = require("../sql/querys.js");

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
    checkuserexists(data.email, data.username)
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
    compare(data.password, rows.password)
    let expiresInTime = "1h";
    if (data.stay) {
      expiresInTime = "7d";
    }
    const token = await generateToken(rows[0].id, expiresInTime);
    res.status(200).json({ token, redirect: "./main.html" })
  } catch (error) {
    next(error)
  }
});

router.get("/edit_user", authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id;
    const rows = await getuserbyid(id)
    res.status(200).json({ username: rows[0].username, email: rows[0].email, profil_pic_url: rows[0].profil_pic_url, });
  } catch (error) {
    next(error)
  }
});

router.post("/edit_user_mentes", authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id;
    let data = req.body;
    lengthtest(data.username, 3, 20)
    emailTest(data.email);
    const currentdata = await getuserbyid(id);
    compare(data.password, currentdata[0].password)
    if (data.newpassword != "") {
      passwordTest(data.newpassword)
      data.newpassword = await encrypt(data.newpassword)
    }
    await updateuser(currentdata, data, id);
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



module.exports = router;
