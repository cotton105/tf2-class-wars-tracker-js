const path = require('path');
const log = require('./utils/log');
const express = require('express');
const app = express();

const listenUrl = "localhost";
const listenPort = 3000;


app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));

app.use(recordConnection);
app.get('/', renderHomepage);
app.all('*', catchPageNotFound);

app.listen(listenPort, () => {
    log.info(`Server listening on http://${listenUrl}:${listenPort}.`);
});


function recordConnection(req, res, next) {
    let connectingIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    log.info(`Connection to ${req.url} from ${connectingIp}`);
    next();
}

function renderHomepage(req, res) {
    let options = {
        title: 'APP',
        message: 'Hello world!'
    };
    res.render('index', options);
}

function catchPageNotFound(req, res, next) {
    log.info(`${req.url} not found.`);
    res.status(404).send('Error');
    next();
}
