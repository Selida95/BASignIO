/*
 * -------------------------
 * BASignIO - Routes: Users
 * -------------------------
 */

 // Dependencies
 const express = require('express');
 const router = express.Router();
 const crypto = require('crypto');
 const fs = require('fs');
 const puppeteer = require('puppeteer');
 const path = require('path');
 const pag = require('../modules/pagination');
 const mailer = require('../modules/email');
 const utils = require('../modules/utilities');
 const accountManager = require('../modules/account-manager');
 const registerManager = require('../modules/register-manager')
 const fireRegisterManager = require('../modules/fire-register-manager')
 const staffManager = require('../modules/staff-manager');
 const useChecker = require('../modules/use-checker.js');

 // Config
 const config = require('../config')
 const secret = config.crypto.secret;

 // Database Models
 const student = require('../models/student');

/* GET users listing. */

router.get('/', (req, res, next) => {
  res.redirect('/');
});

router.get('/:user/home', (req, res, next) => {
	if (!req.session.user) {
		if (req.cookies.basio_user == undefined || req.cookies.basio_pass == undefined) {
			res.redirect('/admin');
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
          res.redirect('/');
        })
      } catch (e) {
        res.redirect('/');
      }
		}
	}else{
		let name = req.session.user.firstName ? req.session.user.firstName : req.session.user.username;
		res.render('home', { title: 'BASignIO Admin: Welcome ' + name.charAt(0).toUpperCase() + name.slice(1), user: req.session.user, role: req.session.user.role});
	}
});

router.post('/:user', (req, res, next) => {
	if (!req.session.user) {
		if (req.cookies.basio_user == undefined || req.cookies.basio_pass == undefined) {
			res.redirect('/admin');
		}else{
      try {
        accountManager.getUser({ username : req.cookies.basignio_username }, (account) => {
          if (account.message === 'SUCCESS') {
            // Check if password matches
            if (req.cookies.basignio_password === account.data.password) {
              req.session.user = account.data;
              res.redirect('/users/' + req.session.user.username)
            }
          }
          res.redirect('/');
        })
      } catch (e) {
        res.redirect('/');
      }
		}
	}else{
    let name = req.session.user.firstName ? req.session.user.firstName : req.session.user.username;
		if (!req.body.pwReset) {
			res.render('profile', { title: 'BASignIO Admin: Profile - ' + name.charAt(0).toUpperCase() + req.session.user.username.slice(1), user: req.session.user, role: req.session.user.role});
		}else{
			mailer.send({
				receiver: req.session.user.email,
				subject: 'BASignIO: Reset Password',
				text: 'Hi ' + name + ', <br><br> Please click the link below to change your password: <br><br> <a href="http://victoria:' + config.http.port + '/admin/reset/'+ req.session.user.password + '" > Reset Password </a> <br><br> Best Regards, <br>IT Department'
			}, (err, mail) => {
			    if (err) {
			        console.log(err);
			    }
				if (mail) {
				    console.log(mail);
				}
			});
			res.render('profile', { title: 'BASignIO Admin: Profile - ' + name.charAt(0).toUpperCase() + req.session.user.username.slice(1), user: req.session.user, role: req.session.user.role, msg: "Reset password email sent!!"});
		}
	}

});

