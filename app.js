/*
 * --------------
 * BASignIO: App
 * --------------
 */

 // Dependencies
 const createError = require('http-errors');
 const express = require('express');
 const path = require('path');
 const cookieParser = require('cookie-parser');
 const logger = require('morgan');
 const mongoose = require('mongoose');
 const favicon = require('serve-favicon');
 const session = require('express-session');
 const flash = require('connect-flash');
 const crypto = require('crypto');

 /* --- Config --- */
 const config = require('./app/config');
 /* -------------- */

 /* --- Database --- */
 mongoose.Promise = global.Promise;
 mongoose.connect('mongodb://' + config.db.host + '/' + config.db.name, {
 })

 var db = mongoose.connection;
 db.on('error', console.error.bind(console, 'connection error:'));
 db.once('open', () => {
   console.log('Connected to Database...');
 });
 /* ---------------- */

 /* --- Routers --- */
 const indexRouter = require('./app/routes/index');
 const adminRouter = require('./app/routes/admin');
 const usersRouter = require('./app/routes/users');
 const reportRouter = require('./app/routes/report');
 const registerRouter = require('./app/routes/registers');
 /* --------------- */

 const app = express();

 // view engine setup
 app.set('views', path.join(__dirname, 'app', 'views'));
 app.set('view engine', 'pug');

 app.use(favicon(path.join(__dirname, 'app', 'public', 'img', 'favicon.ico')));
 app.use(logger('dev'));
 app.use(express.json());
 app.use(express.urlencoded({ extended: false }));
 app.use(cookieParser());
 app.use(session({
   secret : config.http.session.secret,
   resave : false,
   saveUninitialized : true
 }));
 app.use(express.static(path.join(__dirname, 'app', 'public')));
 app.use(flash());
 app.use((req, res, next) => {
   res.locals.success = req.flash('success');
   res.locals.error = req.flash('error');
   res.locals.warning = req.flash('warning');
   next();
 })

 app.use('/', indexRouter);
 app.use('/admin', adminRouter);
 app.use('/users', usersRouter);
 app.use('/reports', reportRouter);
 app.use('/reg', registerRouter);

 // catch 404 and forward to error handler
 app.use((req, res, next) => {
   next(createError(404));
 });

 // error handler
 app.use((err, req, res, next) => {
   // set locals, only providing error in development
   res.locals.message = err.message;
   res.locals.error = req.app.get('env') === 'development' ? err : {};

   // render the error page
   res.status(err.status || 500);
   res.render('error');
 });

 app.locals.ucfirst = (value) => {
   return value.charAt(0).toUpperCase() + value.slice(1);
 }

 /* --- Create Default Admin User --- */
 var accounts = require('./app/models/accounts');

 accounts.findOne({'username' : 'admin'}, (error, doc) => {
   if (error) {
     console.error(error);
     return;
   }

   if (doc) {
     console.log("Admin user exists. Moving on...")
   } else {
     console.log("Creating Admin user...")
     var account = new accounts({
       username: 'admin',
       surname: '',
       forenames: '',
       password: crypto.createHmac('sha256', config.crypto.secret).update(config.admin.password).digest('hex'),
       role: 'admin'
     })

     account.save((error) => {
       if (error) {
         console.error(error);
         return;
       }
       console.log('Created Admin account.')
     })
   }
 })
 /* ------------------------- */

 // Export module
 module.exports = app;
