var express = require('express');
var app = express();
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var HttpError = require('./error').HttpError;
var errorhandler = require('errorhandler');
var config = require('./config');
var mongoose = require('./libs/mongoose');
var session = require('express-session');


//подключем модули routes и users
var routes = require('./routes/index');
var frontpage = require('./routes/frontpage');
var users = require('./routes/users');
var login = require('./routes/login');
var chat = require('./routes/chat');
var logout = require('./routes/logout');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

var sessionStore = require('./libs/sessionStore');

app.use(session({
  secret: config.get('session:secret'),
  key: config.get('session:key'),
  cookie: config.get('session:cookie'),
  store: sessionStore,
  resave: true,
  saveUninitialized: true
}));

//app.use(function(req, res, next) {
//  req.session.numberOfVisits = req.session.numberOfVisits + 1 || 1;
//  res.send("Visits: " + req.session.numberOfVisits);
//});

app.use(require('./middleware/sendHttpError.js'));
app.use(require('./middleware/loadUser.js'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', frontpage);
app.use('/users', users);
app.use('/login', login);
app.use('/chat', chat);
app.use('/logout', logout);


// catch 404 and forward to error handler
//app.use(function(req, res, next) {
//    var err = new Error();
//    next(err);
//});
app.use(function(err, req, res, next) {
  if (typeof err == 'number') {
    err = new HttpError(err);
  }
  if (err instanceof HttpError) {
    res.sendHttpError(err);
  }
  else {
    if(app.get('env') == 'development') {
      errorhandler()(err,req,res,next);
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err
      });
    }
    else {
      err = new HttpError(500);
      res.sendHttpError(err);
    }
  }
});

// error handlers

// development error handler
// will print stacktrace
//if (app.get('env') === 'development') {
//  app.use(function(err, req, res, next) {
//    res.status(err.status || 500);
//    res.render('error', {
//      message: err.message,
//      error: err
//    });
//  });
//}
//
//// production error handler
//// no stacktraces leaked to user
//app.use(function(err, req, res, next) {
//  res.status(err.status || 500);
//  res.render('error', {
//    message: err.message,
//    error: {}
//  });
//});

module.exports = app;

io = require('socket.io')();
app.io = io;

require('./socket')(io);