router.get('/:user/users', (req, res, next) => {

	if (!req.session.user) {
		if (req.cookies.basio_user == undefined || req.cookies.basio_pass == undefined) {
			res.redirect('/admin');
		}else{
      try {
        accountManager.getUser({ username : req.cookies.basignio_username }, (account) => {
          if (account.message === 'SUCCESS') {
            // Check if password matches
            if (req.cookies.basignio_password === account.data.password) {
              req.session.user = account.data;
              res.redirect('/users/' + req.session.user.username + '/users');
            }
          }
          res.redirect('/');
        })
      } catch (e) {
        res.redirect('/');
      }
		}
	}else{
		if (req.session.user.role == 'admin') {
			if (req.query.r) {
				let id = req.query.r;
        try {
          accountManager.removeUser({ id : id }, (user) => {
            if (user.message === 'SUCCESS') {
              console.log('User was removed.');
              res.redirect('/users/' + req.session.user.username + '/users');
            }
          })
        } catch (e) {
          console.error(e)
        }
			}else if(req.query.e){
        try {
          accountManager.getAllUsers((accounts) => {
            if (accounts.message === 'SUCCESS') {
              accountManager.getUser({
                id : req.query.e
              }, (account) => {
                if (account.message === 'SUCCESS') {
                  res.render('users', { title: 'BASignIO Admin: Users', user: req.session.user, role: req.session.user.role, accounts: accounts.data, userEdit: account.data});
                } else {
                  res.redirect('/users/' + req.session.user.username + '/home');
                }
              })
            } else {
              res.redirect('/users/' + req.session.user.username + '/home');
            }
          })
        } catch (e) {
          console.error(e)
          res.redirect('/users/' + req.session.user.username + '/home');
        }
			}else{
        try {
          accountManager.getAllUsers((accounts) => {
            if (accounts.message === 'SUCCESS') {
              res.render('users', { title: 'BASignIO Admin: Users', user: req.session.user, role: req.session.user.role, accounts: accounts.data});
            } else {
              res.redirect('/users/' + req.session.user.username + '/home');
            }
          })
        } catch (e) {
          console.log(e)
          res.redirect('/users/' + req.session.user.username + '/home');
        }
			}
		}else{
			res.redirect('/users/' + req.session.user.username + '/home');
		}
	}
});

router.post('/:user/users', (req, res, next) => {

	if (!req.session.user) {
		if (req.cookies.basio_user == undefined || req.cookies.basio_pass == undefined) {
			res.redirect('/admin');
		}else{
      try {
        accountManager.getUser({ username : req.cookies.basignio_username }, (account) => {
          if (account.message === 'SUCCESS') {
            // Check if password matches
            if (req.cookies.basignio_password === account.data.password) {
              req.session.user = account.data;
              res.redirect('/users/' + req.session.user.username + '/users');
            }
          }
          res.redirect('/');
        })
      } catch (e) {
        res.redirect('/');
      }
		}
	}else{
		if (req.session.user.role == 'admin') {
      if (req.body.userSubmit) {
        if (req.body.password == req.body.cPassword) {
          try {
            accountManager.createNewUser({
              username : req.body.username,
              email : req.body.email,
              firstName : req.body.forenames,
              lastName : req.body.surname,
              password : req.body.password,
              role : req.body.roleType
            }, (account) => {
              if (account.message.includes('SUCCESS')) {
                console.log('New user created.')
                res.redirect('/users/' + req.session.user.username + '/users');
              }
            })
          } catch (e) {
            console.error(e)
          }
        } else {
          console.log('Passwords Do not match');
          res.redirect('/users/' + req.session.user.username + '/users');
        }
      } else if (req.body.userEditSubmit) {
        accountManager.updateUser({
          id : req.query.e,
          username : req.body.userEditUsername,
          firstName : req.body.userEditForenames,
          lastName : req.body.userEditSurname,
          email : req.body.userEditEmail,
          role : req.body.userEditRoleType
        }, (account) => {
          res.redirect('/users/' + req.session.user.username + '/users');
        })
      } else {
        res.redirect('/users/' + req.session.user.username + '/users');
      }
		}else{
			res.redirect('/users/' + req.session.user.username + '/home');
		}
	}
});

