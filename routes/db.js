//TODO: generate database if it doesn't exist

const sqlite3 = require('sqlite3').verbose();
const router = require('express').Router();

const log = require(`${appRoot}/utils/log`);

const dbLocation = `${appRoot}/classwars-matchups.db`;


router.get('/getMercenaries', getMercenaries);
router.get('/getMaps', getMaps);
router.get('/getMapStages', getMapStages);
router.get('/getGameModes', getGameModes);
router.get('/getMatchupScores', getMatchupScores);
router.post('/incrementWins', incrementWins);

function getDatabaseConnection(method) {
    return new sqlite3.Database(dbLocation, method, (error) => {
        if (error) {
            log.error(error.message);
        }
    });
}

function closeDatabaseCallback(error) {
    if (error) {
        log.error(error.message);
    }
}

async function getMapID(mapName, db=null) {
    return new Promise((resolve, reject) => {
        if (!mapName) return reject('No map name provided.');
        let closeWhenDone = false;
        if (!db) {
            db = getDatabaseConnection(sqlite3.OPEN_READONLY);
            closeWhenDone = true;
        }
        const query = 'SELECT MapID FROM Map WHERE MapName = ?';
        db.get(query, [mapName], (error, row) => {
            if (error) {
                log.error(error.message);
                return reject(error);
            }
            return resolve(row.MapID);
        });
        if (closeWhenDone) {
            db.close(closeDatabaseCallback);
        }
    });
}

function getMercenaries(req, res) {
    const query = `SELECT * FROM Mercenary`;
    const db = getDatabaseConnection(sqlite3.OPEN_READONLY);
    db.all(query, [], (error, rows) => {
        if (error) {
            throw error;
        }
        res.send(rows.map((row) => row.MercenaryName));
    }).close(closeDatabaseCallback);
}

function getMaps(req, res) {
    const query = 'SELECT MapID, ObjectiveID, MapName FROM Map';
    const db = getDatabaseConnection(sqlite3.OPEN_READONLY);
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
        const db = getDatabaseConnection(sqlite3.OPEN_READONLY);
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
    const db = getDatabaseConnection(sqlite3.OPEN_READONLY);
    db.all(query, (error, rows) => {
        if (error) {
            log.error(error.message);
            res.status(500).send(error.message);
        } else {
            res.send(rows);
        }
    }).close(closeDatabaseCallback);
}

//TODO: Change query depending on configuration settings
async function getMatchupScores(req, res) {
    const db = getDatabaseConnection(sqlite3.OPEN_READONLY);
    const filters = [];
    if (req.query.map) {
        await getMapID(req.query.map, db).then((mapID) => {
            filters.push(`mp.MapID = ${mapID}`);
        }).catch((error) => {
            return Promise.reject(error);
        });
    }
    const query = ''.concat(
        'SELECT blu.MercenaryID AS "BluMerc", SUM(mtch.BluWins) AS "BluWins", SUM(mtch.RedWins) AS "RedWins", red.MercenaryID AS "RedMerc" ' +
        'FROM Matchup mtch ' +
            'JOIN StageGameMode cfg ON cfg.ConfigurationID = mtch.ConfigurationID ' +
            'JOIN Stage s ON s.StageID = cfg.StageID ' +
            'JOIN GameMode mode ON mode.GameModeID = cfg.GameModeID ' +
            'JOIN Map mp ON mp.MapID = s.MapID ' +
            'JOIN Mercenary blu ON blu.MercenaryID = mtch.BluMercenaryID ' +
            'JOIN Mercenary red ON red.MercenaryID = mtch.RedMercenaryID ',
        filters.length > 0 ? `WHERE ${filters.join(' AND ')} ` : '',
        'GROUP BY mtch.BluMercenaryID, mtch.RedMercenaryID'
    );
    let scoreArray = [...Array(9)].map((e) => Array(9));  // Create empty 9x9 array
    db.each(query, [], (error, row) => {
        if (error) {
            return Promise.reject(error);
        }
        scoreArray[row.BluMerc - 1][row.RedMerc - 1] = [row.BluWins, row.RedWins];
    }, (error, count) => {
        if (error) {
            return Promise.reject(error);
        }
        res.send(scoreArray);
        return Promise.resolve();
    }).close(closeDatabaseCallback);
}

function incrementWins(req, res) {

}

module.exports = router;
