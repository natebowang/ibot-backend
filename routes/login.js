const express = require('express');
const createError = require('http-errors');
const xss = require('xss');
const {pgPool} = require('../db/connection.js');
const bcrypt = require('bcrypt');

const router = express.Router();
const {User} = require('../model/User');

// curl -v -c ~/cookie -d '{ "username":"bob@email.com", "password": "abc123!!!"}' -H "Content-Type:application/json" http://localhost:8000/api/login
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
    const username = req.session.username;

    const {email, phone, avatar} = (await User.findOne({where: {username: username}})).get();

    // let sqlResult = await pgPool.query(
    //     'SELECT email, phone, avatar FROM users where username=$1',
    //     [username]);
    const responseUserObject = {
        username: username,
        email: email,
        phone: phone,
        avatar: avatar,
    };
    await res.json(responseUserObject);
};

const usernameLoginMiddleWare = async (req, res, next) => {
    let errorMessage = '';
    let errorProps = {};

    const username = xss(req.body.username);
    const password = req.body.password;

    const recordCount = await User.count({where: {username: username}});
    // let result = await pgPool.query(
    //     'SELECT username, password, login_method_id, ' +
    //     'email, phone, avatar, user_state, record_status FROM users ' +
    //     'WHERE username=$1 AND record_status=0;',
    //     [username]
    // );

    if (recordCount === 1) {
        const record = (await User.findOne({where: {username: username}})).get();
        const ifPasswordCorrect = await bcrypt.compare(password, record.password);
        if (record.user_state === 0 && record.login_method_id === 0 && ifPasswordCorrect) {
            req.session.username = username;
            const responseUserObject = {
                username: username,
                email: record.email,
                phone: record.phone,
                avatar: record.avatar,
            };
            await res.json(responseUserObject);
        } else if (record.login_method_id !== 0) { // Should use other login method
            errorMessage = 'You should continue with another login method.';
            errorProps = Object.assign(errorProps, {loginMethodId: row.login_method_id});
            next(createError(401, errorMessage, {errorProps: errorProps}));
        } else if (record.user_state !== 0) { // User is disabled
            errorMessage = 'User is disabled.';
            errorProps = Object.assign(errorProps, {userDisabled: true});
            next(createError(401, errorMessage, {errorProps: errorProps}));
        } else if (ifPasswordCorrect) {
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
