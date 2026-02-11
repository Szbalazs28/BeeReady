const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const errorHandler = require("./middleware/errorHandler.js");
const path = require("path")

const app = express();
const router = express.Router()
const ip = '127.0.0.1'
const port = 4000;
const rateLimit = require('express-rate-limit');
const globalLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 perces időablak
    max: 100, // Maximum 100 kérés 1 percen belül IP címenként
    message: {
        success: false,
        message: "Túl sok kérés. Kérem, várjon egy percet."
    },
    
    standardHeaders: true, 
    legacyHeaders: false,
    handler: (req, res, next) => {        
        console.warn(`[${new Date().toLocaleDateString()}] [${new Date().toLocaleTimeString()}] DDOS/Túlterhelés védelem aktiválva! Letiltott IP: ${req.ip} az útvonalon: ${req.originalUrl}`);            
        res.status(429).json({
            success: false,
            message: "Túl sok kérés. Kérem, várjon egy percet."
        });
    }
});

morgan.token('hu-date', () => {
    return new Date().toLocaleDateString();
});
morgan.token('hu-time', () => {
    return new Date().toLocaleTimeString();
});

const customFormat = '[:hu-date] [:hu-time] :method :url :status :response-time ms - IP: :remote-addr';



app.use(morgan(customFormat));



app.use(cors());
app.use(express.json());
app.use(globalLimiter);

router.get('/', (request, response) => {
  response.sendFile(path.join(__dirname, '../frontend/html/main.html'));
});

app.use('/', router);
const endpoints = require('./api/api.js');
app.use('/api', endpoints);

app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use(express.static(path.join(__dirname, '../frontend')));

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Szerver fut: http://${ip}:${port}/`);
});

app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use(express.static(path.join(__dirname, '../frontend')));

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Szerver fut: http://${ip}:${port}/`);
});

