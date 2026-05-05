require('dotenv').config();
var express = require('express')
var cors = require('cors')
var app = express()


var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var { expressjwt: jwt } = require("express-jwt");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var postsRouter = require('./routes/posts');

app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(jwt({ secret: process.env.JWT_SECRET, algorithms: ['HS256']}).unless({path: ['/api/auth/signup', '/api/auth/login']}));

app.use('/api', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send('error');
});

module.exports = app;
