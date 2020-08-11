const mongodb = require("mongodb");

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server_mongoose_await');
const should = chai.should();
const expect = chai.expect;

process.env["NODE_CONFIG_DIR"] = __dirname + "../config/";
const config = require("config");

const uri = config.dbhost;

chai.use(chaiHttp);
//Our parent block

function dbConnectCollection(callback) {
  const client = new mongodb.MongoClient(uri, { useUnifiedTopology: true });
  client.connect(() => {
    callback(client.db("mongo-week3").collection("films"), client);
  });
}

function getFilmById(id, callback) {
  dbConnectCollection((films, client) => {
    films.findOne({_id:mongodb.ObjectId(id)}, (err, res) => {
      client.close()
      callback(err, res)
    })
  })
}

function insertFilm(film, callback) {
  dbConnectCollection((films, client) => {
    films.insertOne(film, (err, res) => {
      client.close()
      callback(err, res.ops[0])
    })
  })
}

function deleteFilmById(id, callback) {
  dbConnectCollection((films, client) => {
   films.deleteOne({_id:mongodb.ObjectId(id)}, (err) => {
      client.close()
      callback(err)
    })
  })
}

function verifyFilm(expected, actual) {
  delete actual.__v; // mongoose adds this __v
  actual.title.should.equal(expected.title)
  actual.year.should.equal(actual.year)
  Object.keys(actual).should.have.members(Object.keys(expected))
  Object.keys(expected).should.have.members(Object.keys(actual))
}

describe('Films', () => {
  beforeEach((done) => { //Before each test we empty the database of TEST titles
    dbConnectCollection((films, client) => {
      films.deleteMany({title: /^TEST/}, () => {
	client.close()
	done()
      })
    });             
  });

  describe('GET /films/:id', () => {
    it('GET should return an existing document', (done) => {
      insertFilm(getTestFilm(), (err, film) => { 
	chai.request(server)
          .get('/films/'+film._id)
          .end(assertAsync(done, (err, res) => {
	    res.should.have.status(200)
            res.body.should.be.a('object')
	    res.body._id.should.equal(film._id.toString())
	  }))
      })
    })

    it('GET should return 404 on a non-existing document', (done) => {
      insertFilm(getTestFilm(), (err, film) => { 
	deleteFilmById(film._id, () => {
	  chai.request(server)
            .get('/films/'+film._id)
            .end(assertAsync(done, (err, res) => {
	      res.should.have.status(404)
	    }))
	})
      })
    })
  })

  describe('GET /films/', () => {
    it('GET should return an array of all films', (done) => {
      chai.request(server)
        .get('/films/')
        .end(assertAsync(done, (err, res) => {
	  res.should.have.status(200)
          res.body.should.be.a('array')
	  res.body.length.should.be.at.least(500)
	}))
    }) 
  })
  
  describe('POST /films', () => {
    it('POST should return a document that is persisted to mongodb', (done) => {
      film = getTestFilm()
      chai.request(server)
        .post('/films')
	.send(film)
        .end((err, res) => {
	  try {
            res.should.have.status(200)
            res.body.should.be.a('object')
	    film._id = "dummy id"
            verifyFilm(film, res.body)
	    getFilmById(res.body._id, (err, film) => {
	      try {
		expect(film, "film should be found on db with id:" + res.body._id).to.exist
		done()
	      } catch (e) {
		done(e)
	      }
	    })
	  } catch (e) {
	    done(e)
	  }
        });
    });
  });

  describe('PUT /films/:id', () => {
    it('PUT should return an updated document that is persisted to mongodb', (done) => {
      insertFilm(getTestFilm(), (err, film) => {
	film.title = "TEST after update"
	film.year = 1015
	chai.request(server)
          .put('/films/'+ film._id)
	  .send(film)
          .end((err, res) => {
	    try {
              res.should.have.status(200)
              res.body.should.be.a('object')
              verifyFilm(film, res.body)
	      getFilmById(res.body._id, (err, film) => {
		try {
		  expect(film, "film should be found on db with id:" + res.body._id).to.exist
		  done()
		} catch (e) {
		  done(e)
		}
	      })
	    } catch (e) {
	      done(e)
	    }
          });
      })
    });

    it('PUT should return 404 on a non existent document id', (done) => {
      insertFilm(getTestFilm(), (err, film) => {
	deleteFilmById(film._id, () => {
	  chai.request(server)
            .put('/films/'+ film._id)
	    .send(film)
            .end(assertAsync(done, (err, res) => {
	      res.should.have.status(404)
            }));
	})
      })
    });

    it('PUT should return status 500 if the id in the body does not match the root param', (done) => {
      insertFilm(getTestFilm(), (err, film) => {
	const id = film._id
	film._id = "5f2b605f821f89025ab21f0a"
	chai.request(server)
          .put('/films/' + id)
	  .send(film)
          .end(assertAsync(done, (err, res) => {
            res.should.have.status(500)
          }));
      })
    });

    function testFilmBodyVariant(modify, done) {
      insertFilm(getTestFilm(), (err, film) => {
	modify(film)
	chai.request(server)
	  .put('/films/' + film._id)
	  .send(film)
	  .end(assertAsync(done, (err, res) => {
	    console.log(res.body)
            res.should.have.status(422)
	  }));
      })
    }

  });

 describe('DELETE /films/:id', () => {
    it('DELETE should return 204 on a successful delete', (done) => {
      insertFilm(getTestFilm(), (err, film) => {
	chai.request(server)
          .delete('/films/'+ film._id)
          .end(assertAsync(done, (err, res) => {
            res.should.have.status(204)
          }));
      })
    });

    it('DELETE should return 404 when trying to delete a non existent document', (done) => {
      insertFilm(getTestFilm(), (err, film) => {
	deleteFilmById(film._id, () => {
	  chai.request(server)
            .delete('/films/'+ film._id)
            .end(assertAsync(done, (err, res) => {
	      res.should.have.status(404)
            }));
	})
      })
    });

 })

});

function assertAsync(callback, assertion) {
  return (...args) => {
    try {
      assertion(...args)
      callback()
    } catch (e) {
      callback(e)
    }
  }
}

function getTestFilm() {
  return {
    "fullplot": "full plot goes here",
    "imdb": {
      "rating": 8.3,
      "votes": 99845,
      "id": 17136
    },
    "year": 1927,
    "plot": "In a futuristic city sharply divided between the working class and the city planners, the son of the city's mastermind falls in love with a working class prophet who predicts the coming of a savior to mediate their differences.",
    "genres": ["Drama", "Sci-Fi"],
    "rated": "NOT RATED",
    "metacritic": 98,
    "title": "TEST Metropolis",
    "languages": ["German"],
    "writers": ["Thea von Harbou (screenplay)", "Thea von Harbou (novel)"],
    "poster": "https://m.media-amazon.com/images/M/MV5BMTg5YWIyMWUtZDY5My00Zjc1LTljOTctYmI0MWRmY2M2NmRkXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SY1000_SX677_AL_.jpg",
    "num_mflix_comments": 2,
    "awards": {
      "wins": 3,
      "nominations": 4,
      "text": "3 wins & 4 nominations."
    },
    "countries": ["Germany"],
    "cast": ["Alfred Abel", "Gustav Frèhlich", "Rudolf Klein-Rogge", "Fritz Rasp"],
    "directors": ["Fritz Lang"],
    "runtime": 153
  }
}



