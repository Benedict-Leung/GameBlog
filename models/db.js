const MongoClient = require('mongodb').MongoClient;

/**
 * 
 * DB connection class
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
            let uri = "mongodb+srv://webDevFinalDBuser:eZynHiWNwzS81Drc@cluster0.jrs0s.mongodb.net/blog_db?retryWrites=true&w=majority";
            let client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
            
            // setting db instance for the singleton
            let _db = await client.connect(url);

            return _db
        } catch (e) {
            return e;
        }
    }

   async function Get() {
        try {
            instance++;     // this is just to count how many times our singleton is called.
            console.log(`DbConnection called ${instance} times`);

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
