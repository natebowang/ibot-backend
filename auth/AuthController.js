const express = require('express');
const createError = require('http-errors');
const router = express.Router();
const {User} = require('../model/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {sessionSecret: secret} = require('../secret');

const hashRound = 10;

router.post('/', async (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    let errorMessage = '';
    let errorProps = {};

    const passwordHash = await bcrypt.hash(password, hashRound);

    try {
        await User.create({
            username: username,
            password: passwordHash,
            login_method_id: 0,
            email: username,
            user_state: 0,
        });
        // res.status(201);
        const token = jwt.sign({username: username}, secret, {
            expiresIn: 86400 // expires in 24 hours
        });
        console.log(token);
        jwt.verify(token, secret, (err, decoded) => {
            console.log(decoded);
        });

        await res.status(201).json({token: token});
    } catch (e) {
        errorProps = Object.assign(errorProps, {unprocessableEntity: true});
        next(createError(422, 'Unprocessable Entity.', {errorProps: errorProps})); // 422: Unprocessable Entity. i.e. wrong data type
    }
});


module.exports = router;
