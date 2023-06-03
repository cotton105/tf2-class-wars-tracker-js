//TODO: generate database if it doesn't exist

const sqlite3 = require('sqlite3').verbose();
const router = require('express').Router();

const log = require(`${appRoot}/utils/log`);

const dbLocation = `${appRoot}/classwars-matchups.db`;


router.get('/getMercenaries', getMercenaries);
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
    let query = `SELECT * FROM Mercenary`;
    db.all(query, [], (error, rows) => {
        if (error) {
            throw error;
        }
        res.send(rows);
    });
    closeDatabaseConnection(db);
}

function getMatchupWins() {
    // let query = "SELECT SUM(mtch.BluWins), SUM(mtch.RedWins) " +
    //                 "FROM Matchup mtch " +
    //                 "JOIN Mercenary blu ON blu.MercenaryID = mtch.BluMercenaryID " +
    //                 "JOIN Mercenary red ON red.MercenaryID = mtch.RedMercenaryID " +
    //                 "WHERE blu.MercenaryName = ? AND red.MercenaryName = ?";
}

function incrementWins(req, res) {

}

module.exports = router;
