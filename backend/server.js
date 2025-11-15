let mysql = require('mysql2');
let bcrypt = require('bcrypt')

const port = 4000
let express = require("express")
let cors = require("cors")
let app = express()
app.use(cors())
app.use(express.json());

let con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "belepesadatok"
});

let adatok = []

con.connect(function (err) {
  if (err) throw err;
  con.query("SELECT * FROM adatok", function (err, result, fields) {
    if (err) throw err;
    adatok = result
    console.log(result);

  });
});

app.get("/adatok", (req, res) => {
  res.json(adatok)
})

let saltRounds = 12

async function titkositas(password) {
  const hash = await bcrypt.hash(password, saltRounds)
  return hash
}

app.post("/regisztracio", async (req, res) => {
  let elemek = req.body
  const password = await titkositas(elemek.password)
  con.query("SELECT email FROM adatok WHERE email= ?", [elemek.email], (err, result) => {
    if (err) {
      console.error("Lekérdezési hiba:", err);
      return res.status(500).json({ message: "Adatbázis hiba." });
    }
    else {
      if (result.length > 0) {
        console.error("Ilyen email címmel már regisztráltak...")
        res.json({ message: "Ez az email már létezik" });
      }
      else {
        con.query("SELECT username FROM adatok WHERE username= ?", [elemek.username], (err, result) => {
          if (err) {
            console.error("Lekérdezési hiba:", err);
            return res.status(500).json({ message: "Adatbázis hiba." });
          }
          else {
            if (result.length > 0) {
              console.error("Ilyen felhasználónévvel már regisztráltak...")
              res.json({ message: "Ez a felhasználónév már létezik" });
            }
            else {
              con.query("INSERT INTO adatok (username, email, password) VALUES (?,?,?)", [elemek.username ,elemek.email, password])
              res.json({ message: "Sikeres regisztráció!" });
            }
          }
        })

      }
    }

  })


})

let username_jelenleg = ""

app.post("/bejelentkezes", async (req, res) => {
  let elemek = req.body
  con.query("SELECT * FROM adatok WHERE email = ?", [elemek.email], async (err, result) => {
    if (err) {
      console.error("Lekérdezési hiba:", err);
      return res.json({ message: err });
    }
    else {
      if (result.length > 0) {
        let egyezike = await bcrypt.compare(elemek.password, result[0].password)
        if (egyezike) {
          username_jelenleg = result[0].username
          res.json({success: true, redirect: "./main.html"})
        }
        else {
          res.json({success: false, message: "Hibás jelszó!" })
        }
      }
      else {
        res.json({success: false, message: "Nem található emailcím!" })
      }
    }


  })

})

app.get("/szerkesztes", async (req,res) => {
  con.query("SELECT email FROM adatok WHERE username = ?", [username_jelenleg], async (err, result) =>{
    res.json({username: username_jelenleg, email: result[0].email})
  })
})

app.use(express.static('public'));
app.listen(port, () => {
  console.log(`Szerver fut: http://localhost:${port}`);
});

