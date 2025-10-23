const { sequelize } = require('../../config/sql');

const User = require('./user');
const Order = require('./order');
const OrderItem = require('./orderItem');


// User <-> Order (One-to-Many)
User.hasMany(Order, {
    foreignKey: 'userId',
    as: 'orders'
});
Order.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

// Order <-> OrderItem (One-to-Many)
Order.hasMany(OrderItem, {
    foreignKey: 'orderId',
    as: 'items'
});
OrderItem.belongsTo(Order, {
    foreignKey: 'orderId',
    as: 'order'
});

// Export all models and the sequelize instance
module.exports = {
    sequelize,
    User,
    Order,
    OrderItem,
};
