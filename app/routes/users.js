const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const fs = require('fs');
const puppeteer = require('puppeteer');
const path = require('path');
//const client = require("jsreport-client")('http://victoria:5488');

const pag = require('../modules/pagination');
const mailer = require('../modules/email');
const functions = require('../modules/functions');
const account = require('../modules/account-manager');
const useChecker = require('../modules/use-checker.js');

// Config
const config = require('../config')
const secret = config.crypto.secret;

var student = require('../models/student');
var staff = require('../models/staff');
var registers = require('../models/register');
var fRegisters = require('../models/fireRegister');
//var client = require("jsreport-client")('http://localhost:5488');

/* GET users listing. */

router.get('/', function(req, res, next) {
  res.redirect('/');
});

router.get('/:user/home', function(req, res, next) {
	if (!req.session.user) {
		if (req.cookies.basio_user == undefined || req.cookies.basio_pass == undefined) {
			res.redirect('/admin');
		}else{
			account.autoLogin(req.cookies.basio_user, req.cookies.basio_pass, function(o){
				if (o != null) {
					req.session.user = o;
					var name;
					if (req.session.user.forenames) {
						name = req.session.user.forenames;
					}else{
						name = req.session.user.username;
					}

					useChecker.stuCheck(function(stu){
				      console.log(stu._id + " - " + stu.forenames + " " + stu.surname)
				    })
					//console.log(functions.date());
					//res.render('home', { title: 'BASignIO Admin: Welcome ' + name.charAt(0).toUpperCase() + name.slice(1)});
					res.redirect('/users/' + req.session.user.username + '/home');
				}else{
					res.redirect('/')				}
			})
		}
	}else{
		var name;
		if (req.session.user.forenames) {
			name = req.session.user.forenames;
		}else{
			name = req.session.user.username;
		}
		res.render('home', { title: 'BASignIO Admin: Welcome ' + name.charAt(0).toUpperCase() + name.slice(1), user: req.session.user, role: req.session.user.role});
	}
});

router.post('/:user', function(req, res, next) {
	if (!req.session.user) {
		if (req.cookies.basio_user == undefined || req.cookies.basio_pass == undefined) {
			res.redirect('/admin');
		}else{
			account.autoLogin(req.cookies.basio_user, req.cookies.basio_pass, function(o){
				if (o != null) {
					req.session.user = o;
					var name;
					if (req.session.user.forenames) {
						name = req.session.user.forenames;
					}else{
						name = req.session.user.username;
					}
					//res.render('profile', { title: 'BASignIO Admin: Profile: ' + req.session.user.username.charAt(0).toUpperCase() + req.session.user.username.slice(1), user: req.session.user, role: req.session.user.role});
					res.redirect('/users/' + req.session.user.username);
				}else{
					res.redirect('/')
				}
			})
		}
	}else{
		if (!req.body.pwReset) {
			var name;
			if (req.session.user.forenames) {
				name = req.session.user.forenames;
			}else{
				name = req.session.user.username;
			}
			res.render('profile', { title: 'BASignIO Admin: Profile - ' + req.session.user.username.charAt(0).toUpperCase() + req.session.user.username.slice(1), user: req.session.user, role: req.session.user.role});
		}else{
			var name;
				if (req.session.user.forenames) {
					name = req.session.user.forenames;
				}else{
					name = req.session.user.username;
				}
			mailer.send({
				receiver: req.session.user.username + '@battleabbeyschool.com',
				subject: 'BASignIO: Reset Password',
				text: 'Hi ' + name + ', <br><br> Please click the link below to change your password: <br><br> <a href="http://victoria:' + config.http.port + '/admin/reset/'+ req.session.user.password + '" > Reset Password </a> <br><br> Best Regards, <br>IT Department'
			}, function(err, mail){
			    if (err) {
			        console.log(err);
			    }
				if (mail) {
				    console.log(mail);
				}
			});
			res.render('profile', { title: 'BASignIO Admin: Profile - ' + req.session.user.username.charAt(0).toUpperCase() + req.session.user.username.slice(1), user: req.session.user, role: req.session.user.role, msg: "Reset password email sent!!"});
		}
	}

});

