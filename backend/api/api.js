const express = require("express");
const router = express.Router();


const { authenticateToken, generateToken } = require("../middleware/jsonwebtoken.js");
const { passwordTest, titkositas, compare, usernameTest, emailTest } = require("../data_test.js");
const { userexists, newuser, userbyemail, userbyid, updateuser, add_deck, getdeck, getdeckbydeck_id } = require("../sql/querys.js");

router.post("/regisztracio", async (req, res) => {
  console.log(`[${new Date().toLocaleDateString()}] [${new Date().toLocaleTimeString()}] /regisztracio request - IP: ${req.socket.remoteAddress}`);
  let data = req.body;
  const usernamehibak = usernameTest(data.username);
  const emailhibak = emailTest(data.email);
  if (Object.keys(usernamehibak).length != 0) {
    res.status(403).json({ success: false, hibak: usernamehibak });
  } else {
    if (Object.keys(emailhibak).length != 0) {
      res.status(403).json({ success: false, hibak: emailhibak });
    } else {
      try {
        const [rows] = await userexists(data.email, data.username);
        if (rows.length == 0) {
          let hibak = passwordTest(data.password);
          if (Object.keys(hibak).length == 1) {
            const password = await titkositas(data.password);
            const [user] = await newuser(data.username, data.email, password, data.profil_pic_url);
            const token = await generateToken(user[0].id, "1h");
            res.status(200).json({ success: true, token, redirect: "./main.html" });
          } else {
            res.status(409).json({ success: false, hibak }); // Visszaküldi a hibákat
          }
        } else {
          res.status(409).json({ success: false, message: "Ilyen E-mail cím vagy Felhasználónév már létezik!" });
        }
      } catch (error) {
        console.error("Hiba a regisztráció során:", error);
        res.status(500).json({ message: "Adatbázis hiba." });
      }
    }
  }
});

router.post("/bejelentkezes", async (req, res) => {
  console.log(`[${new Date().toLocaleDateString()}] [${new Date().toLocaleTimeString()}] /bejelentkezes request - IP: ${req.socket.remoteAddress}`);
  const data = req.body;
  try {
    const [rows] = await userbyemail(data.email);
    if (rows.length > 0) {
      const egyezike = await compare(data.password, rows[0].password);
      if (egyezike) {
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
      res
        .status(409)
        .json({ success: false, message: "Nem található emailcím!" });
    }
  } catch (error) {
    console.error("Hiba a bejelentkezés során:", error);
    res.status(500).json({ message: "Adatbázis hiba." });
  }
});

router.get("/szerkesztes", authenticateToken, async (req, res) => {
  console.log(
    `[${new Date().toLocaleDateString()}] [${new Date().toLocaleTimeString()}] /szerkesztes request - IP: ${req.socket.remoteAddress}`
  );
  const id = req.user.id;
  try {
    const [rows] = await userbyid(id);
    if (rows.length == 0) {
      res.status(404).json({ message: "Felhasználó nem található." });
    } else {
      res.status(200).json({username: rows[0].username,email: rows[0].email,profil_pic_url: rows[0].profil_pic_url,});
    }
  } catch (error) {
    console.error("Hiba a szerkesztés során:", error);
    res.status(500).json({ message: "Adatbázis hiba." });
  }
});

router.post("/szerkesztes_mentes", authenticateToken, async (req, res) => {
  console.log(`[${new Date().toLocaleDateString()}] [${new Date().toLocaleTimeString()}] /szerkesztes_mentes request - IP: ${req.socket.remoteAddress}`);
  const id = req.user.id;
  const adatok = req.body;
  const usernamehibak = usernameTest(adatok.username);
  const emailhibak = emailTest(adatok.email);
  if (Object.keys(usernamehibak).length != 0) {
    res.status(403).json({ success: false, hibak: usernamehibak });
  } else {
    if (Object.keys(emailhibak).length != 0) {
      res.status(403).json({ success: false, hibak: emailhibak });
    } else {
      try {
        const [rows] = await userbyid(id);
        if (await compare(adatok.password, rows[0].password)) {
          if (adatok.newpassword != "") {
            let hibak = passwordTest(adatok.newpassword);
            if (Object.keys(hibak).length == 1) {
              const newpassword = await titkositas(adatok.newpassword);
              adatok.newpassword = newpassword;
              await updateuser(rows, adatok, id);
              res.status(200).json({ success: true, message: "Sikeres mentés!" });
            } else {
              res.status(403).json({ success: false, hibak });
            }
          } else {
            await updateuser(rows, adatok, id);
            res.status(200).json({ success: true, message: "Sikeres mentés!" });
          }
        } else {
          console.log("Hibás jelszó!");
          res.status(403).json({ success: false, message: "Hibás jelszó!" });
        }
      } catch (error) {
        console.error(`[${new Date().toLocaleDateString()}] [${new Date().toLocaleTimeString()}] Hiba a szerkesztés mentése során: `, error);
        res.status(500).json({ success: false, message: error.message });
      }
    }
  }
});

router.post("/add_deck", authenticateToken, async (req, res) => {
  console.log(`[${new Date().toLocaleDateString()}] [${new Date().toLocaleTimeString()}] /add_deck request - IP: ${req.socket.remoteAddress}`);
  const adatok = req.body
  const id = req.user.id
  try {
    if (adatok.deck_name.length > 200 || adatok.deck_name == "") {
      res.status(409).json({ success: false, message: "Minimum 1 és maximum 200 karakter lehet !" })
    }
    else {
      await add_deck(id, adatok.deck_name)
      res.status(200).json({ success: true, message: "Sikeres hozzáadás!" })
    }

  } catch (error) {
    console.error(`[${new Date().toLocaleDateString()}] [${new Date().toLocaleTimeString()}] Hiba a pakli hozzáadása során: `, error);
    res.status(500).json({ success: false, message: error.message });
  }
})

router.post("/deck_load", authenticateToken, async (req, res) => {
  const id = req.user.id
  try {
    const [rows] = await getdeck(id)
    res.status(200).json({ success: true, decks: rows })
  } catch (error) {
    console.error(`[${new Date().toLocaleDateString()}] [${new Date().toLocaleTimeString()}] Hiba a pakli hozzáadása során: `, error);
    res.status(500).json({ success: false, message: error.message });
  }
})

router.post("/deck_edit", authenticateToken, async (req, res) => {
  const id = req.user.id
  const deck_id = req.body.deck_id
  try {
    const [rows] = await getdeckbydeck_id(deck_id)
    res.status(200).json({ success: true, decks: rows })
  } catch (error) {
    console.error(`[${new Date().toLocaleDateString()}] [${new Date().toLocaleTimeString()}] Hiba a pakli hozzáadása során: `, error);
    res.status(500).json({ success: false, message: error.message });
  }
})

module.exports = router;
