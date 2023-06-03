$(document).ready(function () {
    $('#tracking-grid td').on('click', matchupTableClickHandler);
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
