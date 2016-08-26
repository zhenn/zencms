var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session')
var bodyParser = require('body-parser');

var routes = require('./config/routes');
var formidable = require('express-formidable');
var db = require('./config/db');

var app = express();
var env = app.get('env');

// view engine setup
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'tmpl');

require('underscore-express')(app);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'ilovekiro',
  cookie: {
    maxAge: 60 * 30 *1000
  },
  resave:true,
  saveUninitialized: true
}));

// 接收upload文件的插件
app.use(formidable.parse({
  multiples: true
}));

// 路由配置
routes(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (env === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}
// production error handler
// no stacktraces leaked to user

// 生产环境启动
// NODE_ENV=product node ./bin/www
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

db.connect();

module.exports = app;
