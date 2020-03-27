const imdb = require('./imdb');
const DENZEL_IMDB_ID = 'nm0000243';
const METASCORE = 77;
const MongoClient = require('mongodb').MongoClient;
const dbConnectionUrl = "mongodb+srv://FrostLohe:Motdepasse123@denzel-99v15.mongodb.net/test?retryWrites=true&w=majority";

function initialize(name, collectionName, success, failure) {
    MongoClient.connect(dbConnectionUrl, function(err, dbInstance) {
        if (err) {
            console.log("Error: ${err}");
            failure(err);
        } 
        else {
            const dbObject = dbInstance.db(name);
            const collection = dbObject.collection(collectionName);
            console.log("Connection successful!");
            success(collection);
        }
    });
}
module.exports = {initialize};