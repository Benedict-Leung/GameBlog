const DB = require('./db');
const mongo = require('mongodb');
var md5 = require('md5');

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

    getUsersByUserNameAndPassword(username, password){
        let search = {'username': username, password: md5(password)};
        console.log(search);

        return new Promise((reslove, reject) => {

            DB.Get().then((db) => {
                let collection = db.db('blog_db').collection('users');

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
            user.encodePass();
            DB.Get().then((db) => {
                let collection = db.db('blog_db').collection('users');
                collection.insertOne(user.toJson(), (err, result) => {
                    if(err){
                        reject(err);
                    }
                    console.log(result);
                    reslove({'id':result.insertedId, 'username':user.getUserName()});
                });
            })
        });
    }

    updateUser(){

    }
}

module.exports = UserModel;