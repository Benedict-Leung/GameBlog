exports.home = function(request, response) {
    response.sendFile(viewPath + "/frontpage.html");
};