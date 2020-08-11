# Running the code

after checkout/clone, install dependencies and devDependencies:

    $ npm install

config/default.json must be modified to include username and password (and server/db).

import cyf_mflix_movies_popular.json to your db

# Testing the code

Set the version of the server you wish to test in test/films_api.js

    const server = require('../server_mongoose_await'); // server, server_await, server_mongoose

Run tests

    $ npm test

The following test fails on some server versions: PUT should return status 500 if the id in the body does not match the root param
