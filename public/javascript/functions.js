$(document).ready(function () {

    $('#tracking-grid td').on('click', matchupTableClickHandler);

});

function matchupTableClickHandler() {
    let parents = $(this).data('parents');
    console.log(parents);
}
