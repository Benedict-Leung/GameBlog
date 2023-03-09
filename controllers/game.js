exports.index = function(_, response) {
    response.sendFile(appRoot + '/public/game.html');
};