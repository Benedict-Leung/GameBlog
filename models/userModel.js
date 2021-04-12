const DB = require('./db');
const mongo = require('mongodb');

class UserModel {

    getUserById(uuid){
        var o_id = new mongo.ObjectID(uuid)
        let search = {'_id': o_id};
        return new Promise((reslove, reject) => {

            DB.Get().then((db) => {
                let collection = db.db('blog_db').collection('users');

                collection.findOne(search, (err, doc) => {
                    if(err){
                        reject(err);
                    }
                    reslove(doc);
                });
            });
        });
    }

    getUsersByUserName(username){
        let search = {'name': username};

        return new Promise((reslove, reject) => {

            DB.Get().then((db) => {
                let collection = db.db('blogs_db').collection('users');

                collection.find(search).toArray((err, result) => {
                    if(err){
                        reject(err);
                    }
                    reslove(result);
                });
            });
        });
    }

    getAllUsers(){
        return new Promise((reslove, reject) => {

            DB.Get().then((db) => {
                let collection = db.db('blogs_db').collection('users');

                collection.find().toArray((err, result) => {
                    if(err){
                        reject(err);
                    }
                    reslove(result);
                });
            });
        });
    }

    insertUser(user){
        return new Promise((reslove, reject) => {
            console.log(user.toJson());
            DB.Get().then((db) => {
                let collection = db.db('blog_db').collection('users');

                collection.insertOne(user.toJson(), (err, result) => {
                    if(err){
                        reject(err);
                    }
                    // console.log(result);
                    reslove(result.insertedId);
                });
            })
        });
    }

    updateUser(){

    }
}

module.exports = UserModel;