const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

if (process.env.NODE_ENV === 'test') {

    sequelize = new Sequelize('sqlite:/:memory:', {
        logging: false, // Disable logging for tests
    });
} else {
    if (!process.env.MYSQL_URL) {
        throw new Error('MYSQL_URL is not defined in .env file');
    }

    sequelize = new Sequelize(process.env.MYSQL_URL, {
        dialect: 'mysql',
        logging: false, 
    });
}

module.exports = { sequelize };

