$(document).ready(function () {
    setMapSelectEnabled();
    setStageSelectEnabled();
    setGameModeSelectEnabled();
    setSelectionBoxMaps();
    setSelectionBoxGameModes();

    $('.record-win').on('click', fetchMatchupWins);  //TODO: change function, current is just for testing
    $('#tracking-grid td').on('click', matchupTableClickHandler);
    $('#select-map').on('change', setSelectedMap);
    $('#all-maps').on('click', setMapSelectEnabled);
    $('#all-stages').on('click', setStageSelectEnabled);
    $('#all-game-modes').on('click', setGameModeSelectEnabled);
});

const listenAddress = window.location.origin;
const selectedMercs = {
    blu: undefined,
    red: undefined
};
let selectedMap;
let selectedStage;
let selectedGameMode;

function getMercenaries() {
    $.ajax({
        url: `${listenAddress}/api/getMercenaries`
    })
    .done((data) => {
        console.log(data);
    });
}

async function fetchMatchupWins() {
    return new Promise((resolve, reject) => {
        let options = {
            url: `${listenAddress}/api/getMatchupWins`,
            data: {
                bluMercId: selectedMercs.blu + 1,
                redMercId: selectedMercs.red + 1,
                map: selectedMap,
                stage: selectedStage,
                gameMode: selectedGameMode
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
            url: `${listenAddress}/api/getMaps`
        };
        $.ajax(options).done((data) => {
            return resolve(data);
        });
    });
}

async function fetchMapStages() {
    return new Promise((resolve, reject) => {
        let options = {
            url: `${listenAddress}/api/getMapStages`,
            data: {
                mapName: selectedMap
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
            url: `${listenAddress}/api/getGameModes`
        };
        $.ajax(options).done((data) => {
            return resolve(data.map((gameMode) => gameMode.GameModeName));
        });
    });
}

function setSelectionBoxMaps() {
    fetchMaps().then((maps) => {
        for (let map of maps) {
            $('#select-map').append(`<option value='${map}'>${map}</option>`)
        }
    }).catch((error) => {
        console.error(error);
    });
}

function setSelectedMap() {
    selectedMap = $('#select-map option:selected').val();
    setSelectionBoxStages();
}

function setSelectionBoxStages() {
    fetchMapStages().then((stages) => {
        $('#select-stage option').remove();
        for (let stage of stages) {
            $('#select-stage').append(`<option>${stage}</option>`);
        }
    }).catch((error) => {
        console.error(error);
    });
}

function setSelectionBoxGameModes() {
    fetchGameModes().then((gameModes) => {
        for (let gameMode of gameModes) {
            $('#select-game-mode').append(`<option>${gameMode}</option>`);
        }
    }).catch((error) => {
        console.error(error);
    });
}

function matchupTableClickHandler() {
    let parents = $(this).data('parents');
    selectedMercs.blu = parents.blu;
    selectedMercs.red = parents.red;
    fetchMatchupWins().then((matchupWins) => {
        console.log(matchupWins);
    }).catch((error) => {
        console.error(error);
    });
    console.log(selectedMercs);
}

function setMapSelectEnabled() {
    let enabled = $('#all-maps').prop('checked');
    $('#select-map').prop('disabled', enabled);
}

function setStageSelectEnabled() {
    let enabled = $('#all-stages').prop('checked');
    $('#select-stage').prop('disabled', enabled);
}

function setGameModeSelectEnabled() {
    let enabled = $('#all-game-modes').prop('checked');
    $('#select-game-mode').prop('disabled', enabled);
}
