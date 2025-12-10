const express = require("express");
const cors = require("cors");
const path = require("path")

const app = express();
const router = express.Router()
const ip = '127.0.0.1'
const port = 4000;




app.use(cors());
app.use(express.json());

router.get('/', (request, response) => {
  response.sendFile(path.join(__dirname, '../frontend/html/main.html'));
});

app.use('/', router);
const endpoints = require('./api/api.js');
app.use('/api', endpoints);




app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use(express.static(path.join(__dirname, '../frontend')));
app.listen(port, () => {
  console.log(`Szerver fut: http://${ip}:${port}/`);
});
