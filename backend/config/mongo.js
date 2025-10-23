const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is not defined in .env file or test setup');
    }

    try {
        mongoose.set('strictQuery', false);
        if (process.env.NODE_ENV !== 'test') {
            const conn = await mongoose.connect(process.env.MONGO_URI);
            console.log(`MongoDB Connected: ${conn.connection.host}`);
        } else {
            console.log('MongoDB connection handled by test setup.');
        }

    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;

