function getMercenaries() {
    $.ajax({
        url: '/api/getMercenaries',
        method: 'GET'
    })
    .done((data) => {
        console.log(data);
    });
}

async function updateWinCount() {
    return new Promise((resolve, reject) => {
        const team = $(this).data('team');
        const direction = $(this).data('direction');
        const data = {
            bluMercID: selected.merc.blu === null ? null : selected.merc.blu + 1,
            redMercID: selected.merc.red === null ? null : selected.merc.red + 1,
            serverID: selected.server,
            mapID: selected.map,
            stage: selected.stage,
            gameModeID: selected.gameMode,
            team: team,
            direction: direction
        };
        $.ajax({
            url: '/api/updateWins',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            data: JSON.stringify(data)
        }).done((response) => {
            refreshMatchupGrid();
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
                serverID: selected.server,
                mapID: selected.map,
                stage: selected.stage,
                gameModeID: selected.gameMode
            }
        }).done((response) => {
            return resolve(response);
        });
    });
}

async function fetchServers() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/api/getServers',
            method: 'GET'
        }).done((response) => {
            return resolve(response);
        })
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