router.get('/:user/students', (req, res, next) => {

	if (!req.session.user) {
		if (req.cookies.basio_user == undefined || req.cookies.basio_pass == undefined) {
			res.redirect('/admin');
		}else{
			account.autoLogin(req.cookies.basio_user, req.cookies.basio_pass, (o) => {
				if (o != null) {
					req.session.user = o;
					var name;
					if (req.session.user.forenames) {
						name = req.session.user.forenames;
					}else{
						name = req.session.user.username;
					}
					//res.render('home', { title: 'BASignIO Admin: Welcome ' + name.charAt(0).toUpperCase() + name.slice(1)});
					res.redirect('/users/' + req.session.user.username + '/students');
				}else{
					res.redirect('/')
				}
			})
		}
	}else{

		if (req.query.r) {
			var id = req.query.r;
			//console.log('id: '+ id);

			student.findOneAndRemove({'_id': id}, (err, students) => {
				if (err) {
					console.error('Error: ' + err);
				};
					console.log('Student was removed.');
					res.redirect('/users/' + req.session.user.username + '/students');
			});
		}else if(req.query.e){
			var query = req.url.split('?')[1]
			console.log(query);

			//Current Page
			var currentPage = req.query.page;

			var search = {};

			pag.pagination(student, currentPage, search, (err, params) => {
				student.find(search, (err, students) => {
					student.findOne({'_id': req.query.e}, (err, stuEdit) => {
						res.render('stuList', { title: 'BASignIO Admin: Student List',  user: req.session.user, cDate: utils.date(), role: req.session.user.role, stuEdit: stuEdit, students: students, sort: req.query.sort, search: search, totalPages: params.totalPages, prevPage: params.prevPage, nextPage: params.nextPage, pageNum: currentPage, fvp: params.fvp, lvp: params.lvp, query: query});
					})
				}).limit(params.maxDocs).skip(params.skipPages).sort({yearGroup: 1})
			})

		}else{

			var query = req.url.split('?')[1]
			console.log(query);

			//Current Page
			var currentPage = req.query.page;

			var search = {};

			pag.pagination(student, currentPage, search, (err, params) => {
				student.find(search, (err, students) => {
					//console.dir(students);
					res.render('stuList', { title: 'BASignIO Admin: Student List',  user: req.session.user, cDate: utils.date(), role: req.session.user.role, students: students, sort: req.query.sort, search: search, totalPages: params.totalPages, prevPage: params.prevPage, nextPage: params.nextPage, pageNum: currentPage, fvp: params.fvp, lvp: params.lvp, query: query});
				}).limit(params.maxDocs).skip(params.skipPages).sort({yearGroup: 1})
			})
		}
	}
});

router.post('/:user/students', (req, res, next) => {

	if (!req.session.user) {
		if (req.cookies.basio_user == undefined || req.cookies.basio_pass == undefined) {
			res.redirect('/admin');
		}else{
			account.autoLogin(req.cookies.basio_user, req.cookies.basio_pass, (o) => {
				if (o != null) {
					req.session.user = o;
					var name;
					if (req.session.user.forenames) {
						name = req.session.user.forenames;
					}else{
						name = req.session.user.username;
					}
					//res.render('home', { title: 'BASignIO Admin: Welcome ' + name.charAt(0).toUpperCase() + name.slice(1)});
					res.redirect('/users/' + req.session.user.username + '/students');
				}else{
					res.redirect('/')
				}
			})
		}
	}else{
		if (req.body.stuEditSubmit) {
			var id = req.body.stuEditCadid;
			var cardID = req.body.stuEditCardid;
			var surname = req.body.stuEditSurname;
			var forenames = req.body.stuEditForenames;
			var yearGroup = req.body.stuEditYearGroup;
			var house = req.body.stuEditHouse;
			var tutorGrp = req.body.stuEditTutorGrp;



			student.findOne({_id: req.query.e}, (err, doc) => {
				if (err) {
					console.log('Err: ' + err);
				}

				if (doc) {
					doc._id = id;
					doc.cardID = cardID;
					doc.surname = surname;
					doc.forenames = forenames;
					doc.tutorGrp = tutorGrp;
					doc.house = house;
					doc.yearGroup = yearGroup;


					doc.save();

					var query = req.url.split('?')[1];
					var query = query.split('&')[0];

					res.redirect('/users/' + req.session.user.username + '/students?' + query);
				}
			});
		}


		if (req.body.stuSubmit){
			var id = req.body.cadid;
			var cardID = req.body.cardid;
			var surname = req.body.surname;
			var forenames = req.body.forenames;
			var yearGroup = req.body.yearGroup;
			var house = req.body.house;
			var tutorGrp = req.body.tutorGrp;

			if (id == "") {
				res.redirect('/users/' + req.session.user.username + '/' +  'students');
			}
			if (surname == "") {
				res.redirect('/users/' + req.session.user.username + '/' + 'students');
			}
			if (forenames == "") {
				res.redirect('/users/' + req.session.user.username + '/' +  'students');
			}
			if (yearGroup == "") {
				res.redirect('/users/' + req.session.user.username + '/' +  'students');
			}


		    var Student = new student({
		    	_id: id,
		    	cardID: cardID,
				surname: surname,
				forenames: forenames,
				yearGroup: yearGroup,
				house: house,
				tutorGrp: tutorGrp,
				manualCount: 0
			},
			{
				collection: 'students',
				versionKey: false
			});

			Student.save((err, Student) => {
				if (err) return console.error(err);
				console.dir(Student);
			})
			res.redirect('/users/' + req.session.user.username + '/students');
		}else{
			var query = req.url.split('?')[1]
			console.log(query);

			var currentPage = req.query.page;

			var search = {};

			pag.pagination(student, currentPage, search, (err, params) => {
				student.find(search, (err, students) => {
					//console.dir(students);
					res.render('stuList', { title: 'BASignIO Admin: Student List',  user: req.session.user, cDate: utils.date(), role: req.session.user.role, students: students, sort: req.query.sort, search: search, totalPages: params.totalPages, prevPage: params.prevPage, nextPage: params.nextPage, pageNum: params.currentPage, fvp: params.fvp, lvp: params.lvp, query: query});
				}).limit(params.maxDocs).skip(params.skipPages).sort({surname: 1})
			})
		}
	}
});

