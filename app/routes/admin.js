/*
 * -------------
 * Admin Routes
 * -------------
 */

 // Dependencies
 const fs = require('fs');
 const path = require('path');
 const router = require('express').Router();
 const accountManager = require('../modules/account-manager.js');
 const mailer = require('../modules/email');
 const utils = require('../modules/utilities.js');
 const reportGenerator = require('../modules/report_generator');

 // Config
 const config = require('../config')

/* GET home page. */
router.get('/', (req, res, next) => {
	if (!req.session.user) {
		if (req.cookies.basignio_username == undefined || req.cookies.basignio_password == undefined) {
			res.render('index', { title: 'BASignIO' });
		}else{
      try {
        accountManager.getUser({ username : req.cookies.basignio_username }, (account) => {
          if (account.message === 'SUCCESS') {
            // Check if password matches
            if (req.cookies.basignio_password === account.data.password) {
              req.session.user = account.data;
              res.redirect('/users/' + req.session.user.username + '/home')
            }
          }
          res.render('index', { title: 'BASignIO'});
        })
      } catch (e) {
        res.render('index', { title: 'BASignIO'});
      }
		}
	}else{
		res.redirect('/users/' + req.session.user.username + '/home')
	}
});

router.post('/', (req, res, next) => {
  try {
    accountManager.authenticate({
      username : req.body.uname,
      password : req.body.pword
    }, (account) => {
      if (account.message === 'NOT_FOUND') {
        res.render('index', { title: 'BASignIO', msg: 'Incorrect Username or Password'});
      } else if (account.message === 'INVALID_PASSWORD') {
        res.render('index', { title: 'BASignIO', msg: 'Incorrect Password'});
      } else {
        req.session.user = account.data;
        if (req.body.rememberme == 'on') {
          res.cookie('basignio_username', req.session.user.username, { maxAge: config.http.cookie_life});
          res.cookie('basignio_password', req.session.user.password, { maxAge: config.http.cookie_life});
        }

        res.redirect('/users/' + req.session.user.username + '/home');
      }
    })
  } catch (e) {
    console.log(e)
    res.render('index', { title: 'BASignIO', msg: 'Incorrect Username or Password'});
  }
});

router.get('/reset/:token', (req, res, next) => {
  res.render('resetpw', { title: 'BASignIO Admin: Reset Password', token: req.params.token});
})

router.post('/reset/:token', (req, res, next) => {
  if (req.body.rPword == req.body.rcPword) {
    if (req.body.rPword == "") {
      res.render('resetpw', { title: 'BASignIO Admin: Reset Password', token: req.params.token, msg: "Your password cannot be blank." });
    }else{
      try {
        accountManager.resetPassword({
          id : req.params.token,
          password : req.body.rPword
        }, (account) => {
          if (account.message === 'SUCCESS') {
            res.redirect('/');
          } else{
            console.log(account.message)
            res.render('resetpw', { title: 'BASignIO Admin: Reset Password', token: req.params.token, msg: "An error occured resetting your password." });
          }
        })
      } catch (e) {
        console.log(e)
      }
    }
  }else{
    console.log("Passwords do not match.")
    res.render('resetpw', { title: 'BASignIO Admin: Reset Password', token: req.params.token, msg: "Passwords do not match" });
  }
})

router.get('/export', (req, res) => {
  let location = typeof(req.query.loc) === 'string' && req.query.loc.length > 0 ? req.query.loc.trim() : false;
  let date = typeof(req.query.date) === 'string' && req.query.date.length > 0 ? req.query.date.trim() : utils.date();
  let filename;
	if (req.query.email) {
		reportGenerator.generateFireRegisterReport({
			date : date,
			location : location
		}, (error, report) => {
			if (error) {
				console.log(error);
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
					console.log(error);
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
})

router.get('/logout', (req, res, next) => {
	req.session.user = null;
	res.clearCookie('basignio_username');
	res.clearCookie('basignio_password');

	res.redirect('/');
});

module.exports = router;
