const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db/pool');
const {
    resetDb,
    closeDb,
    createAdminUser,
    createNormalUser
} = require('./testUtils');

beforeEach(async () => {
    await resetDb();
});

afterAll(async () => {
    await closeDb();
});

describe('Public Scoreboard API', () => {
    test('GET /api/scoreboard calculates scores correctly', async () => {
        const admin = await createAdminUser();
        const user = await createNormalUser();

        const adminCookie = admin.cookie;
        const userCookie = user.cookie;

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

        expect(challengeRes.status).toBe(201);
        const challengeId = challengeRes.body.id;

        const submissionRes = await request(app)
            .post('/api/submissions')
            .set('Cookie', userCookie)
            .send({
                challengeId,
                flag: 'FLAG{test}',
            });

        expect(submissionRes.status).toBe(201);
        expect(submissionRes.body.correct).toBe(true);

        const scoreboardRes = await request(app)
            .get('/api/scoreboard');

        expect(scoreboardRes.status).toBe(200);
        const row = scoreboardRes.body[0];
        expect(row.score).toBe(100);

    });

});