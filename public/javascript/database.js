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
        const options = {
            url: '/api/incrementWins',
            method: 'POST',
            data: {
                bluMercID: selected.merc.blu,
                redMercID: selected.merc.red,
                map: selected.map,
                stage: selected.stage,
                gameModeID: selected.gameMode
            }
        };
        $.ajax(options).done((response) => {
            return resolve(response);
        });
    });
}

async function fetchMatchupWins() {
    return new Promise((resolve, reject) => {
        const options = {
            url: '/api/getMatchupScores',
            method: 'GET',
            data: {
                map: selected.map,
                stage: selected.stage,
                gameModeID: selected.gameMode
            }
        };
        $.ajax(options).done((response) => {
            return resolve(response);
        });
    });
}

async function fetchMaps() {
    return new Promise((resolve, reject) => {
        const options = {
            url: '/api/getMaps',
            method: 'GET'
        };
        $.ajax(options).done((response) => {
            return resolve(response);
        });
    });
}

async function fetchMapStages() {
    return new Promise((resolve, reject) => {
        const options = {
            url: '/api/getMapStages',
            method: 'GET',
            data: {
                mapName: selected.map
            }
        };
        $.ajax(options).done((response) => {
            return resolve(response);
        });
    });
}

async function fetchGameModes() {
    return new Promise((resolve, reject) => {
        const options = {
            url: '/api/getGameModes',
            method: 'GET'
        };
        $.ajax(options).done((response) => {
            return resolve(response);
        });
    });
}
