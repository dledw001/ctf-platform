const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db/pool');
const {
    resetDb,
    closeDb,
    createAdminUser,
    createNormalUser
} = require('./testUtils');

let adminCookie;
let userCookie;
let challengeId;

beforeEach(async () => {
    await resetDb();

    const admin = await createAdminUser();
    const user = await createNormalUser();

    adminCookie = admin.cookie;
    userCookie = user.cookie;

    const challengeRes = await request(app)
        .post('/api/challenges')
        .set('Cookie', adminCookie)
        .send({
            title: 'Test Challenge',
            description: 'Test Description',
            flag: 'FLAG{test}',
            difficulty: 'easy',
            points: 100,
        });

    challengeId = challengeRes.body.id;
});

afterAll(async () => {
    await closeDb();
});

describe('Public Submissions API', () => {
    test('Submission fails for unauthenticated user', async () => {
        const res = await request(app)
            .post('/api/submissions')
            .send({
                challengeId,
                flag: '{FLAG{test}}',
            });

        expect(res.status).toBe(401);
    });

    test('Submission succeeds for authenticated user', async () => {
        const res = await request(app)
            .post('/api/submissions')
            .set('Cookie', userCookie)
            .send({
                challengeId,
                flag: '{FLAG{test}}',
            });

        expect(res.status).toBe(201);
    });

    test('Submission fails for missing flag', async () => {
        const res = await request(app)
            .post('/api/submissions')
            .set('Cookie', userCookie)
            .send({
                challengeId,
            });

        expect(res.status).toBe(400);
    });

});

describe('Admin Submissions API', () => {
    test('Admin reads submissions successfully', async () => {
        const submission = await request(app)
            .post('/api/submissions')
            .set('Cookie', userCookie)
            .send({
                challengeId,
                flag: '{FLAG{test}}',
            });
        expect(submission.status).toBe(201);

        const res = await request(app)
            .get('/api/submissions')
            .set('Cookie', adminCookie)
            .send();

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].challengeId).toBe(challengeId);
    });
})