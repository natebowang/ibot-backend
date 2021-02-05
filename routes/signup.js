const express = require('express');
const createError = require('http-errors');
const xss = require('xss');
const crypto = require('crypto');
const {pgPool} = require('../db/connection.js');
const emailValidator = require('email-validator');
const PasswordValidator = require('password-validator');

const router = express.Router();

let passwordValidator = new PasswordValidator();
passwordValidator.is().min(6)             // Minimum length 6
    .is().max(20)                         // Maximum length 20
    .has().digits()                             // Must have digit
    .has().symbols()                            // Must have symbols
    .has().not().spaces();                      // Should not have spaces

/**
 * Create user name and password.
 * Curl -v
 *      -d '{ "username":"bob@email.com", "password": "abc123!!!"}'
 *      -H "Content-Type:application/json"
 *      http://localhost:8000/api/signup
 */
router.post('/', async (req, res, next) => {
    const username = xss(req.body.username) || '';
    const password = req.body.password || '';
    let errorMessage = '';

    const emailValidateResult = emailValidator.validate(username);
    const passwordValidateResultArray = passwordValidator.validate(password, {list: true});

    if (emailValidateResult && passwordValidateResultArray.length === 0) {
        // todo: use pool.connect()
        const duplicateCheckResult = await pgPool.query(
            'SELECT username FROM users WHERE username=$1;',
            [username]
        );
        if (duplicateCheckResult.rowCount === 0) {
            const sha = crypto.createHash('sha256');
            const salt = crypto.randomBytes(48).toString('base64');
            let passwordSha256 = sha.update(password + salt).digest('hex');
            try {
                await pgPool.query(
                    'INSERT INTO users ' +
                    '(username, password, salt, login_method_id, email, user_state) VALUES ' +
                    '($1, $2, $3, $4, $5, $6);',
                    [username, passwordSha256, salt, 0, username, 1]
                );
                res.status(201);
                const responseUserObject = {
                    username: username,
                    email: username,
                    phone: null,
                    avatar: null,
                    user_state: 1
                };
                await res.json(responseUserObject);
            } catch (err) {
                next(createError(422)); // 422: Unprocessable Entity. i.e. wrong data type
            }
        } else {
            next(createError(409, 'User exists'));
        }
    } else {
        if (!emailValidator.validate(username)) {
            errorMessage = errorMessage + 'Empty username or wrong username format. ';
        }
        if (passwordValidateResultArray.length !== 0) {
            errorMessage = errorMessage + 'Wrong password format: ' + passwordValidateResultArray + '.';
        }
        next(createError(422, errorMessage));
    }
});

module.exports = router;
