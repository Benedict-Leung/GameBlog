const DB = require('./db');
const mongo = require('mongodb');
var md5 = require('md5');

class UserModel {
    getUserById(uuid){
        var o_id = new mongo.ObjectId(uuid)
        let search = {'_id': o_id};

        return new Promise((resolve, reject) => {
            DB.Get().then((db) => {
                let collection = db.db('blog_db').collection('users');

                collection.findOne(search)
                .then(result => {
                    resolve(result);
                }).catch(e => {
                    reject(e);
                });
            });
        });
    }

    getUsersByUserNameAndPassword(username, password){
        let search = {'username': username, password: md5(password)};

        return new Promise((resolve, reject) => {

            DB.Get().then((db) => {
                let collection = db.db('blog_db').collection('users');

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

    getAllUsers(){
        return new Promise((resolve, reject) => {

            DB.Get().then((db) => {
                let collection = db.db('blogs_db').collection('users');

                collection.find().toArray().then(result => {
                    resolve(result);
                }).catch(e => {
                    reject(e);
                });
            });
        });
    }

    insertUser(user){
        return new Promise((reslove, reject) => {
            user.encodePass();
            DB.Get().then((db) => {
                let collection = db.db('blog_db').collection('users');

                collection.insertOne(user.toJson())
                .then(result => {
                    reslove({'id':result.insertedId, 'username':user.getUserName()});
                }).catch(e => {
                    reject(e);
                });
            })
        });
    }

    updateUser() {

    }
}

module.exports = UserModel;