var express = require('express');
var router = express.Router();

var blogController = require('../controllers/blog');

router.get('/', blogController.displayBlogs)
router.get('/new', blogController.newBlog)
router.post('/new', blogController.createBlog)
router.get('/:id', blogController.display)
router.post('/comment', blogController.addComment)

module.exports = router;