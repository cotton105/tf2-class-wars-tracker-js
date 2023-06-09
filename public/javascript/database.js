function getMercenaries() {
    $.ajax({
        url: '/api/getMercenaries',
        method: 'GET'
    })
    .done((data) => {
        console.log(data);
    });
}

async function incrementWins() {
    return new Promise((resolve, reject) => {
        const data = {
            bluMercID: selected.merc.blu === null ? null : selected.merc.blu + 1,
            redMercID: selected.merc.red === null ? null : selected.merc.red + 1,
            map: selected.map,
            stage: selected.stage,
            gameModeID: selected.gameMode
        };
        $.ajax({
            url: '/api/incrementWins',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            data: JSON.stringify(data)
        }).done((response) => {
            return resolve(response);
        });
    });
}

async function fetchMatchupWins() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/api/getMatchupScores',
            method: 'GET',
            data: {
                mapID: selected.map,
                stage: selected.stage,
                gameModeID: selected.gameMode
            }
        }).done((response) => {
            return resolve(response);
        });
    });
}

async function fetchMaps() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/api/getMaps',
            method: 'GET'
        }).done((response) => {
            return resolve(response);
        });
    });
}

async function fetchMapStages() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/api/getMapStages',
            method: 'GET',
            data: {
                mapID: selected.map
            }
        }).done((response) => {
            return resolve(response);
        });
    });
}

async function fetchGameModes() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/api/getGameModes',
            method: 'GET'
        }).done((response) => {
            return resolve(response);
        });
    });
}
