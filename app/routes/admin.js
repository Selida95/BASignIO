/*
 * -------------------------
 * BASignIO - Routes: Admin
 * -------------------------
 */

 // Dependencies
 const router = require('express').Router();

 // Config
 const config = require('../config');

 // Database Models
 const accountModel = require('../models/accounts');

 router.get('/', (req, res, next) => {
   if (!req.session.user) {
     if (req.cookies.basignio_username == undefined || req.cookies.basignio_password == undefined) {
       res.render('index', { title : 'BASignIO'});
     } else {
       accountManager.autoLogin(reg.cookies.basignio_username, req.cookies.basignio_password, (user) => {
         if (user != null) {
           req.session.user = user;
           res.redirect('/users/' + req.session.user.username + '/home');
         } else {
           res.render('index', { title : 'BASignIO'});
         }
       })
     }
   } else {
     res.redirect('/users/' + req.session.user.username + '/home');
   }
 });

 router.post('/', (req, res, next) => {
   accountManager.manualLogin(req.body.uname, req.body.pword, (error, user) => {
     if (!user) {
       if (error == 'user-not-found') {
         res.render('index', { title: 'BASignIO', msg: 'Incorrect Username or Password'});
       } else {
         res.render('index', { title: 'BASignIO', msg: 'Incorrect Password'});
       }
     } else {
       req.session.user = user;
       if (req.body.rememberme == 'on') {
         res.cookie('basignio_username', req.session.user.username, { maxAge: config.http.cookie_life});
         res.cookie('basignio_password', req.session.user.password, { maxAge: config.http.cookie_life});

         res.redirect('/users/' + req.session.user.username + '/home');
       } else {
         res.redirect('/users/' + req.session.user.username + '/home');
       }
     }
   });
 });


 // Export Module
 module.exports = router;
