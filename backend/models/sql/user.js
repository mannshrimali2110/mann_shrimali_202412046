const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/sql');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('customer', 'admin'),
        allowNull: false,
        defaultValue: 'customer',
    },
}, {
    timestamps: true,
    tableName: 'users'
});

module.exports = User;
