/*
* ======================================
* E-Commerce Backend - Main Entry Point
* ======================================
*
* This file is the heart of the application. It does the following:
*
* 1.  Imports Express and other core libraries.
* 2.  Loads environment variables from `.env` using 'dotenv'.
* 3.  Establishes connections to BOTH databases (MongoDB and MySQL/Sequelize).
* 4.  Configures Express middleware (json parsing, security headers, etc.).
* 5.  Mounts all the API route handlers from the `/routes` directory.
* 6.  Sets up the global error handling middleware.
* 7.  Starts the server to listen for requests.
*
* ======================================
* Project Folder Structure Explained:
* ======================================
*
* /backend
* ├── /config
* │   └── mongo.js        # MongoDB (Mongoose) connection logic.
* │   └── sql.js          # MySQL (Sequelize) connection logic.
* │
* ├── /controllers
* │   └── authController.js   # Handles business logic for registration, login.
* │   └── productController.js# Handles logic for creating, finding, updating products.
* │   └── orderController.js  # Handles logic for the checkout process.
* │   └── reportController.js # Handles logic for generating sales reports.
* │
* ├── /middleware
* │   └── authMiddleware.js     # JWT verification (verifyToken) and admin checks (isAdmin).
* │   └── validationMiddleware.js # Re-usable validation rules using express-validator.
* │   └── errorMiddleware.js    # Global error handler (catches all errors).
* │
* ├── /models
* │   ├── /mongo
* │   │   └── product.js      # Mongoose Schema for Products (NoSQL).
* │   └── /sql
* │       └── user.js         # Sequelize Model for Users (SQL).
* │       └── order.js        # Sequelize Model for Orders (SQL).
* │       └── orderItem.js    # Sequelize Model for OrderItems (SQL).
* │       └── index.js        # (Important) Sets up Sequelize associations (e.g., User hasMany Orders).
* │
* ├── /routes
* │   └── auth.js         # Defines /api/auth endpoints (POST /register, POST /login).
* │   └── products.js     # Defines /api/products endpoints (GET /, GET /:id, POST /, etc.).
* │   └── orders.js       # Defines /api/orders endpoints (POST /checkout).
* │   └── reports.js      # Defines /api/reports endpoints (GET /daily-revenue).
* │
* ├── /tests
* │   └── auth.test.js    # Jest/Supertest tests for authentication endpoints.
* │   └── product.test.js # Tests for product endpoints.
* │   └── setup.js        # Global Jest setup (starts in-memory MongoDB).
* │
* ├── .env.example        # Example environment variables.
* ├── .gitignore          # Files/folders for Git to ignore.
* ├── package.json        # Project dependencies and scripts.
* └── server.js           # (This file) The main application entry point.
*/

const express = require('express');
const dotenv = require('dotenv');
const { sequelize } = require('./config/sql');
const connectDB = require('./config/mongo'); // <-- FIX: Changed from connectMongo to connectDB
const globalErrorHandler = require('./middleware/errorMiddleware');
const cors = require('cors');
// Load environment variables
dotenv.config();

// --- Database Connections ---
// Connect to MongoDB
connectDB(); // <-- FIX: Changed from connectMongo to connectDB

// Connect to MySQL (via Sequelize)
// We sync all defined models with the database.
// In a test environment, this uses in-memory SQLite and { force: true }
// In production, this connects to the real MySQL DB.
if (process.env.NODE_ENV !== 'test') {
    sequelize.sync()
        .then(() => console.log('MySQL Database connected'))
        .catch(err => console.error('MySQL connection error:', err));
} else {
    // In test mode, auth.test.js and product.test.js handle their own sync
    console.log('Sequelize sync skipped in server.js (handled by tests)');
}


const app = express();

// --- Core Middleware ---
// Parse JSON request bodies
app.use(express.json());
app.use(
    cors({
        origin: "http://localhost:3000", // frontend URL
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true, // if you use cookies/auth headers
    })
);

// --- API Routes ---
// Mount routers for each resource
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/reports', require('./routes/reports'));

// --- Error Handling ---
// Mount the global error handling middleware
// This MUST come *after* all the routes
app.use(globalErrorHandler);

// --- Server Startup ---
const PORT = process.env.PORT || 5000;

let server;

// We only start the server if we are NOT in a test environment.
// Jest/Supertest will start the server itself on a random port.
if (process.env.NODE_ENV !== 'test') {
    server = app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
} else {
    // We still need to export the app for Supertest to use
    console.log(`Server configured for test environment. Not starting listener.`);
}

// Handle unhandled promise rejections (e.g., bad DB connection string)
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    // Close server & exit process
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
});

// Export the app for testing
module.exports = app;

