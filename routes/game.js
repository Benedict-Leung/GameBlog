var express = require('express');
var router = express.Router();

var mainController = require('../controllers/game');

router.get('/', mainController.index);

module.exports = router;