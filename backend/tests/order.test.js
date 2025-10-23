const request = require('supertest');
const app = require('../server');
const { sequelize } = require('../models/sql');
const { User, Order, OrderItem } = require('../models/sql');
const Product = require('../models/mongo/product');
const bcrypt = require('bcryptjs');

let customerToken;
let customerId;
let product1, product2;

const customerUser = {
    name: 'Customer User',
    email: 'customer@test.com',
    password: 'password123',
    role: 'customer',
};

const productA = {
    name: 'Test Laptop',
    sku: 'TEST-LT-001',
    price: 1000.0,
    category: 'Electronics',
};
const productB = {
    name: 'Test Mouse',
    sku: 'TEST-MS-002',
    price: 50.0,
    category: 'Electronics',
};

beforeAll(async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    await sequelize.sync({ force: true });
    const custHash = await bcrypt.hash(customerUser.password, 12);
    const user = await User.create({ ...customerUser, passwordHash: custHash });
    customerId = user.id; // Save customer's SQL UUID

    await Product.deleteMany({});
    product1 = await Product.create(productA);
    product2 = await Product.create(productB);

    const custRes = await request(app)
        .post('/api/auth/login')
        .send({ email: customerUser.email, password: customerUser.password });
    customerToken = custRes.body.token;

    if (!customerToken) {
        console.error('Failed to retrieve customer token during setup.');
    }
});

beforeEach(async () => {
    await OrderItem.destroy({ where: {} });
    await Order.destroy({ where: {} });
});

afterAll(async () => {
    await sequelize.close();
});

describe('POST /api/orders/checkout', () => {
    const validCart = [
        { productId: null, quantity: 2 },
        { productId: null, quantity: 1 },
    ];
    beforeEach(() => {
        validCart[0].productId = product1._id.toString();
        validCart[1].productId = product2._id.toString();
    });

    it('should create a new order and order items successfully', async () => {
        const res = await request(app)
            .post('/api/orders/checkout')
            .set('Authorization', `Bearer ${customerToken}`)
            .send(validCart);

        expect(res.statusCode).toBe(201);
        expect(res.body.status).toBe('success');
        expect(res.body.data.order).toBeDefined();

        const orderId = res.body.data.order.id;
        const orderUserId = res.body.data.order.userId;

        const expectedTotal =
            productA.price * validCart[0].quantity +
            productB.price * validCart[1].quantity;
        expect(orderUserId).toBe(customerId);
        expect(res.body.data.order.total).toBe(expectedTotal.toFixed(2));

        const orderInDb = await Order.findByPk(orderId);
        expect(orderInDb).toBeDefined();
        expect(orderInDb.total).toBe(expectedTotal.toFixed(2));
        expect(orderInDb.userId).toBe(customerId);

        const itemsInDb = await OrderItem.findAll({ where: { orderId: orderId } });
        expect(itemsInDb).toHaveLength(2);
        const item1 = itemsInDb.find(
            (item) => item.productId === product1._id.toString()
        );
        const item2 = itemsInDb.find(
            (item) => item.productId === product2._id.toString()
        );

        expect(item1).toBeDefined();
        expect(item1.quantity).toBe(2);
        expect(item1.priceAtPurchase).toBe(productA.price.toFixed(2));

        expect(item2).toBeDefined();
        expect(item2.quantity).toBe(1);
        expect(item2.priceAtPurchase).toBe(productB.price.toFixed(2));
    });

    it('should return 401 if no token is provided', async () => {
        const res = await request(app)
            .post('/api/orders/checkout')
            .send(validCart);
        expect(res.statusCode).toBe(401);
    });

    it('should return 400 if cart is empty', async () => {
        const res = await request(app)
            .post('/api/orders/checkout')
            .set('Authorization', `Bearer ${customerToken}`)
            .send([]); // Empty cart
        expect(res.statusCode).toBe(400);
        expect(res.body.errors[0].msg).toBe('Cart must be a non-empty array.');
    });

    it('should return 400 if cart is not an array', async () => {
        const res = await request(app)
            .post('/api/orders/checkout')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({ not: 'a cart' }); // Invalid cart
        expect(res.statusCode).toBe(400);
        expect(res.body.errors[0].msg).toBe('Cart must be a non-empty array.');
    });

    it('should return 400 if a cart item has an invalid product ID format', async () => {
        const invalidCart = [{ productId: 'not-a-mongo-id', quantity: 1 }];
        const res = await request(app)
            .post('/api/orders/checkout')
            .set('Authorization', `Bearer ${customerToken}`)
            .send(invalidCart);
        expect(res.statusCode).toBe(400);
        expect(res.body.errors[0].path).toBe('cart[0].productId');
    });

    it('should return 400 if a cart item has an invalid quantity', async () => {
        const invalidCart = [{ productId: product1._id.toString(), quantity: 0 }];
        const res = await request(app)
            .post('/api/orders/checkout')
            .set('Authorization', `Bearer ${customerToken}`)
            .send(invalidCart);
        expect(res.statusCode).toBe(400);
        expect(res.body.errors[0].path).toBe('cart[0].quantity');
    });

    it('should return 404 if a product in the cart does not exist', async () => {
        const nonExistentId = '605dfa5d5e5b0b1a8c1f3b2a';
        const nonExistentCart = [
            { productId: product1._id.toString(), quantity: 1 },
            { productId: nonExistentId, quantity: 1 },
        ];
        const res = await request(app)
            .post('/api/orders/checkout')
            .set('Authorization', `Bearer ${customerToken}`)
            .send(nonExistentCart);
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toContain('No product found with ID');
    });
});