router.get('/:user/users', function(req, res) {

	if (!req.session.user) {
		if (req.cookies.basio_user == undefined || req.cookies.basio_pass == undefined) {
			res.redirect('/admin');
		}else{
			account.autoLogin(req.cookies.basio_user, req.cookies.basio_pass, function(o){
				if (o != null) {
					req.session.user = o;
					var name;
					if (req.session.user.forenames) {
						name = req.session.user.forenames;
					}else{
						name = req.session.user.username;
					}
					//res.render('users', { title: 'BASignIO Admin: Users', user: req.session.user, date: functions.date(), role: req.session.user.role, accounts: accounts});
					res.redirect('/users/' + req.session.user.username + '/users');
				}else{
					res.redirect('/')
				}
			})
		}
	}else{


		if (req.session.user.role == 'admin') {
			var Account = require('../models/accounts.js');

			if (req.query.r) {
				var id = req.query.r;
				console.log('id: '+ id);
				Account.findOneAndRemove({'_id': id}, function(err, user){
					if (err) {
						console.error('Error: ' + err);
					};
					console.log('User was removed.');
					res.redirect('/users/' + req.session.user.username + '/users');
				});
			}else if(req.query.e){
				Account.find({}, function(err, accounts){
					Account.findOne({_id: req.query.e}, function(err, userEdit){
						if (err) {
							console.error(err);
						};

						if (userEdit) {
							console.dir(userEdit);
							console.log(userEdit.username);
							console.log(userEdit.forenames);
							console.log(userEdit.surname);
						}

						res.render('users', { title: 'BASignIO Admin: Users', user: req.session.user, role: req.session.user.role, accounts: accounts, userEdit: userEdit});
					})
				})
			}else{
				Account.find({}, function(err, accounts){
					if (err) {
						console.error(err);
					};

					res.render('users', { title: 'BASignIO Admin: Users', user: req.session.user, role: req.session.user.role, accounts: accounts});
				});
			}
		}else{
			res.redirect('/users/' + req.session.user.username);
		}
	}
});

