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

app.get('/films', async function (request, response) {  
  try {
    const films = await Film.find({}).exec();
    response.status(200).send(films);
  } catch (error) {
    response.status(500).send(error);
  }
});

app.get('/films/:id', async function (request, response) {  
  try {
    const film = await Film.findById(request.params.id).exec();
    if (film) {
      response.status(200).send(film);
    } else {
      response.sendStatus(404);
    }
  } catch (error) {
    response.status(500).send(error);
  }
});

app.post('/films', async function (request, response) {
  const film = new Film(request.body);
  try {
    await film.save()
    response.status(200).send(film);
  } catch (error) {
    response.status(500).send(error);
  }
});

app.put('/films/:id', async function (request, response) {
  const options = { returnOriginal: false };
  try {
    const film = await Film.findByIdAndUpdate(request.params.id, request.body, options).exec();
    if (film) {
      response.status(200).send(film);
    } else {
      response.sendStatus(404);
    } 
  } catch (error) {
    response.status(500).send(error);
  }
});

app.delete('/films/:id', async function (request, response) {
  try {
    const film = await Film.findByIdAndDelete(request.params.id).exec();
    if (film) {
      response.sendStatus(204);
    } else {
      response.sendStatus(404);
    }
  } catch (error) {
    response.status(500).send(error);
  }
});

app.listen(3000);


module.exports = app; // for testing