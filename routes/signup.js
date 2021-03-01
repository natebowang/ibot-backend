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
    .is().max(50)                         // Maximum length 50
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
    let errorProps = {};

    const emailValidateResult = emailValidator.validate(username);
    const passwordValidationResultArray = passwordValidator.validate(password, {list: true});

    if (emailValidateResult && passwordValidationResultArray.length === 0) {
        // todo: use pool.connect()
        const duplicateCheckResult = await pgPool.query(
            'SELECT username FROM users WHERE username=$1 AND record_status=0;',
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
                    [username, passwordSha256, salt, 0, username, 0]
                );
                res.status(201);
                const responseUserObject = {
                    username: username,
                    email: username,
                    phone: null,
                    avatar: null,
                };
                await res.json(responseUserObject);
            } catch (err) {
                errorProps = Object.assign(errorProps, {unprocessableEntity: true});
                next(createError(422, 'Unprocessable Entity.', {errorProps: errorProps})); // 422: Unprocessable Entity. i.e. wrong data type
            }
        } else {
            errorProps = Object.assign(errorProps, {userExists: true});
            next(createError(409, 'User exists.', {errorProps: errorProps}));
        }
    } else {
        if (!emailValidator.validate(username)) {
            errorMessage = errorMessage + 'Empty username or wrong username format.';
            errorProps = Object.assign(errorProps, {wrongUsernameFormat: true});
        }
        if (passwordValidationResultArray.length !== 0) {
            errorMessage = errorMessage + 'Wrong password format: ' + passwordValidationResultArray + '.';
            errorProps = Object.assign(errorProps, {
                wrongPasswordFormat: true,
                passwordValidationResultArray: passwordValidationResultArray
            });
        }
        next(createError(422, errorMessage, {errorProps: errorProps}));
    }
});

module.exports = router;
