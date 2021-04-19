const { fromJsonFactory } = require('../models/user');
const User = require('../models/user');
const UserModel = require('../models/userModel');



exports.home = function(request, response) {
    response.render('frontpage');
};

exports.login = function(request, response) {
    response.render('login');
};

exports.loginProcess = function(request, response) {
    const username = request.query.username;
    const password = request.query.password;
    const model = new UserModel();
    model.getUsersByUserNameAndPassword(username, password).then((res) => {
        response.send(res);
    });
};

exports.signup = function(request, response) {
    response.render('createaccount');
};

exports.signupPost = function(request, response){
    const newUser = User.fromJsonFactory(request.body);
    const model = new UserModel();
    model.insertUser(newUser).then((res) => {
        response.send(res);
    });
}