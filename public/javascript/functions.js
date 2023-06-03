$(document).ready(function () {
    setMapSelectEnabled();
    setStageSelectEnabled();
    setGameModeSelectEnabled();

    $('.record-win').on('click', getMercenaries);  //TODO: change function, current is just for testing
    $('#tracking-grid td').on('click', matchupTableClickHandler);
    $('#all-maps').on('click', setMapSelectEnabled);
    $('#all-stages').on('click', setStageSelectEnabled);
    $('#all-game-modes').on('click', setGameModeSelectEnabled);
});

const listenAddress = window.location.origin;
const selectedMercs = {
    blu: null,
    red: null
};

function getMercenaries() {
    $.ajax({
        url: `${listenAddress}/api/getMercenaries`
    })
    .done((data) => {
        console.log(data);
    });
}

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
