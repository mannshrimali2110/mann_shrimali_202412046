const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/sql');

const OrderItem = sequelize.define('OrderItem', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    orderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'orders',
            key: 'id',
        },
    },
    productId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
        },
    },
    priceAtPurchase: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    timestamps: false,
    tableName: 'order_items'
});

module.exports = OrderItem;
