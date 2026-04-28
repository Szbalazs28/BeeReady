const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "d4a6032ff70259360a39313eb29f184462eb5ca200d264f4eb4548b7030c940c";

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  tokenexists(token);

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

function tokenexists(token) {
  if (token == null) {
    const err = new Error("Hozzáférés megtagadva!");
    err.status = 401;
    throw err;
  }
}

async function get_time_left(token) {
  try {
    tokenexists(token);
    const decode = jwt.verify(token, JWT_SECRET);
    const currentTime = Math.floor(Date.now() / 1000);
    const timeLeft = decode.exp - currentTime;
    return timeLeft;
  }
  catch (err) {
    throw err;
  }
}

module.exports = { authenticateToken, generateToken, get_time_left };