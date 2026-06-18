require('dotenv').config();
var express = require('express')
var cors = require('cors')
var app = express()


var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var { expressjwt: jwt } = require("express-jwt");

app.get("/", (req, res) => {
  res.status(200).send("Backend alive");
});

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var postsRouter = require('./routes/posts');
var followRouter = require('./routes/following');
var publicRouter = require('./routes/public');
var likeRouter = require('./routes/like');
var commentRouter = require('./routes/comments');

app.use(cors());

app.use(logger('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(jwt({ secret: process.env.JWT_SECRET, algorithms: ['HS256']}).unless({path: 
  ['/api/auth/signup', 
  '/api/auth/login', 
  '/api/posts/all-posts', 
  '/api/users/get-all-users',
  '/api/public/all-posts',
  '/api/public/get-all-users',
  { url: /^\/api\/public\/[^/]+\/likes$/, methods: ['GET'] },
  { url: /^\/api\/public\/users\/[^/]+$/, methods: ['GET'] },
  { url: /^\/api\/public\/users\/[^/]+\/posts$/, methods: ['GET'] },
  { url: /^\/api\/public\/posts\/[^/]+$/, methods: ['GET'] },
  { url: /^\/api\/public\/[^/]+\/follows$/, methods: ['GET'] },
]}));

app.use('/api', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);
app.use('/api/following', followRouter);
app.use('/api/public', publicRouter);
app.use('/api/like', likeRouter);
app.use('/api/comments', commentRouter);

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
  console.log(err);
  res.status(err.status || 500);
  res.send('error');
});

module.exports = app;
