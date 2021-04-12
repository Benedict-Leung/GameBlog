myStorage = window.localStorage;

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
        localStorage.removeItem('uuid');
        window.location.reload();
    })
});

function loginSuccess(data){
    console.log(data);
    $('#user-info-name').text(data.username);
    $('#user-info-image').attr('src', 'data:image/png; base64,' + data.imageString)

    $('.logged-in-content').show();
    $('.logged-out-content').hide();
}