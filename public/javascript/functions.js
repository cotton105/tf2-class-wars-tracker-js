$(document).ready(function () {
    setGameModeSelectEnabled();
    setMapSelectEnabled();

    $('#tracking-grid td').on('click', matchupTableClickHandler);
    $('#all-maps').on('click', setMapSelectEnabled);
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

function setGameModeSelectEnabled() {
    let enabled = $('#all-game-modes').prop('checked');
    $('#select-game-mode').prop('disabled', enabled);
}
