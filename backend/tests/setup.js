const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;

beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    process.env.MONGO_URI = uri;


    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.connection.close();
    await mongod.stop();
});


