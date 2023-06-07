$(document).ready(function () {
    setMapSelectEnabled();
    setStageSelectEnabled();
    setGameModeSelectEnabled();
    setSelectionBoxMaps();
    setSelectionBoxGameModes();
    setMatchupGridScores();

    $('.record-win').on('click', fetchMatchupWins);  //TODO: change function, current is just for testing
    $('.merc-select-grid button').on('click', setSelectedClasses);
    $('#tracking-grid th, td').on('click', setSelectedClasses);
    $('#select-map').on('change', setSelectedMap);
    $('#select-stage').on('change', setSelectedStage);
    $('#all-maps').on('click', setMapSelectEnabled);
    $('#all-stages').on('click', setStageSelectEnabled);
    $('#all-game-modes').on('click', setGameModeSelectEnabled);
});

const selected = {
    merc: {
        blu: null,
        red: null
    },
    map: null,
    stage: null,
    gameMode: null
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
    selected.stage = null;
    setSelectionBoxStages();
    setMatchupGridScores();
}

function setSelectedStage() {
    selected.stage = $('#select-stage option:selected').val();
    setMatchupGridScores();
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
    if ($(this).data('blu-parent') == null && $(this).data('red-parent') == null) {
        selected.merc.blu = null;
        selected.merc.red = null;
    } else {
        selected.merc.blu = $(this).data('blu-parent') ?? selected.merc.blu;
        selected.merc.red = $(this).data('red-parent') ?? selected.merc.red;
    }
    highlightSelectedClasses();
    console.log(selected.merc);
}

function highlightSelectedClasses() {
    const highlight = '<div class="highlight"></div>';
    const highlightTargets = [
        $(`#tracking-grid td[data-blu-parent=${selected.merc.blu}][data-red-parent=${selected.merc.red}]`),
        $(`#tracking-grid th[data-blu-parent=${selected.merc.blu}]`),
        $(`#tracking-grid th[data-red-parent=${selected.merc.red}]`),
        $(`button.merc-select[data-blu-parent=${selected.merc.blu}]`),
        $(`button.merc-select[data-red-parent=${selected.merc.red}]`)
    ];
    $('.highlight').remove();
    for (const target of highlightTargets) {
        $(highlight).appendTo(target);
    }
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
