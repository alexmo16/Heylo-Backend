let MongoClient = require('mongodb').MongoClient;

class Read {
    static findOne(collection, data = {}, next) {
        MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true }, function(err, db) {
            if (err) next(err, null);
            let dbo = db.db(process.env.MONGO_MAIN_DB);
            console.log(data);
            dbo.collection(collection).findOne(data, function(err, result) {
                if (err) next(err, null);
                next(null, result);
            });
        });
    }
}

module.exports = Read;
