$(document).ready(function () {
    toggleAllMaps();
    toggleAllStages();
    toggleAllGameModes();
    setSelectionBoxMaps();
    setSelectionBoxStages();
    setSelectionBoxGameModes();
    refreshMatchupGrid();

    $('.record-win').on('click', incrementWins);
    $('.merc-select-grid button').on('click', setSelectedClasses);
    $('#tracking-grid th, td').on('click', setSelectedClasses);
    $('#select-map').on('change', setSelectedMap);
    $('#select-stage').on('change', setSelectedStage);
    $('#select-game-mode').on('change', setSelectedGameMode);
    $('#overall-checkbox').on('click', toggleOverallOverlay);
    $('#all-maps-checkbox').on('click', toggleAllMaps);
    $('#all-stages-checkbox').on('click', toggleAllStages);
    $('#all-game-modes-checkbox').on('click', toggleAllGameModes);
});

const BLU_COLOR = '#abcbff';
const RED_COLOR = '#ff7d7d';
let selected = {
    merc: {
        blu: null,
        red: null
    },
    map: null,
    stage: null,
    gameMode: null
};
let tempSelected = null;

function setSelectionBoxMaps() {
    fetchMaps().then((maps) => {
        for (let map of maps) {
            $('#select-map').append(`<option data-map-id='${map.mapID}'>${map.mapName}</option>`);
        }
    })
    .catch((error) => {
        console.error(error);
    });
}

function setSelectedMap() {
    selected.map = $('#select-map option:selected').data('map-id');
    const allStagesChecked = $('#all-stages-checkbox').prop('checked');
    selected.stage = allStagesChecked ? null : 1;
    setSelectionBoxStages();
    refreshMatchupGrid();
}

function setSelectedStage() {
    selected.stage = $('#select-stage option:selected').val();
    refreshMatchupGrid();
}

function setSelectedGameMode() {
    selected.gameMode = $('#select-game-mode option:selected').data('game-mode-id');
    refreshMatchupGrid();
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
            const option = `<option data-game-mode-id=${gameMode.id}>${gameMode.name}</option>`;
            $('#select-game-mode').append(option);
        }
    }).catch((error) => {
        console.error(error);
    });
}

function refreshMatchupGrid() {
    fetchMatchupWins().then(function (data) {
        for (const bluParent in data) {
            const row = data[bluParent];
            for (const redParent in row) {
                const wins = data[bluParent][redParent];
                const targetCell = $(`#tracking-grid td[data-blu-parent="${bluParent}"][data-red-parent=${redParent}]`);
                targetCell.attr('data-blu-wins', wins[0]);
                targetCell.attr('data-red-wins', wins[1]);
                const bias = calculateBias(wins[0], wins[1]);
                const opacity = parseInt(Math.abs(bias * 255)).toString(16);
                let shadeColor = '#ffffff';
                if (bias < 0) {
                    shadeColor = BLU_COLOR + opacity;
                } else if (bias > 0) {
                    shadeColor = RED_COLOR + opacity;
                }
                targetCell.css('background-color', shadeColor);
                targetCell.text(bias.toFixed(2));
                highlightSelectedClasses();
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
    const highlight = '<div class="selected-highlight"></div>';
    const highlightTargets = [
        $(`#tracking-grid td[data-blu-parent=${selected.merc.blu}][data-red-parent=${selected.merc.red}]`),
        $(`#tracking-grid th[data-blu-parent=${selected.merc.blu}]`),
        $(`#tracking-grid th[data-red-parent=${selected.merc.red}]`),
        $(`button.merc-select[data-blu-parent=${selected.merc.blu}]`),
        $(`button.merc-select[data-red-parent=${selected.merc.red}]`)
    ];
    $('.selected-highlight').remove();
    for (const target of highlightTargets) {
        $(highlight).appendTo(target);
    }
}

function toggleOverallOverlay() {
    const checked = $('#overall-checkbox').prop('checked');
    if (checked) {
        tempSelected = { ...selected };
        emptyObject(selected);
        $('#select-map').prop('disabled', true);
        $('#select-stage').prop('disabled', true);
        $('#select-game-mode').prop('disabled', true);
        $('#all-maps-checkbox').prop('disabled', true);
        $('#all-stages-checkbox').prop('disabled', true);
        $('#all-game-modes-checkbox').prop('disabled', true);
    } else {
        selected = tempSelected;
        const allMapsChecked = $('#all-maps-checkbox').prop('checked');
        const allStagesChecked = $('#all-stages-checkbox').prop('checked');
        const allGameModesChecked = $('#all-game-modes-checkbox').prop('checked');
        $('#all-maps-checkbox').prop('disabled', false);
        $('#all-stages-checkbox').prop('disabled', allMapsChecked);
        $('#all-game-modes-checkbox').prop('disabled', false);
        $('#select-map').prop('disabled', allMapsChecked);
        $('#select-stage').prop('disabled', allStagesChecked);
        $('#select-game-mode').prop('disabled', allGameModesChecked);
    }
    refreshMatchupGrid();
}

function toggleAllMaps() {
    const checked = $('#all-maps-checkbox').prop('checked');
    $('#select-map').prop('disabled', checked);
    $('#all-stages-checkbox').prop('disabled', checked);
    if (checked) {
        $('#select-stage').prop('disabled', true);
        $('#all-stages-checkbox').prop('checked', true);
        selected.map = null;
        selected.stage = null;
    } else {
        selected.map = $('#select-map option:selected').data('map-id');
    }
    setSelectionBoxStages();
    refreshMatchupGrid();
}

function toggleAllStages() {
    let checked = $('#all-stages-checkbox').prop('checked');
    $('#select-stage').prop('disabled', checked);
    selected.stage = checked ? null : $('#select-stage option:selected').val();
    refreshMatchupGrid();
}

function toggleAllGameModes() {
    let checked = $('#all-game-modes-checkbox').prop('checked');
    $('#select-game-mode').prop('disabled', checked);
    selected.gameMode = checked ? null : $('#select-game-mode option:selected').data('game-mode-id');
    refreshMatchupGrid();
}
