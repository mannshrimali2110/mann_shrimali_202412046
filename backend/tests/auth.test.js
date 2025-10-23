const request = require('supertest');
const app = require('../server');
const { sequelize, User } = require('../models/sql');
const { connectDB, disconnectDB } = require('../config/mongo');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

describe('Auth API Endpoints', () => {
    const testUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
    };

    const testAdmin = {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
    };

    beforeAll(async () => {
        await sequelize.sync({ force: true });

        const passwordHash = await bcrypt.hash(testAdmin.password, 12);
        await User.create({
            name: testAdmin.name,
            email: testAdmin.email,
            role: testAdmin.role,
            passwordHash: passwordHash,
        });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send(testUser);

            expect(res.statusCode).toBe(201);
            expect(res.body.status).toBe('success');
            expect(res.body.token).toBeDefined();
            expect(res.body.data.user.email).toBe(testUser.email);

            const userInDb = await User.findOne({ where: { email: testUser.email } });
            expect(userInDb).toBeDefined();
            expect(userInDb.name).toBe(testUser.name);
        });

        it('should fail to register a user with a duplicate email', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send(testUser);

            expect(res.statusCode).toBe(400);
            expect(res.body.status).toBe('fail');
            expect(res.body.message).toBe('User already exists with this email');
        });

        it('should fail with invalid data (e.g., no email)', async () => {
            const invalidUser = { name: 'Test User', password: 'password123' };
            const res = await request(app)
                .post('/api/auth/register')
                .send(invalidUser);

            expect(res.statusCode).toBe(400);
            expect(res.body.errors).toBeDefined();
            expect(res.body.errors[0].path).toBe('email');
        });
    });

    describe('POST /api/auth/login', () => {
        it('should log in a registered admin successfully', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testAdmin.email,
                    password: testAdmin.password,
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('success');
            expect(res.body.token).toBeDefined();
            expect(res.body.data.user.role).toBe('admin');
        });

        it('should fail to log in with a wrong password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testAdmin.email,
                    password: 'wrongpassword',
                });

            expect(res.statusCode).toBe(401);
            expect(res.body.status).toBe('fail');
            expect(res.body.message).toBe('Invalid credentials');
        });

        it('should fail to log in with a non-existent email', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nouser@example.com',
                    password: 'password123',
                });

            expect(res.statusCode).toBe(401);
            expect(res.body.status).toBe('fail');
            expect(res.body.message).toBe('Invalid credentials');
        });
    });
});