router.post('/:user/users', function(req, res) {

	if (!req.session.user) {
		if (req.cookies.basio_user == undefined || req.cookies.basio_pass == undefined) {
			res.redirect('/admin');
		}else{
			account.autoLogin(req.cookies.basio_user, req.cookies.basio_pass, function(o){
				if (o != null) {
					req.session.user = o;
					var name;
					if (req.session.user.forenames) {
						name = req.session.user.forenames;
					}else{
						name = req.session.user.username;
					}
					//res.render('users', { title: 'BASignIO Admin: Users', user: req.session.user, date: functions.date(), role: req.session.user.role, accounts: accounts});
					res.redirect('/users/' + req.session.user.username + '/users');
				}else{
					res.redirect('/')
				}
			})
		}
	}else{


		if (req.session.user.role == 'admin') {
			var Account = require('../models/accounts.js');

			Account.find({}, function(err, accounts){
				if (err) {
					console.error(err);
				};

				if(req.body.userSubmit){

					if(req.body.password == req.body.cPassword){
						var pword = crypto.createHmac('sha256', secret)
										.update(req.body.password)
										.digest('hex');
						var account = new Account({
					    	username: req.body.username,
							surname: req.body.surname,
							forenames: req.body.forenames,
							password: pword,
							role: req.body.roleType
						},
						{
							collection: 'accounts',
							versionKey: false
						});

						account.save(function(err, acc){
							if (err) return console.error(err);
							console.dir(acc);
							mailer.send({
				                receiver: req.body.username + '@battleabbeyschool.com, pagee@battleabbeyschool.com',
				                subject: 'BASignIO: New User',
				                text: 'Hi ' + req.body.forenames +', <br> <br> Your username and password for the BASignIO Sign-in System are as follows: <br> <br> Username: ' + req.body.username + '<br> Password: ' + req.body.password + '<br><br> Best Regards, <br> IT Department'
				            }, function(err, mail){
				                if (err) {
				                  console.log(err);
				                }
				                if (mail) {
				                  console.log(mail);
				                }
				            });
						})
						console.log('New user created.')
						res.redirect('/users/' + req.session.user.username + '/users');
					}else{
						//error: passwords do not match
						console.log('Passwords Do not match');
						res.redirect('/users/' + req.session.user.username + '/users');
					}
				}else if(req.body.userEditSubmit){
					Account.findOne({_id: req.query.e}, function(err, doc){

						if (err) {
							console.log('Err: ' + err);
						}

						var username = req.body.userEditUsername;
						var surname = req.body.userEditSurname;
						var forenames = req.body.userEditForenames;
						var role = req.body.userEditRoleType;

						if (req.body.userEditPassword != "") {
							if (req.body.userEditPassword == req.body.userEditCPassword) {
								var pword = crypto.createHmac('sha256', secret)
												.update(req.body.userEditPassword)
												.digest('hex');
							}else{
								console.log("EDIT: Passwords do not match.")
							}
						}else{
							console.log('EDIT: Password NULL')
							var pword = doc.password;
						}

						if (doc) {
							doc.username = username;
							doc.surname = surname;
							doc.forenames = forenames;
							doc.role = yearGroup;
							doc.password = pword;

							doc.save();

							res.redirect('/users/' + req.session.user.username + '/users');
						}
					});
				}else{
					//console.log("userSubmit not set");
					console.log('No user created')
					res.render('users', { title: 'BASignIO Admin: Users', user: req.session.user, role: req.session.user.role, accounts: accounts});
				}
			});
		}else{
			res.redirect('/users/' + req.session.user.username);
		}
	}
});

