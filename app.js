const express = require('express');
const app = express();

const listenPort = 3000;

app.set('view engine', 'pug');

app.use((req, res, next) => {
    let connectingIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    console.log(`Connection to ${req.url} from ${connectingIp}`);
    next();
});

app.get('/test', (req, res, next) => {
    res.send('test');
});

app.get('/', (req, res) => {
    let options = {
        title: 'APP',
        message: 'Hello world!'
    };
    res.render('index', options);
});

app.all('*', (req, res, next) => {
    res.status(404).send('Error');
    next();
});

app.listen(listenPort, () => {
    console.log(`Server listening on port ${listenPort}.`);
});
