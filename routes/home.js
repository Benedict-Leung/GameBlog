var express = require('express');
var router = express.Router();

var homeController = require('../controllers/home');

router.get('/', homeController.home);
router.get('/login', homeController.login);
router.get('/signup', homeController.signup);

module.exports = router;