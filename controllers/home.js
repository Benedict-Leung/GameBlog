const { fromJsonFactory } = require('../models/user');
const User = require('../models/user');
const UserModel = require('../models/userModel');



exports.home = function(request, response) {
    response.render('frontpage');
    console.log("showing homepage")
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
    // console.log(request.body);
    const newUser = User.fromJsonFactory(request.body);
    console.log(newUser)
    const model = new UserModel();
    model.insertUser(newUser).then((res) => {
        response.send(res);
    });
}