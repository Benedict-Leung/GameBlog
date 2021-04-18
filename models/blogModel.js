const DB = require('./db');
const mongo = require('mongodb');
const Blog = require('./blog');

class BlogModel {

    getBlogById(blogId){
        var o_id = new mongo.ObjectID(blogId)
        let search = {'_id': o_id};
        return new Promise((reslove, reject) => {

            DB.Get().then((db) => {
                let collection = db.db('blog_db').collection('blogs');

                collection.findOne(search, (err, doc) => {
                    if(err){
                        reject(err);
                    }
                    reslove(doc);
                });
            });
        });
    }

    getBlogByUuid(uuid){
        let search = {'uuid': uuid};
        return new Promise((reslove, reject) => {

            DB.Get().then((db) => {
                let collection = db.db('blog_db').collection('blogs');

                collection.findOne(search, (err, result) => {
                    if(err){
                        reject(err);
                    }
                    if(result){
                        if(result._id){
                            reslove({'id': result._id, 'username': result.username});
                        } else {
                            reslove({res: "User not found"});
                        }
                    }else{
                        reslove({res: "User not found"});
                    }
                    
                    
                });
            });
        });
    }

    getAllBlogs(){
        return new Promise((reslove, reject) => {

            DB.Get().then((db) => {
                let collection = db.db('blog_db').collection('blogs');

                collection.find().toArray((err, result) => {
                    if(err){
                        reject(err);
                    }
                    reslove(result);
                });
            }).catch(e => {
                reslove(e);
            });
        });
    }

    insertBlog(blog){
        return new Promise((reslove, reject) => {
            user.encodePass();
            DB.Get().then((db) => {
                let collection = db.db('blog_db').collection('blogs');
                collection.insertOne(blog.toJson(), (err, result) => {
                    if(err){
                        reject(err);
                    }
                    reslove({'id':result.insertedId });
                });
            })
        });
    }

    updateBlog(blogId){

    }
}

module.exports = BlogModel;