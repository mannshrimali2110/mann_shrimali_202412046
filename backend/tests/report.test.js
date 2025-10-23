const request = require('supertest');
const app = require('../server');
const { sequelize } = require('../models/sql');
const { User, Order } = require('../models/sql');
const Product = require('../models/mongo/product');
const bcrypt = require('bcryptjs');

let adminToken;
let customerToken;
let customerId;

// --- Test Data ---
const adminUser = {
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin',
};

const customerUser = {
    name: 'Customer User',
    email: 'customer@test.com',
    password: 'password123',
    role: 'customer',
};

const productA = {
    name: 'Report-Laptop',
    sku: 'REP-LT-001',
    price: 1500,
    category: 'Electronics',
};
const productB = {
    name: 'Report-Mouse',
    sku: 'REP-MS-002',
    price: 50,
    category: 'Electronics',
};
const productC = {
    name: 'Report-Mug',
    sku: 'REP-CM-003',
    price: 25,
    category: 'Homeware',
};

beforeAll(async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    await sequelize.sync({ force: true });
    const adminHash = await bcrypt.hash(adminUser.password, 12);
    const custHash = await bcrypt.hash(customerUser.password, 12);
    await User.create({ ...adminUser, passwordHash: adminHash });
    const customer = await User.create({
        ...customerUser,
        passwordHash: custHash,
    });
    customerId = customer.id;

    const adminRes = await request(app)
        .post('/api/auth/login')
        .send({ email: adminUser.email, password: adminUser.password });
    adminToken = adminRes.body.token;

    const custRes = await request(app)
        .post('/api/auth/login')
        .send({ email: customerUser.email, password: customerUser.password });
    customerToken = custRes.body.token;

    await Product.deleteMany({});
    await Product.insertMany([productA, productB, productC]);

    await Order.destroy({ where: {} });
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    await Order.create({
        userId: customerId,
        total: 100.0,
        createdAt: new Date(), // Today
    });
    await Order.create({
        userId: customerId,
        total: 200.0,
        createdAt: new Date(), // Today
    });
    await Order.create({
        userId: customerId,
        total: 50.0,
        createdAt: yesterday, // Yesterday
    });
});

afterAll(async () => {
    await sequelize.close();
});

describe('GET /api/reports/daily-revenue (Admin)', () => {
    it('should return 401 (Unauthorized) if no token is provided', async () => {
        const res = await request(app).get('/api/reports/daily-revenue');
        expect(res.statusCode).toBe(401);
    });

    it('should return 403 (Forbidden) if a customer tries to access', async () => {
        const res = await request(app)
            .get('/api/reports/daily-revenue')
            .set('Authorization', `Bearer ${customerToken}`);
        expect(res.statusCode).toBe(403);
    });

    it('should return the aggregated daily revenue report for admin', async () => {
        const res = await request(app)
            .get('/api/reports/daily-revenue')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('success');

        const report = res.body.data.report;
        expect(report).toBeDefined();
        expect(report).toHaveLength(2);

        const todayReport = report.find(r => r.total === '300.00');
        expect(todayReport).toBeDefined();

        const yesterdayReport = report.find(r => r.total === '50.00');
        expect(yesterdayReport).toBeDefined();
    });
});

describe('GET /api/reports/category-sales (Admin)', () => {
    it('should return the aggregated category sales report for admin', async () => {
        const res = await request(app)
            .get('/api/reports/category-sales')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('success');

        const report = res.body.data.report;
        expect(report).toBeDefined();
        expect(report).toHaveLength(2);

        const electronics = report.find(r => r._id === 'Electronics');
        const homeware = report.find(r => r._id === 'Homeware');

        expect(electronics).toBeDefined();
        expect(electronics.count).toBe(2);

        expect(homeware).toBeDefined();
        expect(homeware.count).toBe(1);
    });
});
