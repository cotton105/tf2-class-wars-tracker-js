const crypto = require('crypto');

const timers = {};

/**
 * Starts a new timer.
 * @returns ID for the timer - pass this value to `stop()` or `split()`.
 * @see `stop()`
 * @see `split()`
 */
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

/**
 * Get the duration of the specified timer.
 * @param {string} id ID of the timer to stop.
 * @param {boolean} remove Whether to halt timing after read.
 * @returns The measured time in seconds.
 * @see `start()`
 */
function _stop(id, remove=true) {
    const duration = process.hrtime(timers[id]);
    if (remove) delete timers[id];
    return duration[0] + duration[1] / 10**9;
}

/**
 * Stop the specified timer and get the duration.
 * @param {string} id ID of the timer to read.
 * @returns The measured time in seconds.
 */
function stop(id) {
    return _stop(id);
}

/**
 * Get the duration of the specified timer and keep the timer going.
 * @param {string} id ID of the timer to read.
 * @returns The measured time in seconds.
 */
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