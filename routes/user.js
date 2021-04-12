var express = require('express');
var router = express.Router();

var userController = require('../controllers/user');

router.get('/get-user-id', userController.getUserById);

module.exports = router;