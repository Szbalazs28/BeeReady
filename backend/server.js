require('dotenv').config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const errorHandler = require("./middleware/errorHandler.js");
const path = require("path");
const fs = require("fs");


const app = express();
const router = express.Router();
const ip = process.env.SERVER_IP || '127.0.0.1';
const port = process.env.SERVER_PORT || 4000;
const rateLimit = require('express-rate-limit');
const globalLimiter = rateLimit({
    windowMs: process.env.RATE_LIMIT_WINDOW || 60 * 1000, // 1 perces időablak
    max: process.env.RATE_LIMIT_MAX || 300, // Maximum 300 kérés 1 percen belül IP címenként
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

//const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
//app.use(morgan(customFormat, { stream: accessLogStream }));
app.use(morgan(customFormat));


app.use(cors());
app.use(express.json());
app.use(globalLimiter);

router.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/index.html'));
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
