$(document).ready((e) => {

    $('#login').submit((e) => {
        e.preventDefault();
        $('.error').hide();
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
    if(!data.id){
        $('.error').show();
        $('.error').text(data.res);
    }else{
        localStorage.setItem('uuid', data.id);
        localStorage.setItem('username', data.username);
        window.location.href = 'http://localhost:8000/home';
    }


}