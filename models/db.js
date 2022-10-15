const MongoClient = require('mongodb').MongoClient;

/**
 * 
 * DB connection class in ES5 format
 * Singleton for connecting to the db
 * source https://stackoverflow.com/questions/24547357/setting-up-singleton-connection-with-node-js-and-mongo/30292578
 * @return exposes single Get() method for the db instance, alias for getInstance commonly used
 */

var DbConnection = function () {

    var db = null;
    var instance = 0;

    async function DbConnect() {
        try {
            // connecting to the db
            let uri = "mongodb+srv://admin:7oIdkzlU1JIN3Un6@cluster0.enxjlim.mongodb.net/?retryWrites=true&w=majority";
            
            // setting db instance for the singleton
            let _db = await MongoClient.connect(uri);

            return _db
        } catch (e) {
            return e;
        }
    }
    /**
     * Accessor Function for getting instance of DB
     * @returns instance of db
     */
   async function Get() {
        try {
            instance++;     // this is just to count how many times our singleton is called.

            if (db != null) {
                console.log(`db connection is already alive`);
                return db;
            } else {
                console.log(`getting new db connection`);
                db = await DbConnect();
                return db; 
            }
        } catch (e) {
            return e;
        }
    }

    return {
        Get: Get
    }
}


module.exports = DbConnection();
