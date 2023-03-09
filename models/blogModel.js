const DB = require('./db');
const mongo = require('mongodb');

class BlogModel {

    getBlogById(blogId){
        return new Promise((resolve, reject) => {
            var o_id = new mongo.ObjectId(blogId)
            let search = {'_id': o_id};
            
            DB.Get().then((db) => {
                let collection = db.db('blog_db').collection('blogs');

                collection.findOne(search).then(result => {
                    resolve(result);
                }).catch(e => {
                    reject(e);
                });
            });
        });
    }

    getBlogByUuid(uuid){
        let search = {'uuid': uuid};
        return new Promise((resolve, reject) => {

            DB.Get().then((db) => {
                let collection = db.db('blog_db').collection('blogs');

                collection.findOne(search)
                .then(result => {
                    if (result) {
                        if (result._id) {
                            resolve({'id': result._id, 'username': result.username});
                        } else {
                            resolve({res: "User not found"});
                        }
                    } else {
                        resolve({res: "User not found"});
                    }
                }).catch(e => {
                    reject(e);
                });
            });
        });
    }

    getAllBlogs(){
        return new Promise((resolve, reject) => {

            DB.Get().then((db) => {
                let collection = db.db('blog_db').collection('blogs');

                collection.find().toArray()
                .then(result => {
                    resolve(result);
                }).catch(e => {
                    reject(e);
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
                
                collection.insertOne(blog.toJson())
                .then(result => {
                    resolve({'id':result.insertedId })
                }).catch(e => {
                    reject(e);
                });
            })
        });
    }

    addComment(blogId, username, comment) {
        return new Promise((resolve, reject) => {
            DB.Get().then((db) => {
                let collection = db.db('blog_db').collection('blogs');
                let query = {_id: new mongo.ObjectId(blogId)}
                let newComment = {$push: {comments: {username: username, comment: comment}}};

                collection.updateOne(query, newComment)
                .then(result => {
                    resolve(result);
                }).catch(e => {
                    reject(e);
                });
            })
        });
    }
}

module.exports = BlogModel;