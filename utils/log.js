const path = require('path');
const log4js = require('log4js');

// const consoleLogLevel = global.config.VERBOSE ? 'debug' : 'info';
const consoleLogLevel = 'debug';
const logDir = path.join(__dirname, '..', 'logs');
log4js.configure({
    appenders: {
        out: { type: 'stdout' },
        info: { type: 'file', filename: path.join(logDir, 'info.log') },
        error: { type: 'file', filename: path.join(logDir, 'error.log') },
        'console': {
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
        default: { appenders: ['console', 'info', 'just-errors'], level: 'all' }
    }
});

module.exports = log4js.getLogger();
