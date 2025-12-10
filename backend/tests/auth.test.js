const request = require('supertest');
const app = require('../src/app');
const { resetDb, closeDb } = require('./testUtils');

beforeEach(async () => {
    await resetDb();
});

afterAll(async () => {
    await closeDb();
});

describe('Auth API', () => {
    test('register succeeds and sets auth cookie', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'test@example.com',
                password: 'Password123',
            });

        expect(res.status).toBe(201);
        expect(res.body.user.email).toBe('test@example.com');

        const cookie = res.headers['set-cookie'];
        expect(cookie).toBeDefined();
        expect(cookie.join('')).toContain('token=');
    });

    test('register fails with duplicate email', async () => {
        const payload = { email: 'dupe@example.com', password: 'Password123' };

        const first = await request(app)
            .post('/api/auth/register')
            .send(payload);

        expect(first.status).toBe(201);

        const second = await request(app)
            .post('/api/auth/register')
            .send(payload);

        expect(second.status).toBe(400);
        expect(second.body.error).toBeDefined();
    });

    test('register fails with short password', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'test@example.com',
                password: 'short',
            });

        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
    });

    test('login succeeds after register', async () => {
        await request(app)
            .post('/api/auth/register')
            .send({
                email: 'test@example.com',
                password: 'Password123',
            });

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'Password123',
            });

        expect(res.status).toBe(200);
        expect(res.body.user.email).toBe('test@example.com');

        const cookie = res.headers['set-cookie'];
        expect(cookie).toBeDefined();
        expect(cookie.join('')).toContain('token=');
    });

    test('login fails with wrong password', async () => {
        await request(app)
            .post('/api/auth/register')
            .send({
                email: 'test@example.com',
                password: 'Password123',
            });

        const res = await request(app)
            .post('/api/auth/login')
            .send({
               email: 'test@example.com',
               password: 'WrongPassword',
            });

        expect(res.status).toBe(401);
        expect(res.body.error).toBeDefined();
    });

    test('me returns user when cookie is present', async () => {
        const reg = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'test@example.com',
                password: 'Password123',
            });

        const cookie = reg.headers['set-cookie'];

        const res = await request(app)
            .get('/api/auth/me')
            .set('Cookie', cookie);

        expect(res.status).toBe(200);
        expect(res.body.user).toBeDefined();
        expect(res.body.user.email).toBe('test@example.com');
    });
});