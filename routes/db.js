//TODO: generate database if it doesn't exist

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const router = require('express').Router();

const log = require(`${config.appRoot}/utils/log`);

let dbLocation;
if (process.env.NODE_ENV == 'test') {
    dbLocation = path.join(config.appRoot, 'tests', 'classwars-matchups.test.db');
} else {
    dbLocation = path.join(config.appRoot, 'classwars-matchups.db');
}


router.get('/getMercenaries', getMercenariesEndpoint);
router.get('/getMaps', getMapsEndpoint);
router.get('/getMapStages', getMapStages);
router.get('/getGameModes', getGameModes);
router.get('/getMatchupScores', getMatchupScores);
router.post('/incrementWins', incrementWins);
router.post('/decrementWins', decrementWins);

function getDatabaseConnection(method) {
    return new sqlite3.Database(dbLocation, method, function (error) {
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

async function getMercenariesEndpoint(req, res, next) {
    try {
        const mercs = await getMercenaries();
        res.send(mercs);
    } catch (error) {
        next(error);
    }
}

async function getMapsEndpoint(req, res, next) {
    try {
        const maps = await getMaps();
        res.send(maps);
    } catch (error) {
        next(error);
    }
}

async function getMapID(mapName, db=null) {
    return new Promise((resolve, reject) => {
        if (!mapName) return resolve(null);
        let closeWhenDone = false;
        if (!db) {
            db = getDatabaseConnection(sqlite3.OPEN_READONLY);
            closeWhenDone = true;
        }
        const query = 'SELECT MapID FROM Map WHERE MapName = ?';
        db.get(query, [mapName], function (error, row) {
            if (error) {
                return reject(error);
            } else if (!row) {
                return reject(`Map '${mapName}' not found.`);
            }
            return resolve(row.MapID);
        });
        if (closeWhenDone) {
            db.close(closeDatabaseCallback);
        }
    });
}

async function getStageID(mapID, stageNumber, db=null) {
    return new Promise((resolve, reject) => {
        if (!mapID || !stageNumber) return resolve(null);
        let closeWhenDone = false;
        if (!db) {
            db = getDatabaseConnection(sqlite3.OPEN_READONLY);
            closeWhenDone = true;
        }
        const query = 'SELECT StageID FROM Stage WHERE MapID = ? AND StageNumber = ?';
        db.get(query, [mapID, stageNumber], function (error, row) {
            if (error) {
                return reject(error);
            } else if (!row) {
                return reject({ message: 'No stages found.', status: 500 });
            }
            return resolve(row.StageID);
        });
        if (closeWhenDone) {
            db.close(closeDatabaseCallback);
        }
    });
}

async function getMercenaries() {
    return new Promise((resolve, reject) => {
    const query = `SELECT * FROM Mercenary`;
    const db = getDatabaseConnection(sqlite3.OPEN_READONLY);
    db.all(query, [], (error, rows) => {
        if (error) {
                reject(error);
                return;
        }
            const results = rows.map((row) => row.MercenaryName);
            resolve(results);
    }).close(closeDatabaseCallback);
    });
}

async function getMaps() {
    return new Promise((resolve, reject) => {
    const query = 'SELECT MapID, ObjectiveID, MapName FROM Map';
    const db = getDatabaseConnection(sqlite3.OPEN_READONLY);
    db.all(query, [], function (error, rows) {
        if (error) {
                reject(error);
                return;
            }
            const results = rows.map((row) => {
                return { mapID: row.MapID, mapName: row.MapName };
            });
            resolve(results);
    }).close(closeDatabaseCallback);
    });
}

function getMapStages(req, res, next) {
    const mapID = req.query.mapID;
    const query = 'SELECT StageID, StageNumber FROM Stage WHERE MapID = ?';
    const db = getDatabaseConnection(sqlite3.OPEN_READONLY);
    db.all(query, [mapID], function (error, rows) {
        if (error) {
            error.status = 500;
            next(error);
        } else {
            res.send(rows.map((row) => row.StageNumber));
        }
    }).close(closeDatabaseCallback);
}

function getGameModes(req, res, next) {
    const query = 'SELECT GameModeID, GameModeName FROM GameMode';
    const db = getDatabaseConnection(sqlite3.OPEN_READONLY);
    db.all(query, function (error, rows) {
        if (error) {
            error.status = 500;
            next(error);
        } else {
            res.send(rows.map((row) => {
                return { name: row.GameModeName, id: row.GameModeID };
            }));
        }
    }).close(closeDatabaseCallback);
}

async function getMatchupScores(req, res, next) {
    try {
        const db = getDatabaseConnection(sqlite3.OPEN_READONLY);
        let mapID = req.query.mapID;
        let stageID = await getStageID(mapID, req.query.stage, db);
        let gameModeID = req.query.gameModeID;
        let resultArray = [mapID, stageID, gameModeID];
    
        const dbFilters = [];
        resultArray[0] && dbFilters.push('mp.MapID = ?');
        resultArray[1] && dbFilters.push('s.StageID = ?');
        resultArray[2] && dbFilters.push('mode.GameModeID = ?');
        resultArray = resultArray.filter((result) => result);
    
        const query = ''.concat(
            'SELECT blu.MercenaryID AS "BluMerc", SUM(mtch.BluWins) AS "BluWins", SUM(mtch.RedWins) AS "RedWins", red.MercenaryID AS "RedMerc" ' +
            'FROM Matchup mtch ' +
                'JOIN StageGameMode cfg ON cfg.ConfigurationID = mtch.ConfigurationID ' +
                'JOIN Stage s ON s.StageID = cfg.StageID ' +
                'JOIN GameMode mode ON mode.GameModeID = cfg.GameModeID ' +
                'JOIN Map mp ON mp.MapID = s.MapID ' +
                'JOIN Mercenary blu ON blu.MercenaryID = mtch.BluMercenaryID ' +
                'JOIN Mercenary red ON red.MercenaryID = mtch.RedMercenaryID ',
            dbFilters.length > 0 ? `WHERE ${dbFilters.join(' AND ')} ` : '',
            'GROUP BY mtch.BluMercenaryID, mtch.RedMercenaryID'
        );
        let scoreArray = [...Array(9)].map((e) => Array(9));  // Create empty 9x9 array
        db.each(query, resultArray, function (error, row) {
            if (error) {
                return Promise.reject(error);
            }
            scoreArray[row.BluMerc - 1][row.RedMerc - 1] = [row.BluWins, row.RedWins];
        }, function (error, count) {
            if (error) {
                return Promise.reject(error);
            }
            res.send(scoreArray);
            return Promise.resolve();
        }).close(closeDatabaseCallback);
    } catch (err) {
        next(err);
    }
}

async function getMatchupID(configuration, db=null) {
    return new Promise((resolve, reject) => {
        const missingItems = getNullProperties(configuration);
        if (missingItems.length > 0) {
            const error = new Error(`One or more arguments not specified: ${missingItems}`);
            error.status = 400;
            throw error;
        }
        let closeWhenDone = false;
        if (!db) {
            db = getDatabaseConnection(sqlite3.OPEN_READONLY);
            closeWhenDone = true;
        }
        const query =
            'SELECT mtch.MatchupID ' +
            'FROM Matchup mtch ' +
                'JOIN StageGameMode cfg ON cfg.ConfigurationID = mtch.ConfigurationID ' +
                'JOIN Stage s ON s.StageID = cfg.StageID ' +
            'WHERE s.MapID = ? AND s.StageNumber = ? AND cfg.GameModeID = ? AND mtch.BluMercenaryID = ? AND mtch.RedMercenaryID = ?';
        const values = [
            configuration.mapID, configuration.stage, configuration.gameModeID, configuration.bluMercID, configuration.redMercID
        ];
        db.get(query, values, function (error, row) {
            if (error) {
                error.status = 500;
                throw error;
            } else if (!row) {
                return reject({ message: 'Matchup not found.', status: 202 });
            }
            return resolve(row.MatchupID)
        });
        if (closeWhenDone) {
            db.close(closeDatabaseCallback);
        }
    });
}

async function insertMatchup(configuration, db=null) {
    const error = new Error('"insertMatchup()" not implemented.');
    error.status = 501;
    throw error;
}

async function getConfigurationID(configuration, db=null) {
    return new Promise((resolve, reject) => {
        const missingItems = getNullProperties(configuration);
        if (missingItems.length > 0) {
            const error = new Error(`One or more arguments not specified: ${missingItems}`);
            error.status = 400;
            throw error;
        }
        let closeWhenDone = false;
        if (!db) {
            db = getDatabaseConnection(sqlite3.OPEN_READONLY);
            closeWhenDone = true;
        }
        const query =
            'SELECT cfg.ConfigurationID ' +
            'FROM StageGameMode cfg ' +
                'JOIN Stage s ON s.StageID = cfg.StageID ' +
                'JOIN GameMode mode ON mode.GameModeID = cfg.GameModeID ' +
                'JOIN Map mp ON mp.MapID = s.MapID ' +
            'WHERE mp.MapID = ? AND s.StageNumber = ? AND mode.GameModeID = ?';
        const values = [ configuration.mapID, configuration.stage, configuration.gameModeID ];
        db.get(query, values, function (error, row) {
            if (error) {
                error.status = 500;
                throw error;
            } else if (!row) {
                return reject({ message: `Configuration not found with arguments: ${configuration}`, status: 500 });
            }
            return resolve(row.ConfigurationID);
        });
        if (closeWhenDone) {
            db.close(closeDatabaseCallback);
        }
    });
}

async function incrementWins(req, res, next) {
    try {
        const matchupSelection = {
            bluMercID: req.body.bluMercID,
            redMercID: req.body.redMercID,
            mapID: req.body.mapID,
            stage: req.body.stage,
            gameModeID: req.body.gameModeID,
            winningTeam: req.body.winningTeam
        };
        const missingArguments = getNullProperties(matchupSelection);
        if (missingArguments.length > 0) {
            const error = new Error(`One or more required arguments were not specified: ${missingArguments}`);
            error.status = 400;
            throw error;
        }
        const db = getDatabaseConnection(sqlite3.OPEN_READWRITE);
        const matchupID = await getMatchupID(matchupSelection, db)
        .catch((error) => {
            if (error.status == 202) {
                return insertMatchup(matchupSelection, db);
            } else {
                throw error;
            }
        });
        const configurationID = await getConfigurationID(matchupSelection, db);
        const incrementString = matchupSelection.winningTeam == 'BLU' ? 'BluWins = BluWins + 1' : 'RedWins = RedWins + 1';
        const query = `UPDATE Matchup SET ${incrementString} WHERE MatchupID = ?`;
        db.run(query, [matchupID], function (error) {
            if (error) {
                error.status = 500;
                next(error);
            } else {
                log.info(`Incremented ${matchupSelection.winningTeam} wins for MatchupID ${matchupID}.`);
                res.send('Successfully incremented wins.');
            }
        });
        db.close(closeDatabaseCallback);
    } catch (error) {
        next(error);
    }
}

async function decrementWins(req, res, next) {
    try {
        const matchupSelection = {
            bluMercID: req.body.bluMercID,
            redMercID: req.body.redMercID,
            mapID: req.body.mapID,
            stage: req.body.stage,
            gameModeID: req.body.gameModeID,
            team: req.body.team
        };
        const missingArguments = getNullProperties(matchupSelection);
        if (missingArguments.length > 0) {
            const error = new Error(`One or more required arguments were not specified: ${missingArguments}`);
            error.status = 400;
            throw error;
        }
        const db = getDatabaseConnection(sqlite3.OPEN_READWRITE);
        const matchupID = await getMatchupID(matchupSelection, db)
        .catch((error) => {
            if (error.status == 202) {
                return insertMatchup(matchupSelection, db);
            } else {
                throw error;
            }
        });
        const configurationID = await getConfigurationID(matchupSelection, db);
        const decrementString = matchupSelection.team == 'BLU' ? 'BluWins = BluWins - 1' : 'RedWins = RedWins - 1';
        const query = `UPDATE Matchup SET ${decrementString} WHERE MatchupID = ?`;
        db.run(query, [matchupID], function (error) {
            if (error) {
                error.status = 500;
                next(error);
            } else {
                log.info(`Decremented ${matchupSelection.team} wins for MatchupID ${matchupID}.`);
                res.send('Successfully decremented wins.');
            }
        });
        db.close(closeDatabaseCallback);
    } catch (error) {
        next(error);
    }
}

function getNullProperties(obj) {
    const missingArguments = [];
    for (const member in obj) {
        if (!obj[member]) {
            missingArguments.push(member);
        }
    }
    return missingArguments;
}

let exportList = { router };
if (process.env.NODE_ENV === 'test') {
    exportList = {
        router,
        getMapID,
        getStageID,
        // getGameModeID,
        getConfigurationID,
        getMercenaries,
        getMaps,
        getMapStages,
        getGameModes,
        getMatchupScores,
        getMatchupID,
        incrementWins,
        decrementWins,
    };
}
module.exports = exportList;
