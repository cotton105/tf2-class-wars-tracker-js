$(document).ready(function () {
    selected = {
        merc: {
            blu: null,
            red: null
        },
        server: null,
        map: null,
        stage: null,
        gameMode: null,
        overall: null
    };
    tempSelected = selected;
    try {
        const selectionCookie = getCookie('selected');
        const tempSelectionCookie = getCookie('tempSelected');
        if (selectionCookie) {
            selected = JSON.parse(selectionCookie);
        }
        if (tempSelectionCookie) {
            tempSelected = JSON.parse(tempSelectionCookie);
        }
    } catch (error) {
        console.error(error);
    }
    $('#all-servers-checkbox').prop('checked', !selected.server);
    $('#all-maps-checkbox').prop('checked', !selected.map);
    $('#all-stages-checkbox').prop('checked', !selected.stage);
    $('#all-stages-checkbox').prop('disabled', !selected.map);
    $('#all-game-modes-checkbox').prop('checked', !selected.gameMode);
    $('#select-server').prop('disabled', !selected.server);
    $('#select-map').prop('disabled', !selected.map);
    $('#select-stage').prop('disabled', !selected.stage);
    $('#select-game-mode').prop('disabled', !selected.gameMode);
    if (selected.overall) {
        $('#overall-checkbox').prop('checked', true);
        $('#all-servers-checkbox').prop('disabled', true);
        $('#all-servers-checkbox').prop('checked', !tempSelected.server);
        $('#all-maps-checkbox').prop('disabled', true);
        $('#all-maps-checkbox').prop('checked', !tempSelected.map);
        $('#all-stages-checkbox').prop('disabled', true);
        $('#all-stages-checkbox').prop('checked', !tempSelected.stage);
        $('#all-game-modes-checkbox').prop('disabled', true);
        $('#all-game-modes-checkbox').prop('checked', !tempSelected.gameMode);
    }
    setSelectionBoxServers();
    setSelectionBoxMaps();
    setSelectionBoxStages();
    setSelectionBoxGameModes();
    refreshMatchupGrid();

    $('.record-win-button').on('click', updateWinCount);
    $('.merc-select-grid button').on('click', setSelectedClasses);
    $('#tracking-grid th, td').on('click', setSelectedClasses);

    $('#select-server').on('change', setSelectedServer);
    $('#select-map').on('change', setSelectedMap);
    $('#select-stage').on('change', setSelectedStage);
    $('#select-game-mode').on('change', setSelectedGameMode);
    $('#overall-checkbox').on('click', toggleOverallOverlay);

    $('#all-servers-checkbox').on('click', toggleAllServers);
    $('#all-maps-checkbox').on('click', toggleAllMaps);
    $('#all-stages-checkbox').on('click', toggleAllStages);
    $('#all-game-modes-checkbox').on('click', toggleAllGameModes);
});

let selected;
let tempSelected;

const BLU_COLOR = '#abcbff';
const RED_COLOR = '#ff7d7d';

async function setSelectionBoxServers() {
    try {
        const servers = await fetchServers();
        for (let server of servers) {
            $('#select-server').append(`<option data-server-id='${server.serverID}'>${server.serverName}</option>`);
        }
        const selectedServerID = tempSelected.server || selected.server;
        $(`#select-server option[data-server-id='${selectedServerID}']`).prop('selected', true);
    } catch (error) {
        console.error(error);
    }
}

function setSelectionBoxMaps() {
    fetchMaps().then((maps) => {
        for (let map of maps) {
            $('#select-map').append(`<option data-map-id='${map.mapID}'>${map.mapName}</option>`);
        }
        const selectedMapID = tempSelected.map || selected.map;
        $(`#select-map option[data-map-id='${selectedMapID}']`).prop('selected', true);
    })
    .catch((error) => {
        console.error(error);
    });
}

function setSelectionBoxStages() {
    fetchMapStages().then((stages) => {
        $('#select-stage option').remove();
        for (let stage of stages) {
            $('#select-stage').append(`<option data-stage-num='${stage}'>${stage}</option>`);
        }
        const stageNum = tempSelected.stage || selected.stage;
        $(`#select-stage option[data-stage-num='${stageNum}']`).prop('selected', true);
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
        const selectedID = tempSelected.gameMode || selected.gameMode;
        $(`#select-game-mode option[data-game-mode-id='${selectedID}']`).prop('selected', true);
    }).catch((error) => {
        console.error(error);
    });
}

function setSelectedServer() {
    updateSelected('server', $('#select-server option:selected').data('server-id'));
    refreshMatchupGrid();
}

