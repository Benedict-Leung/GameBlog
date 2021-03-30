exports.home = function(request, response) {
    response.render('frontpage');
};

exports.login = function(request, response) {
    response.render('login');
};

exports.signup = function(request, response) {
    response.render('createaccount');
};