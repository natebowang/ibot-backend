const request = require('supertest');
const app = require('../app.js');
const {pgPool} = require('../db/connection.js');

describe('Sign up', () => {
    const username = 'testuser1@email.com';

    beforeAll(async () => {
        await pgPool.query(
            'DELETE FROM users WHERE username=$1;',
            [username]
        );
    });

    test('POST /api/signup', async () => {
        const {header, body} = await request(app)
            .post('/api/signup')
            .set('Accept', 'application/json')
            .send({
                username: username,
                password: 'abc123!!!'
            })
            .expect(201);
        expect(body).toMatchObject({
            username: username,
            email: username,
            phone: null,
            avatar: null,
            user_state: 1
        })
    });
});

