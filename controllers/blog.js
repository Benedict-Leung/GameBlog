const Blog = require('../models/blog');
const BlogModel = require('../models/blogModel');

exports.displayBlogs = function(_, response) {
    // example usage of model
    const model = new BlogModel();
    model.getAllBlogs().then((data) => {
        response.render('blog', { posts: data.reverse() });
    }).catch((err) => {
        console.log(err)
        response.render('blog', { posts: [] });
    }); 
}

exports.newBlog = function(_, response) {
    response.render('partials/newpost');
}

exports.createBlog = function(request, response) {
    const model = new BlogModel();
    const blog = Blog.fromJsonFactory(request.body);

    if (blog != undefined) {
        model.insertBlog(blog).then((res) => {
            response.redirect("/blog");
        });
    }
}

exports.display = function (request, response) {
    const model = new BlogModel();

    model.getBlogById(request.params.id).then((data) => {
        response.render('post', { post: data });
    }).catch(() => {
        response.redirect("/blog");
    });
}

exports.addComment = function (request, response) {
    const model = new BlogModel();
    model.addComment(request.body.id, request.body.username, request.body.comment).then((data) => {
        response.send(data);
    });
}