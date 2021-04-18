var express = require('express');
const Blog = require('../models/blog');
const BlogModel = require('../models/blogModel');
var router = express.Router();

//var blogController = require('../controllers/blog');

router.get('/', (request, response) => {

    // example usage of model
    const model = new BlogModel();
    model.getAllBlogs().then((data) => {
        console.log(data);

        // can use this when creating a new blog in the /new route
        // here can use data straight from db
        const testBlog = new Blog('New Game of the Year???', new Date(), 'Man, this is my favourite game of all time');
        const testJson = testBlog.toJson();
        
        // for getting all the posts from the db use the line below comment the other line out
        // const posts = data;
        const posts = [testJson];

        response.render('blog', { posts: posts });
    }); 
})

router.get('/new', (request, response) => {
    response.render('partials/newpost');
})

// use the insertBlog() and Blog dataclass to create a new blog to insert
router.post('/new', (request, response) => {

})

module.exports = router;