router.get('/:user/staff', (req, res, next) => {

	if (!req.session.user) {
		if (req.cookies.basio_user == undefined || req.cookies.basio_pass == undefined) {
			res.redirect('/admin');
		}else{
			account.autoLogin(req.cookies.basio_user, req.cookies.basio_pass, (o) => {
				if (o != null) {
					req.session.user = o;
					var name;
					if (req.session.user.forenames) {
						name = req.session.user.forenames;
					}else{
						name = req.session.user.username;
					}
					//res.render('home', { title: 'BASignIO Admin: Welcome ' + name.charAt(0).toUpperCase() + name.slice(1)});
					res.redirect('/users/' + req.session.user.username + '/staff');
				}else{
					res.redirect('/')
				}
			})
		}
	}else{
    let staffEdit = null;
    if (req.query.r) {
      try {
        staffManager.removeStaff(req.query.r, (removed) => {
          if (removed.message === 'SUCCESS') {
            console.log('Staff was removed.');
          } else {
            console.log('Staff was not found.');
          }
          res.redirect('/users/' + req.session.user.username + '/staff');
        })
      } catch (e) {
        console.log(e)
      }
    }

    if (req.query.e) {
      try {
        staffManager.getStaff({
          id : req.query.e
        }, (staff) => {
          if (staff.message === 'SUCCESS') {
            staffEdit = staff.data
          }
        })
      } catch (e) {
        console.log(e)
      }
    }

    staffManager.getAllStaff((staff) => {
      let staffData = null
      if (staff.message === 'SUCCESS') {
        staffData = staff.data
      } else {
        staffData = {}
      }

      res.render('staffList', { title: 'BASignIO Admin: Staff List',  user: req.session.user, cDate: utils.date(), role: req.session.user.role, staffs: staffData, staffEdit: staffEdit });
    })
	}
});

router.post('/:user/staff', (req, res, next) => {
  let staffEdit = null;
	if (!req.session.user) {
		if (req.cookies.basio_user == undefined || req.cookies.basio_pass == undefined) {
			res.redirect('/admin');
		}else{
			account.autoLogin(req.cookies.basio_user, req.cookies.basio_pass, (o) => {
				if (o != null) {
					req.session.user = o;
					var name;
					if (req.session.user.forenames) {
						name = req.session.user.forenames;
					}else{
						name = req.session.user.username;
					}
					//res.render('home', { title: 'BASignIO Admin: Welcome ' + name.charAt(0).toUpperCase() + name.slice(1)});
					res.redirect('/users/' + req.session.user.username + '/staff');
				}else{
					res.redirect('/')
				}
			})
		}
	}else{
		if (req.body.staffEditSubmit) {
      try {
        staffManager.updateStaff({
          id : req.body.staffEditID,
          cardID : req.body.staffEditCardID,
          cardID2 : req.body.staffEditCardID2,
          surname : req.body.staffEditSurname,
          forenames : req.body.staffEditForenames,
          staffType : req.body.staffEditStaffType,
          department : req.body.staffEditDepartment
        }, (updated) => {
          res.redirect('/users/' + req.session.user.username + '/staff');
        })
      } catch (e) {
        console.log(e)
      }
		}

		if (req.body.staffSubmit){
      try {
        staffManager.createNewStaff({
          id : req.body.staffid,
          cardID : req.body.cardid,
          cardID2 : req.body.cardid2,
          surname : req.body.surname,
          forenames : req.body.forenames,
          department : req.body.department,
          staffType : req.body.staffType
        }, (staff) => {
          res.redirect('/users/' + req.session.user.username + '/staff');
        })
      } catch (e) {
        console.log(e)
      }
		}
	}
});

