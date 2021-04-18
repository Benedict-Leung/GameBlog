var express = require('express');
var router = express.Router();

//var blogController = require('../controllers/blog');

router.get('/', (request, response) => {
    const posts = [{
        title: 'New Game of the Year???',
        date: new Date(),
        description: 'Man, this is my favourite game of all time'
    }]
    response.render('blog', { posts: posts });
})

router.get('/new', (request, response) => {
    response.render('partials/newpost');
})

router.post('/', (request, response) => {

})

module.exports = router;