const express = require('express');
const app = express();

const listenPort = 3000;

app.use((req, res, next) => {
    let connectingIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    console.log(`Connection to ${req.url} from ${connectingIp}`);
    next();
});

app.get('/test', (req, res, next) => {
    res.send('test');
});

app.get('/', (req, res) => {
    res.send('Successful response.');
});

app.all('*', (req, res, next) => {
    res.status(404).send('Error');
    next();
});

app.listen(listenPort, () => {
    console.log(`Server listening on port ${listenPort}.`);
});