router.all('/:user/registers', (req, res, next) => {

	if (!req.session.user) {
		if (req.cookies.basio_user == undefined || req.cookies.basio_pass == undefined) {
			res.redirect('/admin');
		}else{
			account.autoLogin(req.cookies.basio_user, req.cookies.basio_pass, (o) => {
				if (o != null) {
					req.session.user = o;
					var name;
					if (req.session.user.forenames) {
						name = req.session.user.forenames;
					}else{
						name = req.session.user.username;
					}
					//res.render('home', { title: 'BASignIO Admin: Welcome ' + name.charAt(0).toUpperCase() + name.slice(1)});
					res.redirect('/users/' + req.session.user.username + '/registers');
				}else{
					res.redirect('/')
				}
			})
		}
	}else{
    // Create query object with date key set to current date
    let query = {
      date : utils.date()
    }
    try {
      if (req.query.sort == 'all') {
        // If sortDate exists set query.date to sortDate
        if (req.query.sortDate) query.date = req.query.sortDate
        registerManager.getAllRecords(query, (records) => {
          if (records.message === 'SUCCESS') {
            res.render('regList', { title: 'BASignIO Admin: Registers',  user: req.session.user, cDate: utils.date(), role: req.session.user.role, registers: records.data, sort: req.query.sort});
          } else {
            res.render('regList', { title: 'BASignIO Admin: Registers',  user: req.session.user, cDate: utils.date(), role: req.session.user.role, registers: {}, sort: req.query.sort});
          }
        })
  		}else{
        // Get all records that are currently signed in.
        query.io = 1
        fireRegisterManager.getAllRecords(query, (records) => {
          if (records.message === 'SUCCESS') {
            res.render('regList', { title: 'BASignIO Admin: Registers',  user: req.session.user, cDate: utils.date(), role: req.session.user.role, registers: records.data, sort: req.query.sort});
          } else {
            res.render('regList', { title: 'BASignIO Admin: Registers',  user: req.session.user, cDate: utils.date(), role: req.session.user.role, registers: {}, sort: req.query.sort});
          }
        })
  		}
    } catch (e) {
      console.log(e)
      req.flash('error', 'There was an error. Please contact admin.');
      res.redirect('/' + req.session.user.username + '/registers');
    }
	}
});

router.all('/:user/export', (req, res, next) => {

	if (!req.session.user) {
		if (req.cookies.basio_user == undefined || req.cookies.basio_pass == undefined) {
			res.redirect('/admin');
		}else{
			account.autoLogin(req.cookies.basio_user, req.cookies.basio_pass, (o) => {
				if (o != null) {
					//console.log(o);
					req.session.user = o;
					var name;
					if (req.session.user.forenames) {
						name = req.session.user.forenames;
					}else{
						name = req.session.user.username;
					}
					//res.render('home', { title: 'BASignIO Admin: Welcome ' + name.charAt(0).toUpperCase() + name.slice(1)});
					res.redirect('/users/' + req.session.user.username + '/export');
				}else{
					res.redirect('/')
				}
			})
		}
	}else{
		if (req.body.exportSub == 'Submit') {
	        if (req.body.expTypeAns == 'PDF') {
              var date = req.body.date;
              (async () => {
                const browser = await puppeteer.launch();
                const page = await browser.newPage();
                await page.goto("http://localhost:3000/admin/export/pdfExport?date=" + date);
                await page.pdf({path: './app/public/reports/BASignIO-' + date + '.pdf', format: 'A4'});

                await browser.close();
                await res.sendFile(path.join(__dirname, '../public/reports/', 'BASignIO-' + date + '.pdf'));
                //await res.download(path.join(__dirname, '../public/reports/', 'BASignIO-' + date + '.pdf'));
              })();
	            //res.render('export', { title: 'BASignIO Admin: Export', user: req.session.user.username});
	    	}else{
				  res.render('export', { title: 'BASignIO Admin: Export', user: req.session.user, date: utils.date(), role: req.session.user.role, request: 'NULL'});
	      };
    	}else{
    		res.render('export', { title: 'BASignIO Admin: Export', user: req.session.user, date: utils.date(), role: req.session.user.role, request: 'NULL'});
    	};
    }
});

router.get('/:user/about', (req, res, next) => {
	res.render('about', { title: 'BASignIO Admin: About',  user: req.session.user, role: req.session.user.role});
});

module.exports = router;
