const request = require('supertest');
const app = require('../server');
const { sequelize } = require('../models/sql');
const Product = require('../models/mongo/product');
const { User } = require('../models/sql');
const bcrypt = require('bcryptjs');

let adminToken;
let customerToken;
let sampleProductId;

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
    name: 'Laptop',
    sku: 'LT-001',
    price: 1500,
    category: 'Electronics',
};
const productB = {
    name: 'Mouse',
    sku: 'MS-002',
    price: 50,
    category: 'Electronics',
};
const productC = {
    name: 'Coffee Mug',
    sku: 'CM-003',
    price: 25,
    category: 'Homeware',
};
const sampleProduct = {
    name: 'Sample Test Product',
    sku: 'SMPL-001',
    price: 99.99,
    category: 'Testing',
};

beforeAll(async () => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simple wait

    await sequelize.sync({ force: true });
    const adminHash = await bcrypt.hash(adminUser.password, 12);
    const custHash = await bcrypt.hash(customerUser.password, 12);
    await User.create({ ...adminUser, passwordHash: adminHash });
    await User.create({ ...customerUser, passwordHash: custHash });

    const adminRes = await request(app)
        .post('/api/auth/login')
        .send({ email: adminUser.email, password: adminUser.password });

    adminToken = adminRes.body.token;

    const custRes = await request(app)
        .post('/api/auth/login')
        .send({ email: customerUser.email, password: customerUser.password });
    customerToken = custRes.body.token;

    if (!adminToken || !customerToken) {
        console.error('Failed to retrieve auth tokens during setup.', {
            admin: adminRes.body,
            cust: custRes.body
        });
    }
});

beforeEach(async () => {
    await Product.deleteMany({});
    const product = await Product.create(sampleProduct);
    sampleProductId = product._id.toString();
});

afterAll(async () => {
    await sequelize.close();
});

describe('POST /api/products (Admin)', () => {
    const newProduct = {
        name: 'New Premium Laptop',
        sku: 'NPL-001',
        price: 2500,
        category: 'Electronics',
    };

    it('should create a new product as admin', async () => {
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(newProduct);

        expect(res.statusCode).toBe(201);
        expect(res.body.data.product.name).toBe(newProduct.name);
        expect(res.body.data.product.sku).toBe(newProduct.sku);

        const productInDb = await Product.findById(res.body.data.product._id);
        expect(productInDb).toBeDefined();
        expect(productInDb.name).toBe(newProduct.name);
    });

    it('should return 403 (Forbidden) if a customer tries to create a product', async () => {
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${customerToken}`)
            .send(newProduct);
        expect(res.statusCode).toBe(403);
    });

    it('should return 401 (Unauthorized) if no token is provided', async () => {
        const res = await request(app).post('/api/products').send(newProduct);
        expect(res.statusCode).toBe(401);
    });

    it('should return 400 (Bad Request) for validation error (missing name)', async () => {
        const invalidProduct = { sku: 'SKU-ONLY', price: 100, category: 'Test' };
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(invalidProduct);

        expect(res.statusCode).toBe(400);
        expect(res.body.errors[0].path).toBe('name');
    });
});

describe('PUT /api/products/:id (Admin)', () => {
    const updates = { name: 'Updated Product Name', price: 101.01 };

    it('should update a product as admin', async () => {
        const res = await request(app)
            .put(`/api/products/${sampleProductId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send(updates);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.product.name).toBe(updates.name);
        expect(res.body.data.product.price).toBe(updates.price);
    });

    it('should return 403 (Forbidden) if a customer tries to update a product', async () => {
        const res = await request(app)
            .put(`/api/products/${sampleProductId}`)
            .set('Authorization', `Bearer ${customerToken}`)
            .send(updates);
        expect(res.statusCode).toBe(403);
    });

    it('should return 404 if product to update is not found', async () => {
        const nonExistentId = '605dfa5d5e5b0b1a8c1f3b2a';
        const res = await request(app)
            .put(`/api/products/${nonExistentId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send(updates);
        expect(res.statusCode).toBe(404);
    });
});

describe('DELETE /api/products/:id (Admin)', () => {
    it('should delete a product as admin', async () => {
        const res = await request(app)
            .delete(`/api/products/${sampleProductId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(204);

        const productInDb = await Product.findById(sampleProductId);
        expect(productInDb).toBeNull();
    });

    it('should return 403 (Forbidden) if a customer tries to delete a product', async () => {
        const res = await request(app)
            .delete(`/api/products/${sampleProductId}`)
            .set('Authorization', `Bearer ${customerToken}`);
        expect(res.statusCode).toBe(403);
    });
});

describe('GET /api/products (Public)', () => {
    beforeEach(async () => {
        await Product.deleteMany({}); // Clear collection
        await Product.insertMany([productA, productB, productC]); // Insert test data
    });

    it('should get all products sorted by price descending (default)', async () => {
        const res = await request(app).get('/api/products');
        expect(res.statusCode).toBe(200);
        expect(res.body.data.products).toHaveLength(3);
        expect(res.body.data.products[0].name).toBe('Laptop'); // 1500
        expect(res.body.data.products[1].name).toBe('Mouse'); // 50
        expect(res.body.data.products[2].name).toBe('Coffee Mug'); // 25
    });

    it('should sort by price_asc', async () => {
        const res = await request(app).get('/api/products?sort=price_asc');
        expect(res.statusCode).toBe(200);
        expect(res.body.data.products).toHaveLength(3);
        expect(res.body.data.products[0].name).toBe('Coffee Mug'); // 25
        expect(res.body.data.products[1].name).toBe('Mouse'); // 50
    });

    it('should filter by category', async () => {
        const res = await request(app).get('/api/products?category=Electronics');
        expect(res.statusCode).toBe(200);
        expect(res.body.data.products).toHaveLength(2);
        expect(res.body.data.products[0].category).toBe('Electronics');
        expect(res.body.data.products[1].category).toBe('Electronics');
    });

    it('should filter by name (case-insensitive regex)', async () => {
        const res = await request(app).get('/api/products?name=lap');
        expect(res.statusCode).toBe(200);
        expect(res.body.data.products).toHaveLength(1);
        expect(res.body.data.products[0].name).toBe('Laptop');
    });

    it('should paginate correctly', async () => {
        const res = await request(app).get('/api/products?page=2&limit=1');
        expect(res.statusCode).toBe(200);
        expect(res.body.data.products).toHaveLength(1);
        expect(res.body.data.products[0].name).toBe('Mouse');
        expect(res.body.data.pagination.page).toBe(2);
        expect(res.body.data.pagination.totalPages).toBe(3);
    });
});

describe('GET /api/products/:id (Public)', () => {
    it('should get a single product by its ID', async () => {
        const res = await request(app).get(`/api/products/${sampleProductId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.data.product.name).toBe('Sample Test Product');
        expect(res.body.data.product._id).toBe(sampleProductId);
    });

    it('should return 404 for a non-existent product ID', async () => {
        const nonExistentId = '605dfa5d5e5b0b1a8c1f3b2a';
        const res = await request(app).get(`/api/products/${nonExistentId}`);
        expect(res.statusCode).toBe(404);
    });

    it('should return 400 for an invalid Mongo ID format', async () => {
        const invalidId = 'not-a-mongo-id';
        const res = await request(app).get(`/api/products/${invalidId}`);
        expect(res.statusCode).toBe(400);
        expect(res.body.errors[0].path).toBe('id');
    });
});

