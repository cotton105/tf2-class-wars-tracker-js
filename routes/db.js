//TODO: generate database if it doesn't exist

const sqlite3 = require('sqlite3').verbose();
const router = require('express').Router();

const log = require(`${appRoot}/utils/log`);

const dbLocation = `${appRoot}/classwars-matchups.db`;


router.get('/getMercenaries', getMercenaries);
router.get('/getMaps', getMaps);
router.get('/getMapStages', getMapStages);
router.get('/getGameModes', getGameModes);
router.get('/getMatchupWins', getMatchupWins);
router.post('/incrementWins', incrementWins);

function getDatabaseConnection(method) {
    return new sqlite3.Database(dbLocation, method, (error) => {
        if (error) {
            return log.error(error.message);
        }
    });
}

function closeDatabaseCallback(error) {
    if (error) {
        log.error(error.message);
    }
}

async function getMapID(mapName) {
    return new Promise((resolve, reject) => {
        if (!mapName) return reject('No map name provided.');
        const query = 'SELECT MapID FROM Map WHERE MapName = ?';
        const db = getDatabaseConnection(sqlite3.OPEN_READONLY, getMapID.name);
        db.get(query, [mapName], (error, row) => {
            if (error) {
                log.error(error.message);
                return reject(error);
            }
            return resolve(row.MapID);
        }).close(closeDatabaseCallback);
    });
}

function getMercenaries(req, res) {
    const query = `SELECT * FROM Mercenary`;
    const db = getDatabaseConnection(sqlite3.OPEN_READONLY, getMercenaries.name);
    db.all(query, [], (error, rows) => {
        if (error) {
            throw error;
        }
        res.send(rows.map((row) => row.MercenaryName));
    }).close(closeDatabaseCallback);
}

function getMaps(req, res) {
    const query = 'SELECT MapID, ObjectiveID, MapName FROM Map';
    const db = getDatabaseConnection(sqlite3.OPEN_READONLY, getMaps.name);
    db.all(query, [], (error, rows) => {
        if (error) {
            log.error(error.message);
            res.status(500).send(error.message);
        } else {
            res.send(rows.map((row) => row.MapName));
        }
    }).close(closeDatabaseCallback);
}

function getMapStages(req, res) {
    getMapID(req.query.mapName).then((mapID) => {
        const query = 'SELECT StageID, StageNumber FROM Stage WHERE MapID = ?';
        const db = getDatabaseConnection(sqlite3.OPEN_READONLY, getMapStages.name);
        db.all(query, [mapID], (error, rows) => {
            if (error) {
                error.log(error.message);
                res.status(500).send(error.message);
            } else {
                res.send(rows.map((row) => row.StageNumber));
            }
        }).close(closeDatabaseCallback);
    }).catch((error) => {
        log.error(error);
    });
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
    }).close(closeDatabaseCallback);
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
    }).close(closeDatabaseCallback);
}

function incrementWins(req, res) {

}

module.exports = router;
