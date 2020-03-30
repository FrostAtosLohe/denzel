const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const movieSchema = new Schema({
  link: String,
  metascore: Number,
  synopsis: String,
  title: String,
  year: Number,

});

module.exports = mongoose.model('Movie', movieSchema);