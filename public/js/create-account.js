let myStorage = window.localStorage;

$(document).ready((e) => {
  $("#create-account").submit((e) => {
    e.preventDefault();

    //load the file
    const file = $("#profile-pic").get(0).files[0];

    // encode the file using the FileReader API
    const reader = new FileReader();
    reader.onloadend = () => {
      // use a regex to remove data url part
      const base64String = reader.result
        .replace("data:", "")
        .replace(/^.+,/, "");
      const username = $("#username").val();
      const pass = $("#password").val();

      console.log(username, pass);

      fetch(`http://localhost:8000/home/signup`, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
          'Content-Type': 'application/json'
        //   'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'manual', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify({
            username: username,
            password: pass,
            profilePic: base64String,
          }) // body data type must match "Content-Type" header
      }).then(response => { 
        response.json().then(createAccountSuccess);
      });
    };
    reader.readAsDataURL(file);
  });
});

function createAccountSuccess(data) {
    console.log(data);
    localStorage.setItem('uuid', data.id);
    localStorage.setItem('username', data.username);
    window.location.href = 'http://localhost:8000/home';
}
