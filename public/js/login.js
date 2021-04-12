$(document).ready((e) => {

    $('#login').submit((e) => {
        e.preventDefault();
        const username = $('#username').val();
        const pass = $('#password').val();

        fetch(`http://localhost:8000/home/process-login?username=${username}&password=${pass}`, {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
          }).then(response => { 
            response.json().then(loginSuccess);
          });
    })
});

function loginSuccess(data){
    localStorage.setItem('uuid', data);
    window.location.href = 'http://localhost:8000/home';
}