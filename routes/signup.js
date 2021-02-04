const express = require('express');
const createError = require('http-errors');
const xss = require('xss');
const crypto = require('crypto');
const {pgPool} = require('../db/connection.js');

const router = express.Router();

// Create user name and password.
// Curl -v -d '{ "username":"wb", "password": "wb"}' -H "Content-Type:application/json" http://localhost:8000/api/signup
router.post('/', async (req, res, next) => {
    const username = xss(req.body.username) || '';
    const password = req.body.password || '';
    let errorMessage = '';

    if (username !== '' && password !== '') {
        const duplicateCheckResult = await pgPool.query(
            'SELECT username FROM users WHERE username=$1;',
            [username]
        );
        if (duplicateCheckResult.rowCount === 0) {
            const sha = crypto.createHash('sha256');
            const salt = crypto.randomBytes(48).toString('base64');
            let passwordSha256 = sha.update(password + salt).digest('hex');
            try {
                const insertResult = await pgPool.query(
                    'INSERT INTO users (username, password, salt, login_method_id) VALUES ($1, $2, $3, $4);',
                    [username, passwordSha256, salt, 0]
                );
                res.status(201);
                await res.json(insertResult);
            } catch (err) {
                next(createError(422));
            }
        } else {
            next(createError(409, 'User exists'));
        }
    } else {
        if (username === '') {
            errorMessage = errorMessage + 'Empty username. ';
        }
        if (password === '') {
            errorMessage = errorMessage + 'Empty password. ';
        }
        next(createError(422), errorMessage);
    }
});

module.exports = router;
