const port = 4000;
const express = require("express");
const cors = require("cors");
const app = express();

const {authenticateToken,generateToken} = require("./middleware/jsonwebtoken.js");
const {passwordTest,titkositas,compare,usernameTest,emailTest} = require("./data_test.js");
const {userexists,newuser,userbyemail,userbyid,updateuser} = require("./sql/querys.js");

app.use(cors());
app.use(express.json());

app.post("/regisztracio", async (req, res) => {
  console.log(`[${new Date().toLocaleTimeString()}] /regisztracio request`);
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
            const [user] = await newuser(
              data.username,
              data.email,
              password,
              data.profil_pic_url
            );
            const token = await generateToken(user[0].id, "1h");
            res.status(200).json({ success: true, token, redirect: "./main.html" });
          } else {
            res.status(409).json({ success: false, hibak }); // Visszaküldi a hibákat
          }
        } else {
          res.status(409).json({
            success: false,
            message: "Ilyen E-mail cím vagy Felhasználónév már létezik!",
          });
        }
      } catch (error) {
        console.error("Hiba a regisztráció során:", error);
        res.status(500).json({ message: "Adatbázis hiba." });
      }
    }
  }
});

app.post("/bejelentkezes", async (req, res) => {
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
      res.status(409).json({ success: false, message: "Nem található emailcím!" });
    }
  } catch (error) {
    console.error("Hiba a bejelentkezés során:", error);
    res.status(500).json({ message: "Adatbázis hiba." });
  }
});

app.get("/szerkesztes", authenticateToken, async (req, res) => {
  const id = req.user.id;
  try {
    const [rows] = await userbyid(id);
    if (rows.length == 0) {
      res.status(404).json({ message: "Felhasználó nem található." });
    } else {
      res.status(200).json({
        username: rows[0].username,
        email: rows[0].email,
        profil_pic_url: rows[0].profil_pic_url,
      });
    }
  } catch (error) {
    console.error("Hiba a szerkesztés során:", error);
    res.status(500).json({ message: "Adatbázis hiba." });
  }
});

app.post("/szerkesztes_mentes", authenticateToken, async (req, res) => {
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
        console.error(
          `[${new Date().toLocaleTimeString()}] Hiba a szerkesztés mentése során: `,
          error
        );
        res.status(500).json({ success: false, message: error.message });
      }
    }
  }
});

app.use(express.static("public"));
app.listen(port, () => {
  console.log(`Szerver fut: http://localhost:${port}`);
});
