const request = require('supertest');
const app = require('../app.js');
const {pgPool} = require('../db/connection.js');

describe('Success sign up', () => {
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

describe('Wrong email format', () => {
    const username = 'testuser1';

    beforeAll(async () => {
        await pgPool.query(
            'DELETE FROM users WHERE username=$1;',
            [username]
        );
    });

    test('POST /api/signup', async () => {
        const {text} = await request(app)
            .post('/api/signup')
            .set('Accept', 'application/json')
            .send({
                username: username,
                password: 'abc123!!!'
            })
            .expect(422);
        expect(text).toEqual('422: Empty username or wrong username format.')
    });
});

describe('Wrong password format', () => {
    const username = 'testuser1@email.com';

    beforeAll(async () => {
        await pgPool.query(
            'DELETE FROM users WHERE username=$1;',
            [username]
        );
    });

    test('POST /api/signup', async () => {
        const {text} = await request(app)
            .post('/api/signup')
            .set('Accept', 'application/json')
            .send({
                username: username,
                password: 'abc'
            })
            .expect(422);
        expect(text).toEqual('422: Wrong password format: min,digits,symbols.')
    });
});

