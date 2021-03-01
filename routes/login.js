const express = require('express');
const createError = require('http-errors');
const xss = require('xss');
const crypto = require('crypto');
const {pgPool} = require('../db/connection.js');

const router = express.Router();

// curl -v -c ~/cookie -d '{ "username":"gy", "password": "gy"}' -H "Content-Type:application/json" http://localhost:8000/api/login
router.post('/', async (req, res, next) => {
    if (req.body.username !== "") {
        await usernameLoginMiddleWare(req, res, next)
    } else if (req.session.username) {
        await sessionLoginMiddleWare(req, res, next)
    } else {
        let errorMessage = 'Incorrect username or password';
        let errorProps = {incorrectUsernamePwd: true};
        next(createError(401, errorMessage, {errorProps: errorProps}));
    }
});

const sessionLoginMiddleWare = async (req, res, next) => {
    let username = req.session.username;
    let sqlResult = await pgPool.query(
        'SELECT email, phone, avatar FROM users where username=$1',
        [username]);
    const responseUserObject = {
        username: username,
        email: sqlResult.rows[0].email,
        phone: sqlResult.rows[0].phone,
        avatar: sqlResult.rows[0].avatar,
    };
    await res.json(responseUserObject);
};

const usernameLoginMiddleWare = async (req, res, next) => {
    let errorMessage = '';
    let errorProps = {};

    const username = xss(req.body.username);
    const password = req.body.password;

    let result = await pgPool.query(
        'SELECT username, password, salt, login_method_id, ' +
        'email, phone, avatar, user_state, record_status FROM users ' +
        'WHERE username=$1 AND record_status=0;',
        [username]
    );
    if (result.rowCount === 1) {
        const sha = crypto.createHash('sha256');
        const salt = result.rows[0].salt;
        const passwordSha = sha.update(password + salt).digest('hex');
        let row = result.rows[0];
        // Correct password
        if (row.user_state === 0 && row.login_method_id === 0 && passwordSha === row.password) {
            req.session.username = username;
            console.log(req.session.id)
            const responseUserObject = {
                username: username,
                email: row.email,
                phone: row.phone,
                avatar: row.avatar,
            };
            await res.json(responseUserObject);
        } else if (row.login_method_id !== 0) { // Should use other login method
            errorMessage = 'You should continue with another login method.';
            errorProps = Object.assign(errorProps, {loginMethodId: row.login_method_id});
            next(createError(401, errorMessage, {errorProps: errorProps}));
        } else if (row.user_state !== 0) { // User is disabled
            errorMessage = 'User is disabled.';
            errorProps = Object.assign(errorProps, {userDisabled: true});
            next(createError(401, errorMessage, {errorProps: errorProps}));
        } else if (passwordSha !== row.password) {
            errorMessage = 'Incorrect username or password';
            errorProps = Object.assign(errorProps, {incorrectUsernamePwd: true});
            next(createError(401, errorMessage, {errorProps: errorProps}));
        }
    } else {
        errorMessage = 'Incorrect username or password';
        errorProps = Object.assign(errorProps, {incorrectUsernamePwd: true});
        next(createError(401, errorMessage, {errorProps: errorProps}));
    }

};

module.exports = router;
