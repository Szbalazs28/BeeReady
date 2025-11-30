const jwt = require("jsonwebtoken")
const JWT_SECRET = " "

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

async function generateToken(userId, expiresIn) {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: expiresIn });
}

module.exports = { authenticateToken, generateToken };