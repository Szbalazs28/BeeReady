const jwt = require("jsonwebtoken")
const JWT_SECRET = "d4a6032ff70259360a39313eb29f184462eb5ca200d264f4eb4548b7030c940c"

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    console.log("Hiányzó token")
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

async function generateToken(userId, expiresIn) {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: expiresIn });
}

module.exports = { authenticateToken, generateToken };