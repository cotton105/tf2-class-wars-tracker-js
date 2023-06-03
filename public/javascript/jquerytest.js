$(document).ready(() => {
    $('button').on('click', () => {
        console.log($(this));
        $(this).prop('display', 'none');
    });
});