const path = require('path');
const express = require('express');
const app = express();

const log = require('./utils/log');

global.appRoot = path.resolve(__dirname);
global.listenHost = 'localhost';
global.listenPort = 3000;
global.listenAddress = `http://${listenHost}:${listenPort}`;


app.set('view engine', 'pug');
app.use(express.static(path.join(appRoot, 'public')));
app.use(recordConnection);

app.get('/', renderHomepage);
app.use('/api', require('./routes/db'));
app.all('*', catchPageNotFound);

app.listen(listenPort, () => {
    log.info(`Server listening on ${listenAddress}.`);
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
