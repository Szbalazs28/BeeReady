const mysql = require('mysql2');
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")

const port = 4000
const express = require("express")
const cors = require("cors")
const app = express()
app.use(cors())
app.use(express.json());

const JWT_SECRET = "3a857cf5a4e2c248e0b8b90e5dbe5bd05d6229a96bc3124441ee179dbef9e64968cae372f03649e8ab04a730272d917a0f912545061b53092e4cccfda79be117"

let con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "BeeReady_db"
});
//Ezt ki kell majd törölni! 
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
//IDÁIG 
async function titkositas(password) {
  const saltRounds = 12
  const hash = await bcrypt.hash(password, saltRounds)
  return hash
}

function nagybetuellenorzes(password) {
  // Regex: /(.*[A-Z].*)/
  // Jelentése: Bármilyen karakter (.*), amelyet követ legalább egy nagybetű ([A-Z]), 
  // amelyet ismét bármilyen karakter (.*) követ.
  return /[A-Z]/.test(password);
}
function specialiskarakterellenorzes(password) {
  // Regex: /[!@#$%^&*(),.?":{}|<>]|/
  // A Regex a leggyakoribb speciális karaktereket keresi.
  // Figyelem: Mely karaktereket tartod speciálisnak, az függ a biztonsági követelményeidtől.
  return /[!@#$%^&*(),.?":{}|<>_-]/.test(password);
}

function szamjegyellenorzes(password) {
  // Regex: /\d/
  // A \d (digit) a 0-9 tartományban lévő bármely számjegyet jelöli.
  return /\d/.test(password);
}

app.post("/regisztracio", async (req, res) => {
  console.log(`[${new Date().toLocaleTimeString()}] /regisztracio request`)
  let elemek = req.body
  const password = await titkositas(elemek.password)
  con.query("SELECT email, username FROM adatok WHERE email= ? or username=?", [elemek.email, elemek.username], (err, result) => {
    if (err) {
      console.error("Lekérdezési hiba:", err);
      return res.status(500).json({ message: "Adatbázis hiba." });
    }
    else {
      let hibak = {}
      if (result.length == 0) {
        if (elemek.password.length < 6) {
          hibak["hossz"] = "Legalább 6 karakternek kell lennie!"

        }
        if (!nagybetuellenorzes(elemek.password)) {
          hibak["nagybetu"] = "Kell tartalmaznia nagybetűt!"

        }
        if (!specialiskarakterellenorzes(elemek.password)) {
          hibak["specialis"] = "Kell tartalmaznia legalább egy speciális karaktert!"

        }
        if (!szamjegyellenorzes(elemek.password)) {
          hibak["szam"] = "Kell tartalmaznia legalább egy számot!"
        }
        if (Object.keys(hibak).length == 0) {
          con.query("INSERT INTO adatok (username, email, password, profil_pic_url) VALUES (?,?,?,?)", [elemek.username, elemek.email, password, elemek.profil_pic_url])
          res.status(201).json({ success: true, message: "Sikeres regisztráció!" })

        }
        else {
          res.json({ success: false, hibak }) // Visszaküldi a hibákat 
        }
      }
      else {
        res.status(409).json({ success: false, message: "Ilyen E-mail cím vagy Felhasználónév már létezik!" })
      }
    }
  })
})



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
          const expiresInTime = '1h'
          if (elemek.stay) {
            expiresInTime = '7d'
          }
          const token = jwt.sign({ id: result[0].id }, JWT_SECRET, { expiresIn: expiresInTime });
          res.json({ success: true, token, redirect: "./main.html" })
        }
        else {
          res.json({ success: false, message: "Hibás jelszó!" })
        }
      }
      else {
        res.json({ success: false, message: "Nem található emailcím!" })
      }
    }


  })

})


function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ message: "Hozzáférés megtagadva. Kérjük, jelentkezzen be!" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "A munkamenet lejárt. Jelentkezzen be újra." });
    }
    else {
      req.user = user;
      next();
    }

  });
}


app.get("/szerkesztes", authenticateToken, (req, res) => {
  const id = req.user.id;
  con.query("SELECT username, email, profil_pic_url FROM adatok WHERE id = ?", [id], (err, result) => {
    if (err) {
      res.status(500).json({ message: "Adatbázis hiba." });
    }
    else {
      res.status(200).json({ username: result[0].username, email: result[0].email, profil_pic_url: result[0].profil_pic_url });
    }

  });


});

app.put("szerkesztes_mentes", authenticateToken, (req, res) => {
  const email = req.user.email;
  const ujadatok = req.body
  let egyezike = false;
  con.query("SELECT password FROM adatok WHERE email = ?", [email], async (err, result) => {
    if (await bcrypt.compare(ujadatok.password, result[0].password)) {
      egyezike = true;
    }
  })
  if (egyezike) {
    con.query("SELECT email, username FROM adatok WHERE email= ? or username=?", [elemek.email, elemek.username], (err, result) => {
      if (err) {
        console.error("Lekérdezési hiba:", err);
        return res.status(500).json({ message: "Adatbázis hiba." });
      }
      else {
        let hibak = {}
        if (result.length == 0) {
          if (elemek.password.length < 6) {
            hibak["hossz"] = "Legalább 6 karakternek kell lennie!"

          }
          if (!nagybetuellenorzes(elemek.password)) {
            hibak["nagybetu"] = "Kell tartalmaznia nagybetűt!"

          }
          if (!specialiskarakterellenorzes(elemek.password)) {
            hibak["specialis"] = "Kell tartalmaznia legalább egy speciális karaktert!"

          }
          if (!szamjegyellenorzes(elemek.password)) {
            hibak["szam"] = "Kell tartalmaznia legalább egy számot!"
          }
          if (Object.keys(hibak).length == 0) {
            con.query("INSERT INTO adatok (username, email, password, profil_pic_url) VALUES (?,?,?,?)", [elemek.username, elemek.email, password, elemek.profil_pic_url])
            res.status(201).json({ success: true, message: "Sikeres regisztráció!" })

          }
          else {
            res.json({ success: false, hibak }) // Visszaküldi a hibákat 
          }
        }
        else {
          res.status(409).json({ success: false, message: "Ilyen E-mail cím vagy Felhasználónév már létezik!" })
        }
      }
    })
  }
  else {
    res.status(401).json({ message: "Hibás jelszó!" });
  }



  con.query("UPDATE adatok SET email=?, username=?, profil_pic_url=? WHERE email=?", [ujadatok.email, ujadatok.username, ujadatok.newprofil_pic_url, email], (err, result) => {
    if (err) {
      res.status(500).json({ message: "Adatbázis hiba." });
    }
    else {
      res.status(200).json({ message: "Sikeres mentés!" });
    }
  })

})

app.use(express.static('public'));
app.listen(port, () => {
  console.log(`Szerver fut: http://localhost:${port}`);
});

