const crypto = require('crypto');

const timers = {};

function start() {
     let idHash;
     while (true) {
        idHash = crypto.randomBytes(20).toString('hex');
        if (!timers[idHash]) {
            timers[idHash] = process.hrtime();
            break;
        }
     }
     return idHash;
}

function _stop(id, remove=true) {
    const duration = process.hrtime(timers[id]);
    if (remove) delete timers[id];
    return duration[0] + duration[1] / 10**9;
}

function stop(id) {
    return _stop(id);
}

function split(id) {
    return _stop(id, false);
}

/**
 * Measure the time taken to import a module.
 * @param {string} moduleName - Name of the module to import.
 * @returns {object} Object containing `module` and the `time` taken to import it.
 */
function measureRequireTime(moduleName) {
    let timeRequire = start();
    let module = require(moduleName);
    return {
        module: module,
        time: stop(timeRequire)
    };
}

module.exports = {
    start,
    stop,
    split,
    measureRequireTime,
}