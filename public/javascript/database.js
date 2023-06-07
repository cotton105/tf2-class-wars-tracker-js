function getMercenaries() {
    $.ajax({
        url: `/api/getMercenaries`
    })
    .done((data) => {
        console.log(data);
    });
}

async function fetchMatchupWins() {
    return new Promise((resolve, reject) => {
        let options = {
            url: `/api/getMatchupScores`,
            data: {
                bluMercId: selected.merc.blu + 1,
                redMercId: selected.merc.red + 1,
                map: selected.map,
                stage: selected.stage,
                gameMode: selected.gameMode
            }
        };
        $.ajax(options).done((data) => {
            return resolve(data);
        });
    });
}

async function fetchMaps() {
    return new Promise((resolve, reject) => {
        let options = {
            url: `/api/getMaps`
        };
        $.ajax(options).done((data) => {
            return resolve(data);
        });
    });
}

async function fetchMapStages() {
    return new Promise((resolve, reject) => {
        let options = {
            url: `/api/getMapStages`,
            data: {
                mapName: selected.map
            }
        };
        $.ajax(options).done((data) => {
            return resolve(data);
        });
    });
}

async function fetchGameModes() {
    return new Promise((resolve, reject) => {
        let options = {
            url: `/api/getGameModes`
        };
        $.ajax(options).done((data) => {
            return resolve(data.map((gameMode) => gameMode.GameModeName));
        });
    });
}
