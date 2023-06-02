const path = require('path');
const log4js = require('log4js');

// const consoleLogLevel = global.config.VERBOSE ? 'debug' : 'info';
const consoleLogLevel = 'debug';
const logDir = path.join(__dirname, '..', 'logs');
const infoFile = path.join(logDir, 'info.log');
const errorFile = path.join(logDir, 'error.log');
const fileSettings = {
    type: 'dateFile',
    numBackups: 3,
    compress: true,
};

log4js.configure({
    appenders: {
        out: {
            type: 'stdout'
        },
        info: {
            filename: infoFile,
            ...fileSettings,
        },
        error: {
            filename: errorFile,
            ...fileSettings,
        },
        console: {
            type: 'logLevelFilter',
            appender: 'out',
            level: consoleLogLevel,
        },
        'just-errors': {
            type: 'logLevelFilter',
            appender: 'error',
            level: 'error'
        }
    },
    categories: {
        default: {
            appenders: ['console', 'info', 'just-errors'],
            level: 'all'
        }
    }
});

module.exports = log4js.getLogger();
