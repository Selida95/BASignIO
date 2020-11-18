/*
 * -------------------------
 * BASignIO - Routes: Admin
 * -------------------------
 */

 // Dependencies
 const router = require('express').Router();
 const accountManager = require('../lib/accountManager');
 const reportGenerator = require('../lib/report_generator');

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

 router.get('/reset/:token', (req, res, next) => {
   res.render('resetpw', { title: 'BASignIO Admin: Reset Password', token: req.params.token});
 })

 router.post('/reset:token', (req, res, next) => {
   if (req.body.rPword == req.body.rcPword) {
     if (req.body.rPword == "") {
       res.render('resetpw', { title: 'BASignIO Admin: Reset Password', token: req.params.token, msg: "Your password cannot be blank." });
     } else {
       let hashedPassword = crypto.createHmac('sha256', config.crypto.secret)
                                  .update(req.body.rPword)
                                  .digest('hex');

       accountModel.findOne({ password : req.params.token }, (error, doc) => {
         if (error) {
           console.error("ERROR: " + error)
           return;
         }

         if (doc) {
           doc.password = hashedPassword;
           doc.save();
           res.redirect('/')
         }
       });
     }
   } else{
     console.log("Passwords do not match.");
     res.render('resetpw', { title: 'BASignIO Admin: Reset Password', token: req.params.token, msg: "Passwords do not match" });
   }
 });

 router.get('/export', (req, res) => {
   let location = typeof(req.query.loc) === 'string' && req.query.loc.length > 0 ? req.query.loc.trim() : false;
   let date = typeof(req.query.date) === 'string' && req.query.date.length > 0 ? req.query.date.trim() : functions.date();
   let filename;

   if (req.query.email) {
     reportGenerator.generateFireRegisterReport({
       date : date,
       location : location
     }, (error, report) => {
       if (error) {
         console.error(error);
         return;
       }

       if (location) {
         filename = 'BASignIO-' + location + '-' + date + '.pdf';
       } else {
         filename = 'BASignIO-' + date + '.pdf';
       }

       mailer.send({
         receiver: req.query.email,
         subject: 'BASignIO: Fire register',
         text: 'Attached is the list of signed in staff and students at the time that this email was sent.',
         attachment: {
           filename: filename,
           path: report.path
         }
       }, (error, mail) => {
         if (error) {
           console.error(error);
           return;
         }

         console.log(mail);
         res.sendFile(report.path);
       });
     });
   } else {
     reportGenerator.generateRegisterReport({
 			date : req.query.date,
 			location : req.query.loc
 		 }, (error, report) => {
 			if (error) {
 				console.log("Error: " + error);
 				return;
 			}
 			res.sendFile(report.path);
 		 });
   }
 });

 router.get('/logout', (req, res, next) => {
   req.session.user = null;
   res.clearCookie('basignio_username');
   res.clearCookie('basignio_password');

   res.redirect('/');
 });

 // Export Routes
 module.exports = router;
