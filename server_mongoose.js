const express = require('express');
const mongoose = require('mongoose');
const config = require('config');
const uri = config.dbhost;

mongoose.connect(uri, {
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  useFindAndModify: false
});

const Film = mongoose.model('Film', { // maps onto the "films" collection
  title: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  cast: {
    type: Array,
    required: true
  },
  fullplot: String,
  imdb: Object,
  plot: String,
  genres: [String],
  rated: String,
  metacritic: Number,
  languages: [String],
  writers: [String],
  poster: String,
  num_mflix_comments: Number,
  awards: Object,
  countries: [String],
  cast: [String],
  directors: [String],
  runtime: Number
});

const app = express();
app.use(express.json());

app.get('/films', function (request, response) {  
  Film.find({}, function (error, films) {
    if (error) {
      response.status(500).send(error);
    } else {
      response.status(200).send(films);
    }
  });
});

app.get('/films/:id', function (request, response) {  
  Film.findById(request.params.id, function (error, film) {
    if (error) {
      response.status(500).send(error);
    } else if (film) {
      response.status(200).send(film);
    } else {
      response.sendStatus(404);
    }
  });
});

app.post('/films', function (request, response) {
  const newFilm = new Film(request.body);
  
  newFilm.save(function (error, film) {
    if (error) {
      response.status(500).send(error);
    } else {
      response.status(200).send(film);
    }
  });
});

app.put('/films/:id', function (request, response) {
  const options = { returnOriginal: false };
  
  Film.findByIdAndUpdate(request.params.id, request.body, options, (error, film) => {
    if (error) {
      response.status(500).send(error);
    } else if (film) {
      response.status(200).send(film);
    } else {
      response.sendStatus(404);
    } 
  });
});

app.delete('/films/:id', function (request, response) {
  Film.findByIdAndDelete(request.params.id, (error, film) => {
    if (error) {
      response.status(500).send(error);
    } else if (film) {
      response.sendStatus(204);
    } else {
      response.sendStatus(404);
    }
  });
});

app.listen(3000);


module.exports = app; // for testing