$(document).ready(function () {
    setMapSelectEnabled();
    setStageSelectEnabled();
    setGameModeSelectEnabled();

    $('#tracking-grid td').on('click', matchupTableClickHandler);
    $('#all-maps').on('click', setMapSelectEnabled);
    $('#all-stages').on('click', setStageSelectEnabled);
    $('#all-game-modes').on('click', setGameModeSelectEnabled);
});

const selectedMercs = {
    blu: null,
    red: null
};

function matchupTableClickHandler() {
    let parents = $(this).data('parents');
    selectedMercs.blu = parents.blu;
    selectedMercs.red = parents.red;
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
