const User = require('../models/user');
const UserModel = require('../models/userModel');

exports.getUserById = function(request, response) {
    const id = request.query.uuid;
    console.log(id)
    const model = new UserModel();
    model.getUserById(id).then((res) => {
        response.send(res);
    });
};