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
 const studentManager = require('../modules/student-manager')
 const useChecker = require('../modules/use-checker.js');

 // Config
 const config = require('../config')
 const secret = config.crypto.secret;

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
    let stuEdit = null;
    if (req.query.r) {
      try {
        studentManager.removeStudent({ id : req.query.r }, (student) => {
          if (student.message === 'SUCCESS') {
            console.log(`Log: ${utils.date()} ${utils.time()} | ${student.data._id}: ${student.data.forenames} ${student.data.surname} was removed`)
          } else {
            console.log(`Log: ${utils.date()} ${utils.time()} | Failed to remove student with id: ${req.query.r}`)
          }
          res.redirect('/users/' + req.session.user.username + '/students');
        })
      } catch (e) {
        console.log(e)
      }
    }

    if (req.query.e) {
      try {
        studentManager.getStudent({
          id : req.query.e
        }, (student) => {
          if (student.message === 'SUCCESS') {
            stuEdit = student.data
          }
        })
      } catch (e) {
        console.log(e)
      }
    }

    if (!req.query.r) {
      try {
        studentManager.getAllStudents((student) => {
          let stuData = null
          if (student.message === 'SUCCESS') {
            stuData = student.data
          } else {
            stuData = {}
          }
          res.render('stuList', { title: 'BASignIO Admin: Student List',  user: req.session.user, cDate: utils.date(), role: req.session.user.role, students: stuData, stuEdit: stuEdit });
        })
      } catch (e) {
        console.log(e)
      }
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
      try {
        studentManager.updateStudent({
          id : req.body.stuEditCadid,
          cardID : req.body.stuEditCardid,
          forenames : req.body.stuEditForenames,
          surname : req.body.stuEditSurname,
          yearGroup : req.body.stuEditYearGroup,
          house : req.body.stuEditHouse,
          tutorGrp : req.body.stuEditTutorGrp
        }, (student) => {
          if (student.message === 'SUCCESS') {
            console.log(`Log: ${utils.date()} ${utils.time()} | ${student.data._id}: ${student.data.forenames} ${student.data.surname} was updated.`)
          } else {
            console.log(`Log: ${utils.date()} ${utils.time()} | Failed to update student with id: ${req.query.r}`)
          }
        })
      } catch (e) {
        console.log(e)
      }
		}

    if (req.body.stuSubmit) {
      try {
        studentManager.createNewStudent({
          id : req.body.cadid,
          cardID : req.body.cardid,
          forenames : req.body.forenames,
          surname : req.body.surname,
          yearGroup : req.body.yearGroup,
          house : req.body.house,
          tutorGrp : req.body.tutorGrp
        }, (student) => {
          if (student.message === 'SUCCESS') {
            console.log(`Log: ${utils.date()} ${utils.time()} | New student, ${student.data.forenames} ${student.data.surname}, was created.`)
          } else {
            console.log(`Log: ${utils.date()} ${utils.time()} | Failed to create new student.`)
          }
        })
      } catch (e) {
        console.log(e)
      }
    }

    res.redirect('/users/' + req.session.user.username + '/students');
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
        staffManager.removeStaff({ id : req.query.r }, (removed) => {
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
          cardID2 : req.body.staffEditCardID,
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
          cardID2 : req.body.cardid,
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
