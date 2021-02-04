const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const user = require('./routes/user');

const app = express();

const env = process.env.NODE_ENV;
if (env === 'prod') {
    app.use(logger('combined'));
} else if (env === 'dev') {
    app.use(logger('dev'));
}

app.use(express.json()); // JSON format post data
app.use(express.urlencoded({extended: false})); // Non JSON format post data
app.use(cookieParser());

app.use('/api/user', user);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // render the error page
    res.status(err.status || 500);
    res.send(err.status + ': ' + err.message);
});

module.exports = app;
