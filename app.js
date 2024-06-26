const path = require('path');
const express = require('express');
const app = express();

const log = require('./utils/log');

global.config = require('./config.js');


const publicDir = path.join(config.appRoot, 'public');
const viewsDir = path.join(config.appRoot, 'views');

app.set('view engine', 'pug');
app.use(express.static(publicDir));
app.use(express.json());
app.use(recordConnection);

let server;
const dbRouter = require('./routes/db.js').router;

app.get('/', renderHomepage);
app.use('/api', dbRouter);
app.all('*', catchPageNotFound);

app.use(handleError);

function recordConnection(req, res, next) {
    let connectingIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    log.debug(`${req.method} from ${connectingIp} for ${req.url}.`);
    next();
}

function renderHomepage(req, res) {
    let options = {
        title: 'APP',
        message: 'Hello world!'
    };
    res.render(path.join(viewsDir, 'index'), options);
}

function catchPageNotFound(req, res, next) {
    log.debug(`${req.url} not found.`);
    res.status(404).send('Error');
}

function handleError(error, req, res, next) {
    if (res.headersSent) {
        next(error);
        return;
    }
    log.error(error);
    res.status(500).send(error.message);
}

function start() {
    server = app.listen(config.listenPort, () => {
        log.info(`Server listening on ${config.listenAddress}.`);
    });
}

function close() {
    log.info('Closing server...');
    server.close();
}

const exportList = {
    start,
    close,
};
if (process.env.NODE_ENV === 'test') {
    exportList.app = app;
}
module.exports = exportList;
