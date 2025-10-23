const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/sql');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    total: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    timestamps: true,
    tableName: 'orders'
});

module.exports = Order;
