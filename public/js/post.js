$(document).ready(function() {
    let username = localStorage.getItem("username");
    let id = window.location.href.substring(window.location.href.lastIndexOf('/') + 1);

    if (username != undefined) {
        $(".comment").hide();
        $(".comment-content").prepend("<input class='input block' placeholder='Add comment...'>");

        $(".comment-content input").on("keypress", (event) => {
            let input = $(".comment-content input").val();
            if (input.replace(/\s/g, "").length != 0 && event.key == "Enter") {
                fetch(`http://localhost:8000/blog/comment`, {
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
                        id: id,
                        username: username,
                        comment: input
                    }) // body data type must match "Content-Type" header
                }).then((data) => {
                    location.reload();
                });
            }            
        });
    }
});