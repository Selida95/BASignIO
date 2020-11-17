/*
 * ----
 * BASignIO: App
 * ----
 */

 // Dependencies
 const createError = require('http-errors');
 const express = require('express');
 const path = require('path');
 const cookieParser = require('cookie-parser');
 const logger = require('morgan');
 const mongoose = require('mongoose');

 /* --- Config --- */
 const config = require('./app/config');
 /* -------------- */



 /* --- Routers --- */
 const indexRouter = require('./routes/app/index');
 const adminRouter = require('./routes/app/admin');
 const usersRouter = require('./routes/app/users');
 const reportRouter = require('./routes/app/report');
 const registerRouter = require('./routes/app/registers');
 /* --------------- */

 const app = express();

 // view engine setup
 app.set('views', path.join(__dirname, 'app', 'views'));
 app.set('view engine', 'pug');

 app.use(logger('dev'));
 app.use(express.json());
 app.use(express.urlencoded({ extended: false }));
 app.use(cookieParser());
 app.use(express.static(path.join(__dirname, 'app', 'public')));

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

 // Export module
 module.exports = app;