function setSelectedMap() {
    updateSelected('map', $('#select-map option:selected').data('map-id'));
    const allStagesChecked = $('#all-stages-checkbox').prop('checked');
    updateSelected('stage', allStagesChecked ? null : 1);
    setSelectionBoxStages();
    refreshMatchupGrid();
}

function setSelectedStage() {
    updateSelected('stage', $('#select-stage option:selected').val());
    refreshMatchupGrid();
}

function setSelectedGameMode() {
    updateSelected('gameMode', $('#select-game-mode option:selected').data('game-mode-id'));
    refreshMatchupGrid();
}

async function refreshMatchupGrid() {
    try {
        const data = await fetchMatchupWins();
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
    } catch (error) {
        console.error(error);
    }
}

function setSelectedClasses() {
    if ($(this).data('blu-parent') == null && $(this).data('red-parent') == null) {
        updateSelected('merc', { blu: null, red: null });
    } else {
        const currentSelection = JSON.parse(getCookie('selected'));
        updateSelected('merc', {
            blu: $(this).data('blu-parent') ?? currentSelection.merc.blu,
            red: $(this).data('red-parent') ?? currentSelection.merc.red
        });
    }
    highlightSelectedClasses();
    const currentSelection = JSON.parse(getCookie('selected'));
    console.log(currentSelection.merc);
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
        tempSelected = { map: selected.map, stage: selected.stage, gameMode: selected.gameMode };
        selected = { map: null, stage: null, gameMode: null, merc: { ...selected.merc }, overall: true };
        setCookie('tempSelected', JSON.stringify(tempSelected));
        setCookie('selected', JSON.stringify(selected));
        $('#select-server').prop('disabled', true);
        $('#select-map').prop('disabled', true);
        $('#select-stage').prop('disabled', true);
        $('#select-game-mode').prop('disabled', true);
        $('#all-servers-checkbox').prop('disabled', true);
        $('#all-maps-checkbox').prop('disabled', true);
        $('#all-stages-checkbox').prop('disabled', true);
        $('#all-game-modes-checkbox').prop('disabled', true);
    } else {
        selected = { ...selected, ...tempSelected, overall: false };
        tempSelected = null;
        setCookie('selected', JSON.stringify(selected));
        deleteCookie('tempSelected');
        const allServersChecked = $('#all-servers-checkbox').prop('checked');
        const allMapsChecked = $('#all-maps-checkbox').prop('checked');
        const allStagesChecked = $('#all-stages-checkbox').prop('checked');
        const allGameModesChecked = $('#all-game-modes-checkbox').prop('checked');
        $('#all-servers-checkbox').prop('disabled', false);
        $('#all-maps-checkbox').prop('disabled', false);
        $('#all-stages-checkbox').prop('disabled', allMapsChecked);
        $('#all-game-modes-checkbox').prop('disabled', false);
        $('#select-server').prop('disabled', allServersChecked);
        $('#select-map').prop('disabled', allMapsChecked);
        $('#select-stage').prop('disabled', allStagesChecked);
        $('#select-game-mode').prop('disabled', allGameModesChecked);
    }
    refreshMatchupGrid();
}

function toggleAllServers() {
    const checked = $('#all-servers-checkbox').prop('checked');
    $('#select-server').prop('disabled', checked);
    updateSelected('server', checked ? null : $('#select-server option:selected').data('server-id'));
    refreshMatchupGrid();
}

function toggleAllMaps() {
    const checked = $('#all-maps-checkbox').prop('checked');
    $('#select-map').prop('disabled', checked);
    $('#all-stages-checkbox').prop('disabled', checked);
    if (checked) {
        $('#select-stage').prop('disabled', true);
        $('#all-stages-checkbox').prop('checked', true);
        updateSelected('map', null);
        updateSelected('stage', null);
    } else {
        updateSelected('map', $('#select-map option:selected').data('map-id'));
    }
    setSelectionBoxStages();
    refreshMatchupGrid();
}

function toggleAllStages() {
    const checked = $('#all-stages-checkbox').prop('checked');
    $('#select-stage').prop('disabled', checked);
    updateSelected('stage', checked ? null : $('#select-stage option:selected').val());
    refreshMatchupGrid();
}

function toggleAllGameModes() {
    const checked = $('#all-game-modes-checkbox').prop('checked');
    $('#select-game-mode').prop('disabled', checked);
    updateSelected('gameMode', checked ? null : $('#select-game-mode option:selected').data('game-mode-id'));
    refreshMatchupGrid();
}

function updateSelected(selection, value) {
    selected[selection] = value;
    setCookie('selected', JSON.stringify(selected));
}
