const request = require('supertest');
const app = require('../app.js');
const {pgPool} = require('../db/connection.js');

describe('Success sign up', () => {
    const username = 'test-signup-user@email.com';

    beforeAll(async () => {
        await pgPool.query(
            'DELETE FROM users WHERE username=$1;',
            [username]
        );
    });

    test('POST /api/signup', async () => {
        const {header, body, text} = await request(app)
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
        })
    });
});

describe('User exists', () => {
    const username = 'test-signup-user@email.com';

    beforeAll(async () => {
        await pgPool.query(
            'INSERT INTO users ' +
            '(username, password, salt, login_method_id, email, user_state) VALUES ' +
            '($1, $2, $3, $4, $5, $6);',
            [username, 'fakePassword', 'fakeSalt', 0, username, 1]
        );
    });

    test('POST /api/signup', async () => {
        const {body} = await request(app)
            .post('/api/signup')
            .set('Accept', 'application/json')
            .send({
                username: username,
                password: 'abc123!!!'
            })
            .expect(409);
        expect(body).toMatchObject({
            userExists: true,
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
        const {body} = await request(app)
            .post('/api/signup')
            .set('Accept', 'application/json')
            .send({
                username: username,
                password: 'abc123!!!'
            })
            .expect(422);
        expect(body).toMatchObject({
            wrongUsernameFormat: true,
        })
    });
});

describe('Wrong password format', () => {
    const username = 'test-signup-user@email.com';

    beforeAll(async () => {
        await pgPool.query(
            'DELETE FROM users WHERE username=$1;',
            [username]
        );
    });

    test('POST /api/signup', async () => {
        const {body} = await request(app)
            .post('/api/signup')
            .set('Accept', 'application/json')
            .send({
                username: username,
                password: 'abc'
            })
            .expect(422);
        expect(body).toMatchObject({
            wrongPasswordFormat: true,
        })
    });
});

