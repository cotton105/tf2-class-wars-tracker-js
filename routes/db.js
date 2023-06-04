//TODO: generate database if it doesn't exist

const sqlite3 = require('sqlite3').verbose();
const router = require('express').Router();

const log = require(`${appRoot}/utils/log`);

const dbLocation = `${appRoot}/classwars-matchups.db`;


router.get('/getMercenaries', getMercenaries);
router.get('/getMaps', getMaps);
router.get('/getGameModes', getGameModes);
router.get('/getMatchupWins', getMatchupWins);
router.post('/incrementWins', incrementWins);

function getDatabaseConnection(method, reason=null) {
    return new sqlite3.Database(dbLocation, method, (error) => {
        if (error) {
            return log.error(error.message);
        }
        log.info(`Connected to the database for reason: ${reason ? reason : 'unknown'}.`);
    });
}

function closeDatabaseConnection(db) {
    db.close((error) => {
        if (error) {
            log.error(error.message);
        }
        log.info('Database connection closed.');
    });
}

function getMercenaries(req, res) {
    const db = getDatabaseConnection(sqlite3.OPEN_READONLY, getMercenaries.name);
    const query = `SELECT * FROM Mercenary`;
    db.all(query, [], (error, rows) => {
        if (error) {
            throw error;
        }
        res.send(rows);
    });
    closeDatabaseConnection(db);
}

function getMaps(req, res) {
    const query = 'SELECT MapID, ObjectiveID, MapName FROM Map';
    const db = getDatabaseConnection(sqlite3.OPEN_READONLY, getMaps.name);
    db.all(query, [], (error, rows) => {
        if (error) {
            log.error(error.message);
            res.status(500).send(error.message);
        } else {
            res.send(rows);
        }
    });
    closeDatabaseConnection(db);
}

function getGameModes(req, res) {
    const query = 'SELECT GameModeID, GameModeName FROM GameMode';
    const db = getDatabaseConnection(sqlite3.OPEN_READONLY, getGameModes.name);
    db.all(query, (error, rows) => {
        if (error) {
            log.error(error.message);
            res.status(500).send(error.message);
        } else {
            res.send(rows);
        }
    });
    closeDatabaseConnection(db);
}

function getMatchupWins(req, res) {
    const bluMercId = parseInt(req.query.bluMercId);
    const redMercId = parseInt(req.query.redMercId);
    const query = 'SELECT SUM(mtch.BluWins), SUM(mtch.RedWins) ' +
                  'FROM Matchup mtch ' +
                  'JOIN Mercenary blu ON blu.MercenaryID = mtch.BluMercenaryID ' +
                  'JOIN Mercenary red ON red.MercenaryID = mtch.RedMercenaryID ' +
                  'WHERE blu.MercenaryID = ? AND red.MercenaryID = ?';
    const db = getDatabaseConnection(sqlite3.OPEN_READONLY, getMatchupWins.name);
    db.all(query, [bluMercId, redMercId], (error, rows) => {
        if (error) {
            throw error;
        }
        res.send(rows);
    });
    closeDatabaseConnection(db);
}

function incrementWins(req, res) {

}

module.exports = router;
