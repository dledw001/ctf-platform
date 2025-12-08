const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db/pool');
const {
    resetDb,
    closeDb,
    createAdminUser,
    createNormalUser
} = require('./testUtils');
const crypto = require('crypto');

function expectedFlagHash(flag) {
    const clean = flag.trim();
    const pepper = process.env.FLAG_PEPPER;
    if (!pepper) {
        throw new Error('FLAG_PEPPER environment variable is not set');
    }

    const peppered = clean + pepper;

    return crypto
        .createHash('sha256')
        .update(peppered, 'utf8')
        .digest('hex');
}

let adminCookie;
let userCookie;

beforeEach(async () => {
    await resetDb();

    const admin = await createAdminUser();
    const user = await createNormalUser();

    adminCookie = admin.cookie;
    userCookie = user.cookie;

});

afterAll(async () => {
    await closeDb();
});

describe('Public Challenge API', () => {
    test('GET /api/challenges returns empty list initially', async () => {
        const res = await request(app).get('/api/challenges');
        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });

    test('GET /api/challenges/:id returns 404 for missing challenge', async () => {
        const res = await request(app).get('/api/challenges/123');
        expect(res.status).toBe(404);
    });
});

describe('Admin Challenege API', () => {
    test('non-authenticated POST /api/challenges returns 401', async () => {
        const res = await request(app)
            .post('/api/challenges')
            .send({});
        expect(res.status).toBe(401);
    });

    test('non-admin POST /api/challenges returns 403', async () => {
        const res = await request(app)
            .post('/api/challenges')
            .set('Cookie', userCookie)
            .send({});
        expect(res.status).toBe(403);
    });

    test('admin create challenge succeeds', async () => {
        const res = await request(app)
            .post('/api/challenges')
            .set('Cookie', adminCookie)
            .send({
                title: 'Test Challenge',
                description: 'Test Description',
                flag: 'FLAG{test}',
                difficulty: 'easy',
                points: 100
            });

        expect(res.status).toBe(201);
        expect(res.body.title).toBe('Test Challenge');
        expect(res.body.description).toBe('Test Description');
        expect(res.body.difficulty).toBe('easy');
        expect(res.body.points).toBe(100);
        expect(res.body).not.toHaveProperty('flag_hash');
        expect(res.body).not.toHaveProperty('flag');
    });

    test('flag is hashed in database', async () => {
        const flag = 'FLAG{test}'
        await request(app)
            .post('/api/challenges')
            .set('Cookie', adminCookie)
            .send({
                title: 'Flag hash challenge',
                description: 'Test Description',
                flag,
                difficulty: 'easy',
                points: 100
            });

        const db = await pool.query(
            `SELECT flag_hash FROM challenges ORDER BY id DESC LIMIT 1`
        );
        expect(db.rows.length).toBe(1);
        expect(db.rows[0].flag_hash).toBe(expectedFlagHash(flag));
    });

    test('admin challenge update succeeds', async () => {
        const created = await request(app)
            .post('/api/challenges')
            .set('Cookie', adminCookie)
            .send({
                title: 'Old Title',
                description: 'Old Description',
                flag: 'FLAG{old}',
                difficulty: 'easy',
                points: 100
            });

        const id = created.body.id;

        const updated = await request(app)
            .put(`/api/challenges/${id}`)
            .set('Cookie', adminCookie)
            .send({
                title: 'New Title',
                description: 'New Description',
                flag: 'FLAG{new}',
                difficulty: 'hard',
                points: 200
            });

        expect(updated.status).toBe(200);
        expect(updated.body.title).toBe('New Title');
        expect(updated.body.description).toBe('New Description');
        expect(updated.body).not.toHaveProperty('flag_hash');
        expect(updated.body).not.toHaveProperty('flag');
        expect(updated.body.difficulty).toBe('hard');
        expect(updated.body.points).toBe(200);
    });

    test('admin challenge delete succeeds', async () => {
        const created = await request(app)
            .post('/api/challenges')
            .set('Cookie', adminCookie)
            .send({
                title: 'Test Title',
                description: 'Test Description',
                flag: 'FLAG{test}',
                difficulty: 'easy',
                points: 100
            });

        const id = created.body.id;

        const deleted = await request(app)
            .delete(`/api/challenges/${id}`)
            .set('Cookie', adminCookie);

        expect(deleted.status).toBe(204);

        const get = await request(app).get(`/api/challenges/${id}`);
        expect(get.status).toBe(404);
    });
});