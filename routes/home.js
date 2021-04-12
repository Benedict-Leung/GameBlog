var express = require('express');
var router = express.Router();

var homeController = require('../controllers/home');

router.get('/', homeController.home);
router.get('/login', homeController.login);
router.get('/process-login', homeController.loginProcess);
router.get('/signup', homeController.signup);
router.post('/signup', homeController.signupPost);


module.exports = router;