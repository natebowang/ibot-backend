const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const {redisClient} = require('./db/connection');
const signup = require('./routes/signup');
const login = require('./routes/login');
const {sessionSecret} = require('./secret.js');

const app = express();

// Different logger output format for different node environment.
const env = process.env.NODE_ENV;
if (env === 'prod') {
    app.use(logger('combined'));
} else if (env === 'dev') {
    app.use(logger('dev'));
}

// Header and body Parsers
app.use(express.json()); // Middleware for JSON format post data
app.use(express.urlencoded({extended: false})); // Middleware for Non JSON format post data
app.use(cookieParser()); // Middleware for cookie

// Session
app.use(session({
    name: 'sessionID', // cookie的名字
    secret: sessionSecret, // session id可能是连续数字，或者Random.nextInt()。这样很容易被黑客猜到规律，进而伪造session id。所以需要对session id加盐之后hash。这个secret就是盐。
    resave: false, // session没有发生改变也要重新save到redis里一遍，通常都是false
    saveUninitialized: true, // 如果为true，空session {}也会被存储到redis，然后给Client一个sessionID。如果为false，session如果为空，request结束session就删除了，也不会给客户发sessionID。false可以避免存储很多空object。true的话便于跟踪用户。
    rolling: true, // false: session改变才刷新cookie（主要是过期时间），true：每次操作都刷新cookie。如果不设置rolling，也可以调用req.session.touch()方法来强制更新。
    cookie: {
        path: '/', // default /
        httpOnly: true, // default true
        maxAge: 31536000000 // 默认值session。单位ms，一天24*60*60*1000=86400000，一年31536000000。
    },
    store: new RedisStore({client: redisClient}) // default new MemoryStore()
}));

// Routers
app.use('/api/signup', signup);
app.use('/api/login', login);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
    // render the error page
    res.status(err.status || 500);
    // res.send(res.status + ': ' + err.message);
    res.json(err.errorProps);
});

module.exports = app;
