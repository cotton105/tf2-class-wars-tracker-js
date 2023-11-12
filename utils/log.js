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
    compress: false,
};

log4js.configure({
    appenders: {
        out: {
            type: 'stdout',
            layout: {
                type: 'pattern',
                pattern: '%[[%d] [%p]%] %m',
            },
        },
        everything: {
            filename: infoFile,
            layout: {
                type: 'pattern',
                pattern: '[%d] [%p] %m',
            },
            ...fileSettings,
        },
        error: {
            filename: errorFile,
            layout: {
                type: 'pattern',
                pattern: '[%d] [%p] %f:%l %m%n %s',
            },
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
            level: 'error',
        }
    },
    categories: {
        default: {
            appenders: ['console', 'everything', 'just-errors'],
            level: 'all',
            enableCallStack: true,
        }
    }
});

module.exports = log4js.getLogger();
