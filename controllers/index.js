exports.index = function(request, response) {
    response.sendFile('/public/index.html', {root: __dirname})
};