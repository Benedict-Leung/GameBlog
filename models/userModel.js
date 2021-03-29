const DB = require('db');

class UserModel {

    getUser(uuid){
        let search = {'_id': Object(uuid)};
        return new Promise((reslove, reject) => {

            let db = await DB.Get();
            let collection = db.db('blogs_db').collection('users');

            collection.findOne(search, (err, doc) => {
                if(err){
                    reject(err);
                }
                reslove(doc);
            });
        });
    }

    getUsersByUserName(username){
        let search = {'name': username};

        return new Promise((reslove, reject) => {

            let db = await DB.Get();
            let collection = db.db('blogs_db').collection('users');

            collection.find(search).toArray((err, result) => {
                if(err){
                    reject(err);
                }
                reslove(result);
            });
        });
    }

    getAllUsers(){
        return new Promise((reslove, reject) => {

            let db = await DB.Get();
            let collection = db.db('blogs_db').collection('users');

            collection.find().toArray((err, result) => {
                if(err){
                    reject(err);
                }
                reslove(result);
            });
        });
    }

    insertUser(){

    }

    updateUser(){

    }
}

module.exports = UserModel;