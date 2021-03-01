const request = require('supertest');
const app = require('../app.js');
const {pgPool} = require('../db/connection.js');

describe('POST /api/login', () => {
    const username = 'test-login-user@email.com';
    const password = 'wb';
    const passwordSha = 'fc4bf0c086ec0224a1106429424e44b6b94de4933ffd951d6fadb17fe8e048e1';
    const salt = 'SDpI2x1hIfEWP9Kqq72dlbbBAA50N3O6130A6H7P14CvhSZX/wv3KLTo39BBwN8o';

    beforeAll(async () => {
        await pgPool.query(
            'DELETE FROM users WHERE username=$1;',
            [username]
        );
        await pgPool.query(
            'INSERT INTO users ' +
            '(username, password, salt, login_method_id, email, user_state) VALUES ' +
            '($1, $2, $3, $4, $5, $6);',
            [username, passwordSha, salt, 0, username, 0]
        );
    });

    afterAll(async () => {
        await pgPool.query(
            'DELETE FROM users WHERE username=$1;',
            [username]
        );
    });

    test('Success login', async () => {
        const {body} = await request(app)
            .post('/api/login')
            .set('Accept', 'application/json')
            .send({
                username: username,
                password: password,
            })
            .expect(200);
        expect(body).toMatchObject({
            username: username,
            email: username,
            phone: null,
            avatar: null,
        })
    });

    test('Incorrect username', async () => {
        const {body} = await request(app)
            .post('/api/login')
            .set('Accept', 'application/json')
            .send({
                username: 'wrongname',
                password: password,
            })
            .expect(401);
        expect(body).toMatchObject({
            incorrectUsernamePwd: true,
        })
    });

    test('Incorrect password', async () => {
        const {body} = await request(app)
            .post('/api/login')
            .set('Accept', 'application/json')
            .send({
                username: username,
                password: 'wrongPassowrd',
            })
            .expect(401);
        expect(body).toMatchObject({
            incorrectUsernamePwd: true,
        })
    });
});

describe('POST /api/login', () => {
    const username = 'test-login-user@email.com';
    const password = 'wb';
    const passwordSha = 'fc4bf0c086ec0224a1106429424e44b6b94de4933ffd951d6fadb17fe8e048e1';
    const salt = 'SDpI2x1hIfEWP9Kqq72dlbbBAA50N3O6130A6H7P14CvhSZX/wv3KLTo39BBwN8o';

    beforeAll(async () => {
        await pgPool.query(
            'DELETE FROM users WHERE username=$1;',
            [username]
        );
        await pgPool.query(
            'INSERT INTO users ' +
            '(username, password, salt, login_method_id, email, user_state) VALUES ' +
            '($1, $2, $3, $4, $5, $6);',
            [username, passwordSha, salt, 2, username, 0]
        );
    });

    afterAll(async () => {
        await pgPool.query(
            'DELETE FROM users WHERE username=$1;',
            [username]
        );
    });

    test('Other login method', async () => {
        const {body} = await request(app)
            .post('/api/login')
            .set('Accept', 'application/json')
            .send({
                username: username,
                password: password,
            })
            .expect(401);
        expect(body).toMatchObject({
            loginMethodId: 2,
        })
    });
});

describe('POST /api/login', () => {
    const username = 'test-login-user@email.com';
    const password = 'wb';
    const passwordSha = 'fc4bf0c086ec0224a1106429424e44b6b94de4933ffd951d6fadb17fe8e048e1';
    const salt = 'SDpI2x1hIfEWP9Kqq72dlbbBAA50N3O6130A6H7P14CvhSZX/wv3KLTo39BBwN8o';

    beforeAll(async () => {
        await pgPool.query(
            'DELETE FROM users WHERE username=$1;',
            [username]
        );
        await pgPool.query(
            'INSERT INTO users ' +
            '(username, password, salt, login_method_id, email, user_state) VALUES ' +
            '($1, $2, $3, $4, $5, $6);',
            [username, passwordSha, salt, 0, username, 1]
        );
    });

    afterAll(async () => {
        await pgPool.query(
            'DELETE FROM users WHERE username=$1;',
            [username]
        );
    });

    test('User disabled', async () => {
        const {body} = await request(app)
            .post('/api/login')
            .set('Accept', 'application/json')
            .send({
                username: username,
                password: password,
            })
            .expect(401);
        expect(body).toMatchObject({
            userDisabled: true,
        })
    });
});

