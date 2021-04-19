const DB = require('./db');
const mongo = require('mongodb');
const Blog = require('./blog');

class BlogModel {

    getBlogById(blogId){
        return new Promise((resolve, reject) => {
            var o_id = new mongo.ObjectID(blogId)
            let search = {'_id': o_id};
            
            DB.Get().then((db) => {
                let collection = db.db('blog_db').collection('blogs');

                collection.findOne(search, (err, doc) => {
                    if(err){
                        reject(err);
                    }
                    resolve(doc);
                });
            });
        });
    }

    getBlogByUuid(uuid){
        let search = {'uuid': uuid};
        return new Promise((resolve, reject) => {

            DB.Get().then((db) => {
                let collection = db.db('blog_db').collection('blogs');

                collection.findOne(search, (err, result) => {
                    if(err){
                        reject(err);
                    }
                    if(result){
                        if(result._id){
                            resolve({'id': result._id, 'username': result.username});
                        } else {
                            resolve({res: "User not found"});
                        }
                    }else{
                        resolve({res: "User not found"});
                    }                    
                });
            });
        });
    }

    getAllBlogs(){
        return new Promise((resolve, reject) => {

            DB.Get().then((db) => {
                let collection = db.db('blog_db').collection('blogs');

                collection.find().toArray((err, result) => {
                    if(err){
                        reject(err);
                    }
                    resolve(result);
                });
            }).catch(e => {
                resolve(e);
            });
        });
    }

    insertBlog(blog){
        return new Promise((resolve, reject) => {
            DB.Get().then((db) => {
                let collection = db.db('blog_db').collection('blogs');
                collection.insertOne(blog.toJson(), (err, result) => {
                    if(err){
                        reject(err);
                    }
                    resolve({'id':result.insertedId });
                });
            })
        });
    }

    addComment(blogId, username, comment) {
        return new Promise((resolve, reject) => {
            DB.Get().then((db) => {
                let collection = db.db('blog_db').collection('blogs');
                let query = {_id: new mongo.ObjectID(blogId)}
                let newComment = {$push: {comments: {username: username, comment: comment}}};

                collection.updateOne(query, newComment, (err, result) => {
                    if(err){
                        reject(err);
                    }
                    resolve(result);
                });
            })
        });
    }
}

module.exports = BlogModel;