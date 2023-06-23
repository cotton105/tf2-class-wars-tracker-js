const path = require('path');

const appRoot = path.resolve(__dirname);
const listenHost = 'localhost';
const listenPort = '3000';
const listenAddress = `http://${listenHost}:${listenPort}`;

module.exports = {
    appRoot,
    listenHost,
    listenPort,
    listenAddress,
};
