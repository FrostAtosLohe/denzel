const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const {PORT} = require('./constants');
const nodemon = require('nodemon');
const db = require("./initialize");
const name = "imdb";
const collectionName = "movies";
const app = express();
const url = require('url')
var express_graphql = require('express-graphql');
var { buildSchema } = require('graphql');
const imdb = require('./imdb');
const DENZEL_IMDB_ID = 'nm0000243';
const METASCORE = 77;

module.exports = app;

app.use(require('body-parser').json());
app.use(cors());
app.use(helmet());

app.options('*', cors());

db.initialize(name, collectionName, function(collection) {
//Populate the database with all the Denzel's movies from IMDb.
  app.get("/movies/populate/nm0000243",async (request, response) => {
  	actor = DENZEL_IMDB_ID
  	metascore = METASCORE
    console.log(`📽️  fetching filmography of ${actor}...`);
    const movies = await imdb(actor);
    const awesome = movies.filter(movie => movie.metascore >= metascore);
    var myobj = movies;
    console.log("Checking for updates...")
    myobj.forEach(item =>{
      collection.find({"synopsis":item.synopsis}).toArray(function(err, result) {
          if (err) throw err;
          if(result.length == 0){
            collection.insertOne(item,function(err,res){
              console.log("inserted");
  					})
          }
      });
    });
  response.json({"total":movies.length});
  });

//Fetch a random must-watch movie.
  app.get("/movies", (request, response) => {
  	var query = {
      metascore: {
        $gte: 70
      }
    };
    collection.find({ $query: query }).toArray((error, result) => {
      if (error) throw error;
      var rnd = Math.floor(Math.random() * (Math.floor(result.length-1)));
      response.json(result[rnd]);
    });
  });

//Fetch a specific movie.
//Tested with the id tt0097880 (should return "The Mighty Quinn(1989)")
  app.get("/movies/:id", (request, response) => {
  	const itemId = request.params.id;
  	var query = {
      id: itemId
    };
    collection.findOne({ $query: query }, (error, result) => {
      if (error) throw error;
      response.json(result);
    });
  });

//Search for Denzel's movies.
//Can't use /movies/search as it will try to find a movie with "search" as id.
  app.get('/search', (request, response) => {
  	var urlParams = new url.URLSearchParams(request.query);
  	const Idlimit = parseInt(request.query.limit);
  	const Idmeta = parseInt(request.query.metascore);
  	var query = {
      metascore: {
        $gte: Idmeta
      }
    };
    collection.aggregate([{ $match: {metascore: {$gte: Idmeta}}},{ $sort: { metascore: -1}},{ $limit: Idlimit }]).toArray(function(error, result){
      if (error) throw error;
      response.json({"limit": Idlimit, "total":result.length, "results":result});
    });
  });

//Save a watched date and a review.
  app.post("/movies/:id", (request, response) => {      
    collection.update({"id" : request.params.id} ,{'$set': {"review":request.body.review, "date":request.body.date}} , (error, result) => {
      if (error) console.log(error);
      response.json(result);
    });
  });

}, function(err) {throw (err);});

app.listen(PORT, () => {console.log(`📡 Running on port ${PORT}`);});