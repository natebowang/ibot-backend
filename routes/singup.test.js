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

describe('User exists', () => {
    const username = 'testuser1@email.com';

    beforeAll(async () => {
        await pgPool.query(
            'INSERT INTO users ' +
            '(username, password, salt, login_method_id, email, user_state) VALUES ' +
            '($1, $2, $3, $4, $5, $6);',
            [username, 'fakePassword', 'fakeSalt', 0, username, 1]
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
            .expect(409);
        expect(text).toEqual('409: User exists.')
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

