let myStorage = window.localStorage;

$(document).ready((e) => {
    
    const uuid = localStorage.getItem('uuid');

    if(uuid){
        fetch(`http://localhost:8000/user/get-user-id?uuid=${uuid}`, {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            headers: {
            //   'Content-Type': 'application/json'
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
          }).then(response => { 
            response.json().then(loginSuccess);
          });
    }

    $('#logout').click((e) => {
        e.preventDefault();
        localStorage.clear();
        window.location.reload();
    });

    // Get all "navbar-burger" elements
    const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);

    // Check if there are any navbar burgers
    if ($navbarBurgers.length > 0) {

    // Add a click event on each of them
        $navbarBurgers.forEach( el => {
            el.addEventListener('click', () => {

                // Get the target from the "data-target" attribute
                const target = el.dataset.target;
                const $target = document.getElementById(target);

                // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
                el.classList.toggle('is-active');
                $target.classList.toggle('is-active');
            });
        });
    }
});

function loginSuccess(data){
    $('#user-info-name').text(data.username);
    $('#user-info-image').attr('src', 'data:image/png; base64,' + data.imageString)

    $('.logged-in-content').show();
    $('.logged-out-content').hide();
}