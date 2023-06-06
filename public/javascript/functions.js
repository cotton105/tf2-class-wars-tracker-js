$(document).ready(function () {
    setMapSelectEnabled();
    setStageSelectEnabled();
    setGameModeSelectEnabled();
    setSelectionBoxMaps();
    setSelectionBoxGameModes();
    setMatchupGridScores();

    $('.record-win').on('click', fetchMatchupWins);  //TODO: change function, current is just for testing
    $('#tracking-grid th, td').on('click', setSelectedClasses);
    $('#select-map').on('change', setSelectedMap);
    $('#all-maps').on('click', setMapSelectEnabled);
    $('#all-stages').on('click', setStageSelectEnabled);
    $('#all-game-modes').on('click', setGameModeSelectEnabled);
});

const listenAddress = window.location.origin;

const selected = {
    merc: {
        blu: null,
        red: null
    },
    map: null,
    stage: null,
    gameMode: null
}

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
            url: `${listenAddress}/api/getMatchupScores`,
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
    selected.map = $('#select-map option:selected').val();
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

function setMatchupGridScores() {
    fetchMatchupWins().then(function (data) {
        for (const bluParent in data) {
            const row = data[bluParent];
            for (const redParent in row) {
                const wins = data[bluParent][redParent];
                const targetCell = $(`#tracking-grid td[data-blu-parent="${bluParent}"][data-red-parent=${redParent}]`);
                targetCell.attr('data-blu-wins', wins[0]);
                targetCell.attr('data-red-wins', wins[1]);
                const bias = calculateBias(wins[0], wins[1]);
                targetCell.text(bias.toFixed(2));
            }
        }
    }).catch((error) => {
        console.error(error);
    });
}

function setSelectedClasses() {
    $('.highlight').remove();
    if ($(this).data('blu-parent') == null && $(this).data('red-parent') == null) {
        selected.merc.blu = null;
        selected.merc.red = null;
    } else {
        selected.merc.blu = $(this).data('blu-parent') ?? selected.merc.blu;
        selected.merc.red = $(this).data('red-parent') ?? selected.merc.red;
    }
    const highlight = '<div class="highlight"></div>';
    const biasCell = $(`#tracking-grid td[data-blu-parent=${selected.merc.blu}][data-red-parent=${selected.merc.red}]`);
    const bluHeader = $(`#tracking-grid th[data-blu-parent=${selected.merc.blu}]`);
    const redHeader = $(`#tracking-grid th[data-red-parent=${selected.merc.red}]`);
    $(highlight).appendTo(biasCell);
    $(highlight).appendTo(bluHeader);
    $(highlight).appendTo(redHeader);
    console.log(selected.merc);
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
