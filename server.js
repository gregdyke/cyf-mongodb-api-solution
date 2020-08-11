const express = require('express');
const mongodb = require('mongodb');
const config = require('config');
const uri = config.dbhost;
const mongoOptions = { useUnifiedTopology: true };
const client = new mongodb.MongoClient(uri, mongoOptions);

const app = express();
app.use(express.json());

client.connect(function () {
  const db = client.db('mongo-week3');

  app.get('/films', function (request, response) {
    const collection = db.collection('films');
    const searchObject = {};

    collection.find(searchObject).toArray(function (error, docs) {
      if (error) {
        response.status(500).send(error);
      } else {
        response.status(200).send(docs);
      }
    });
  });

  app.get('/films/:id', function (request, response) {
    const collection = db.collection('films');
    const id = new mongodb.ObjectId(request.params.id);
    const searchObject = { _id: id };

    collection.findOne(searchObject, function (error, doc) {
      if (error) {
        response.status(500).send(error);
      } else if (doc) {
        response.status(200).send(doc);
      } else {
        response.sendStatus(404);
      }
    });
  });

  app.post('/films', function (request, response) {
    const collection = db.collection('films');
    const data = request.body;

    collection.insertOne(data, function (error, result) {
      if (error) {
        response.status(500).send(error);
      } else {
        response.status(200).send(result.ops[0]);
      }
    });
  });

  app.put('/films/:id', function (request, response) {
    const collection = db.collection('films');
    const id = new mongodb.ObjectId(request.params.id);
    const searchObject = { _id: id };
    delete request.body._id;
    const data = { $set: request.body };
    const options = { returnOriginal: false };

    collection.findOneAndUpdate(searchObject, data, options, function (error, result) {
      if (error) {
        response.status(500).send(error);
      } else if (result.value) {
        response.status(200).send(result.value);
      } else {
        response.sendStatus(404);
      }
    });
  });

  app.delete('/films/:id', function (request, response) {
    const collection = db.collection('films');
    const id = new mongodb.ObjectId(request.params.id);
    const searchObject = { _id: id };

    collection.deleteOne(searchObject, function (error, result) {
      if (error) {
        response.status(500).send(error);
      } else if (result.deletedCount == 1) {
        response.sendStatus(204);
      } else {
        response.sendStatus(404);
      }
    });
  });

  app.listen(3000);
});

module.exports = app; // for testing