router.get('/:user/students', function(req, res) {

	if (!req.session.user) {
		if (req.cookies.basio_user == undefined || req.cookies.basio_pass == undefined) {
			res.redirect('/admin');
		}else{
			account.autoLogin(req.cookies.basio_user, req.cookies.basio_pass, function(o){
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

			student.findOneAndRemove({'_id': id}, function(err, students){
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

			pag.pagination(student, currentPage, search, function(err, params){
				student.find(search, function(err, students){
					student.findOne({'_id': req.query.e}, function(err, stuEdit){
						res.render('stuList', { title: 'BASignIO Admin: Student List',  user: req.session.user, cDate: functions.date(), role: req.session.user.role, stuEdit: stuEdit, students: students, sort: req.query.sort, search: search, totalPages: params.totalPages, prevPage: params.prevPage, nextPage: params.nextPage, pageNum: currentPage, fvp: params.fvp, lvp: params.lvp, query: query});
					})
				}).limit(params.maxDocs).skip(params.skipPages).sort({yearGroup: 1})
			})

		}else{

			var query = req.url.split('?')[1]
			console.log(query);

			//Current Page
			var currentPage = req.query.page;

			var search = {};

			pag.pagination(student, currentPage, search, function(err, params){
				student.find(search, function(err, students){
					//console.dir(students);
					res.render('stuList', { title: 'BASignIO Admin: Student List',  user: req.session.user, cDate: functions.date(), role: req.session.user.role, students: students, sort: req.query.sort, search: search, totalPages: params.totalPages, prevPage: params.prevPage, nextPage: params.nextPage, pageNum: currentPage, fvp: params.fvp, lvp: params.lvp, query: query});
				}).limit(params.maxDocs).skip(params.skipPages).sort({yearGroup: 1})
			})
		}
	}
});

router.post('/:user/students', function(req, res) {

	if (!req.session.user) {
		if (req.cookies.basio_user == undefined || req.cookies.basio_pass == undefined) {
			res.redirect('/admin');
		}else{
			account.autoLogin(req.cookies.basio_user, req.cookies.basio_pass, function(o){
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



			student.findOne({_id: req.query.e}, function(err, doc){
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

			Student.save(function(err, Student){
				if (err) return console.error(err);
				console.dir(Student);
			})
			res.redirect('/users/' + req.session.user.username + '/students');
		}else{
			var query = req.url.split('?')[1]
			console.log(query);

			var currentPage = req.query.page;

			var search = {};

			pag.pagination(student, currentPage, search, function(err, params){
				student.find(search, function(err, students){
					//console.dir(students);
					res.render('stuList', { title: 'BASignIO Admin: Student List',  user: req.session.user, cDate: functions.date(), role: req.session.user.role, students: students, sort: req.query.sort, search: search, totalPages: params.totalPages, prevPage: params.prevPage, nextPage: params.nextPage, pageNum: params.currentPage, fvp: params.fvp, lvp: params.lvp, query: query});
				}).limit(params.maxDocs).skip(params.skipPages).sort({surname: 1})
			})
		}
	}
});

router.get('/:user/staff', function(req, res) {

	if (!req.session.user) {
		if (req.cookies.basio_user == undefined || req.cookies.basio_pass == undefined) {
			res.redirect('/admin');
		}else{
			account.autoLogin(req.cookies.basio_user, req.cookies.basio_pass, function(o){
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


		if (req.query.r) {
			var id = req.query.r;
			//console.log('id: '+ id);

			staff.findOneAndRemove({'_id': id}, function(err, staff){
				if (err) {
					console.error('Error: ' + err);
				};
					console.log('Staff was removed.');
					res.redirect('/users/' + req.session.user.username + '/staff');
			});
		}else if(req.query.e){
			var query = req.url.split('?')[1]
			console.log(query);

			//Current Page
			var currentPage = req.query.page;

			var search = {};

			pag.pagination(staff, currentPage, search, function(err, params){
				staff.find(search, function(err, staffs){
					staff.findOne({'_id': req.query.e}, function(err, staffEdit){
						res.render('staffList', { title: 'BASignIO Admin: Staff List',  user: req.session.user, cDate: functions.date(), role: req.session.user.role, staffEdit: staffEdit, staffs: staffs, sort: req.query.sort, search: search, totalPages: params.totalPages, prevPage: params.prevPage, nextPage: params.nextPage, pageNum: currentPage, fvp: params.fvp, lvp: params.lvp, query: query});
					})
				}).limit(params.maxDocs).skip(params.skipPages).sort({surname: 1})
			})

		}else{
			var query = req.url.split('?')[1]
			console.log(query);

			//Current Page
			var currentPage = req.query.page;

			var search = {};

			pag.pagination(staff, currentPage, query, function(err, params){
				staff.find(query, function(err, staffs){
					//console.dir(staffs);
					res.render('staffList', { title: 'BASignIO Admin: Staff List',  user: req.session.user, cDate: functions.date(), role: req.session.user.role, staffs: staffs, sort: req.query.sort, search: search, totalPages: params.totalPages, prevPage: params.prevPage, nextPage: params.nextPage, pageNum: currentPage, fvp: params.fvp, lvp: params.lvp, query: query});
				}).limit(params.maxDocs).skip(params.skipPages).sort({surname: 1})
			})
		}
	}
});

router.post('/:user/staff', function(req, res) {

	if (!req.session.user) {
		if (req.cookies.basio_user == undefined || req.cookies.basio_pass == undefined) {
			res.redirect('/admin');
		}else{
			account.autoLogin(req.cookies.basio_user, req.cookies.basio_pass, function(o){
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
			var id = req.body.staffEditID;
			var cardID = req.body.staffEditCardID;
			var cardID2 = req.body.staffEditCardID2;
			var surname = req.body.staffEditSurname;
			var forenames = req.body.staffEditForenames;
			var staffType = req.body.staffEditStaffType;
			var department = req.body.staffEditDepartment;



			staff.findOne({_id: req.query.e}, function(err, doc){
				if (err) {
					console.log('Err: ' + err);
				}

				if (doc) {
					doc._id = id;
					doc.cardID = cardID;
					doc.cardID2 = cardID2
					doc.surname = surname;
					doc.forenames = forenames;
					doc.staffType = staffType;
					doc.department = department;

					doc.save();

					var query = req.url.split('?')[1];
					var query = query.split('&')[0];

					res.redirect('/users/' + req.session.user.username + '/staff?' + query);
				}
			});
		}

		if (req.body.staffSubmit){

			var query = req.url.split('?')[1]
			console.log(query);

		    var Staff = new staff({
		    	_id: req.body.staffid,
		    	cardID: req.body.cardid,
		    	cardID2: req.body.cardid2,
				surname: req.body.surname,
				forenames: req.body.forenames,
				department: req.body.department,
				staffType: req.body.staffType
			},
			{
				collection: 'staff',
				versionKey: false
			});

			Staff.save(function(err, Staff){
				if (err) return console.error(err);
				console.dir(Staff);
			})
			res.redirect('/users/' + req.session.user.username + '/staff?page=1');
		}else{

			var query = req.url.split('?')[1]
			console.log(query);



			//Current Page
			var currentPage = req.query.page;

			var search = {};

			pag.pagination(staff, currentPage, query, function(err, params){
				staff.find(query, function(err, staffs){
					//console.dir(staffs);
					res.render('staffList', { title: 'BASignIO Admin: Staff List',  user: req.session.user, cDate: functions.date(), role: req.session.user.role, staffs: staffs, sort: req.query.sort, search: search, totalPages: params.totalPages, prevPage: params.prevPage, nextPage: params.nextPage, pageNum: currentPage, fvp: params.fvp, lvp: params.lvp});
				}).limit(params.maxDocs).skip(params.skipPages).sort({surname: 1})
			})
		};
	}
});

router.all('/:user/registers', function(req, res) {

	if (!req.session.user) {
		if (req.cookies.basio_user == undefined || req.cookies.basio_pass == undefined) {
			res.redirect('/admin');
		}else{
			account.autoLogin(req.cookies.basio_user, req.cookies.basio_pass, function(o){
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


		//Maximum number of documents from register shown
		var maxDocs = 15;
		//Maximum number of pages shown.
		var maxShownPages = 10;

		//Current Page
		var currentPage = req.query.page;
		var prevPage = +currentPage - 1;
		var nextPage = +currentPage + 1;

		//Defines sort fields


		var search = {};


		if (req.query.sortLoc) {
			search.loc = req.query.sortLoc;
		}
		if (req.query.sortType) {
			search.type = req.query.sortType;
		}
		if (req.query.sortDate != undefined) {
			search.date = req.query.sortDate;
		}else{
			search.date = functions.date();
		}
		if (req.query.sortYrGroup) {
			search.yearGroup = req.query.sortYrGroup;
		}

		if (req.query.sort == 'all') {
			registers.count(search, function(err, register){
				//Total number of records
				var numRec = register;
				console.log('Total # of Rec: ' + numRec)

				//number of pages in decimal
				var maxPages = (numRec / maxDocs)
				console.log('maxpages: ' + maxPages)

				//working out the true number of total pages
				if ((maxPages % 1) != 0) {
					var totalPages = (maxPages - (maxPages % 1)) + 1
				}/*else if((maxPages % 1) < 1 && (maxPages % 1) != 0){
					var totalPages = (maxPages - (maxPages % 1)) + 2
				}*/else{
					var totalPages = maxPages;
				}

				//if the current page is  1
				if ((+currentPage - 3) < 1) {
					//Set first visible page to 1
					var fvp = 1;

					if (totalPages <= 7) {
						var lvp = totalPages;
					}else{
						var lvp = 7;
					}

				}else{
					var fvp = +currentPage - 3;
					if ((+currentPage + 3) < totalPages) {
						var lvp = +currentPage + 3;
					}else{
						var lvp = totalPages;
					}
				}

				console.log('fvp: ' + fvp);
				console.log('lvp:' + lvp);

				var skipDocs = maxDocs*(currentPage - 1)
				console.log('SkipDocs: ' + skipDocs);

				console.log('Totalpages: ' + totalPages)
				registers.find(search, function(err, register){
					//console.dir(register);
					var sortData = ''
					for (var key in req.query) {
						if(key == 'page'){

						}else{
							sortData += '&' + key + '=' + req.query[key];
						}
					}
					console.log(sortData)

					res.render('regList', { title: 'BASignIO Admin: Registers',  user: req.session.user, cDate: functions.date(), role: req.session.user.role, registers: register, sort: req.query.sort, search: sortData, totalPages: totalPages, prevPage: prevPage, nextPage: nextPage, pageNum: currentPage, fvp: fvp, lvp: lvp});
				}).limit(maxDocs).skip(skipDocs).sort({_id: -1})
			})
		}else{
			search.io = 1;
			search.date = functions.date();
			fRegisters.count(search, function(err, fregister){
				//console.log(register);
				//Total number of records
				var numRec = fregister;
				console.log('Total # of Rec: ' + numRec)

				//number of pages in decimal
				var maxPages = (numRec / maxDocs)
				console.log('maxpages: ' + maxPages)

				//working out the true number of total pages
				if ((maxPages % 1) != 0) {
					var totalPages = (maxPages - (maxPages % 1)) + 1
				}/*else if((maxPages % 1) < 1){
					var totalPages = (maxPages - (maxPages % 1)) + 2
				}*/else{
					var totalPages = maxPages;
				}

				//if the current page is  1
				if ((+currentPage - 3) < 1) {
					//Set first visible page to 1
					var fvp = 1;

					if (totalPages <= 7) {
						var lvp = totalPages;
					}else{
						var lvp = 7;
					}

				}else{
					var fvp = +currentPage - 3;
					if ((+currentPage + 3) < totalPages) {
						var lvp = +currentPage + 3;
					}else{
						var lvp = totalPages;
					}
				}

				var lastPage = totalPages
				console.log('Totalpages: ' + totalPages)

				var skipDocs = maxDocs*(currentPage - 1)
				console.log('SkipDocs: ' + skipDocs);

				fRegisters.find(search, function(err, register){
					var sortData = ''
					for (var key in req.query) {
						if(key == 'page'){

						}else{
							sortData += '&' + key + '=' + req.query[key];
						}
					}
					console.log(sortData)
					res.render('regList', { title: 'BASignIO Admin: Registers',  user: req.session.user, cDate: functions.date(), role: req.session.user.role, registers: register, sort: req.query.sort,  search: sortData, totalPages: totalPages, prevPage: prevPage, nextPage: nextPage, pageNum: currentPage, fvp: fvp, lvp: lvp});

				}).limit(maxDocs).skip(skipDocs).sort({surname: 1})

			})
		}
	}
});

router.all('/:user/export', function(req, res) {

	if (!req.session.user) {
		if (req.cookies.basio_user == undefined || req.cookies.basio_pass == undefined) {
			res.redirect('/admin');
		}else{
			account.autoLogin(req.cookies.basio_user, req.cookies.basio_pass, function(o){
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
				  res.render('export', { title: 'BASignIO Admin: Export', user: req.session.user, date: functions.date(), role: req.session.user.role, request: 'NULL'});
	      };
    	}else{
    		res.render('export', { title: 'BASignIO Admin: Export', user: req.session.user, date: functions.date(), role: req.session.user.role, request: 'NULL'});
    	};
    }
});

router.get('/:user/about', function(req, res) {
	res.render('about', { title: 'BASignIO Admin: About',  user: req.session.user, role: req.session.user.role});
});

module.exports = router;
