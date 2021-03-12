exports.index = function(request, response) {
    response.sendFile(appRoot + '/public/index.html');
};