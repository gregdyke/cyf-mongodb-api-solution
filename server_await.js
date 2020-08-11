const express = require('express');
const mongodb = require('mongodb');
const config = require('config');
const uri = config.dbhost;
const mongoOptions = { useUnifiedTopology: true };
const client = new mongodb.MongoClient(uri, mongoOptions);

const app = express();
app.use(express.json());

const connectPromise = client.connect();

async function getDbCollection(name) {
  await connectPromise;
  return client.db('mongo-week3').collection(name);
}

app.get('/films', async function (request, response) {
  const collection = await getDbCollection('films');
  const searchObject = {};
  
  try {
    const films = await collection.find(searchObject).toArray()
    response.status(200).send(films);
  } catch (error) {
    response.status(500).send(error);
  }
});

app.get('/films/:id', async function (request, response) {
  const collection = await getDbCollection('films');
  const id = new mongodb.ObjectId(request.params.id);
  const searchObject = { _id: id };
   
  try {
    const film = await collection.findOne(searchObject);
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
  const collection = await getDbCollection('films');
  const data = request.body;
  
  try {
    const result = await collection.insertOne(data);
    response.status(200).send(result.ops[0]);
  } catch (error) {
    response.status(500).send(error);
  }
});

app.put('/films/:id', async function (request, response) {
  const collection = await getDbCollection('films');
  const id = new mongodb.ObjectId(request.params.id);
  const searchObject = { _id: id };
  delete request.body._id;
  const data = { $set: request.body };
  const options = { returnOriginal: false };
  
  try {
    const result = await collection.findOneAndUpdate(searchObject, data, options)
    if (result.value) {
      response.status(200).send(result.value);
    } else {
      response.sendStatus(404);
    }
  } catch (error) {
    response.status(500).send(error);
  }
});

app.delete('/films/:id', async function (request, response) {
  const collection = await getDbCollection('films');
  const id = new mongodb.ObjectId(request.params.id);
  const searchObject = { _id: id };
   
  try {
    const result = await collection.deleteOne(searchObject)
    if (result.deletedCount == 1) {
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