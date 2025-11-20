const mysql = require('mysql2');
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")

const port = 4000
const express = require("express")
const cors = require("cors")
const app = express()
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
  return /[!@#$%^&*(),.?":{}|<>]/.test(password); 
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
      if(result.length == 0){
        if(elemek.password.length<6){
          hibak["hossz"] = "Legalább 6 karakternek kell lennie!" 
          
        }
        if(!nagybetuellenorzes(elemek.password)){
          hibak["nagybetu"] = "Kell tartalmazzon nagybetűt!"
          
        }
        if(!specialiskarakterellenorzes(elemek.password)){
          hibak["specialis"] ="Kell tartalmazzon legalább egy speciális karaktert!"
          
        }
        if(Object.keys(hibak).length==0){
          con.query("INSERT INTO adatok (username, email, password, profil_pic_url) VALUES (?,?,?,?)", [elemek.username ,elemek.email, password, elemek.profil_pic_url])
          res.status(201).json({success: true, redirect: "./main.html"})
          
        }
        else{
          res.json({success: false, hibak}) // Visszaküldi a hibákat 
        }      
      }
      else{
        res.status(409).json({success: false, message: "Ilyen E-mail cím vagy Felhasználónév már létezik!"})
      }
      

      // if (result.length > 0) {
      //   console.error("Ilyen email címmel már regisztráltak...")
      //   res.json({ message: "Ez az email már létezik" });
      // }
      // else {
      //   con.query("SELECT username FROM adatok WHERE username= ?", [elemek.username], (err, result) => {
      //     if (err) {
      //       console.error("Lekérdezési hiba:", err);
      //       return res.status(500).json({ message: "Adatbázis hiba." });
      //     }
      //     else {
      //       if (result.length > 0) {
      //         console.error("Ilyen felhasználónévvel már regisztráltak...")
      //         res.json({ message: "Ez a felhasználónév már létezik" });
      //       }
      //       else {
      //         con.query("INSERT INTO adatok (username, email, password) VALUES (?,?,?)", [elemek.username ,elemek.email, password])
      //         res.json({ message: "Sikeres regisztráció!" });
      //       }
      //     }
      //   })

      //}
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

