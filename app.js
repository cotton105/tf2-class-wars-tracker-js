const log = require('./utils/log');
const express = require('express');
const app = express();

const listenUrl = "localhost";
const listenPort = 3000;


app.set('view engine', 'pug');

app.use((req, res, next) => {
    let connectingIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    log.info(`Connection to ${req.url} from ${connectingIp}`);
    next();
});

app.get('/', (req, res) => {
    let options = {
        title: 'APP',
        message: 'Hello world!'
    };
    res.render('index', options);
});

app.all('*', (req, res, next) => {
    log.info(`${req.url} not found.`);
    res.status(404).send('Error');
    next();
});

app.listen(listenPort, () => {
    log.info(`Server listening on http://${listenUrl}:${listenPort}.`);
});
