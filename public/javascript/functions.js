$(document).ready(function () {
    setMapSelectEnabled();
    setStageSelectEnabled();
    setGameModeSelectEnabled();
    setSelectionBoxMaps();

    $('.record-win').on('click', getMatchupWins);  //TODO: change function, current is just for testing
    $('#tracking-grid td').on('click', matchupTableClickHandler);
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

async function getMatchupWins() {
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

async function getMaps() {
    return new Promise((resolve, reject) => {
        let options = {
            url: `${listenAddress}/api/getMaps`
        };
        $.ajax(options).done((data) => {
            return resolve(data.map((map) => map.MapName));
        });
    });
}

function setSelectionBoxMaps() {
    getMaps().then((maps) => {
        for (let map of maps) {
            $('#select-map').append(`<option>${map}</option>`)
        }
    }).catch((error) => {
        console.error(error);
    });
}

function matchupTableClickHandler() {
    let parents = $(this).data('parents');
    selectedMercs.blu = parents.blu;
    selectedMercs.red = parents.red;
    getMatchupWins().then((matchupWins) => {
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
