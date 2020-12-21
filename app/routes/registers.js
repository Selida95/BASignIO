/*
 * -----------------------------
 * BASignIO - Routes: Registers
 * -----------------------------
 */

 // Dependencies
 const express = require('express');
 const router = express.Router();
 const moment = require('moment');
 const utils = require('../modules/utilities.js');
 const mailer = require('../modules/email');
 const staffManager = require('../modules/staff-manager')

 // Config
 const config = require('../config')

 // Database Models
 const student = require('../models/student');
 const staff = require('../models/staff');
 const register = require('../models/register');
 const fRegister = require('../models/fireRegister');

 // Global Variables
 var user;
 var inputFocus;


 router.get('/', (req, res, next) => {
   res.redirect('/');
 });

 router.get('/:location', (req, res, next) => {
   //Gives focus to scanID
   inputFocus = true;
   //Clears user info
   user = '';

   res.render('registers', { title: 'BASignIO: ' + req.params.location.toUpperCase(), user: user, loc: req.params.location, inputFocus: inputFocus});
 })

 router.post('/:location', (req, res, next) => {
  	//Check if scanSubmit is set
  	if (req.body.scanSubmit) {

  		//if scanID is empty
  		if (!req.body.scanID) {
  			//Print("Please scan your id")
  			console.log("Log: " + utils.date() + " " + utils.time() + " " + req.params.location.toUpperCase() + " | ID wasn't scanned.");
  			req.flash('error', 'Please enter/scan your id.');

  			res.redirect('/reg/' + req.params.location);
  		//else
  		}else{
  			//Remove focus from scan input
  			inputFocus = false;
  			//Check if student exists
  			student.findOne({$or: [{'_id': req.body.scanID}, {'cardID': req.body.scanID}]}, (err, students) => {
  				if (err) {
  					console.error('ERROR: ' + utils.date() + " " + utils.time() + " " + req.params.location.toUpperCase() + ' | ' + err);
  					req.flash('error', 'There was an error. Please contact admin.');
  					res.redirect('/reg/' + req.params.location);
  				}
  				//if student exists
  				if (students) {

  					if (config.manual_input.enabled == "true" && req.body.scanID == students._id) {

  						students.manualCount = students.manualCount + 1;
  						students.save();

  						if (students.manualCount == config.manual_input.max_uses) {
  							console.log('Allowance reached. Emailing and Resetting.');

  							  mailer.send({
  				                receiver: config.manual_input.email,
  				                subject: 'BASignIO: Manual Input',
  				                text: students.fullName + ' has used all their manual input allowance.'
  				              }, (err, mail) => {
  				                if (err) {
  				                  console.log(err);
  				                }
  				                if (mail) {
  				                  console.log(mail);
  				                }
  				              });

  							students.manualCount = 0
  							students.save();

  							var msg = 'You have used all of your manual input allowance.';
  						}else{
  							var msg = 'You have used ' + students.manualCount + '/'+ config.manual_input.max_uses + ' of your manual input allowance.';
  						}
  						//Get student forename and surname
  						user = students;
  						console.log("Log: " + utils.date() + " " + utils.time() + " " + req.params.location.toUpperCase() + " " + user.forenames + " " + user.surname +  'just scanned/entered their id. They have' + students.manualCount + '/'+ config.manual_input.max_uses + ' of their manual input allowance.');
  						res.render('registers', { title: 'BASignIO: ' + req.params.location.toUpperCase(), user: user, id: students._id, inputFocus: inputFocus, warning: msg});
  					}else{
  						if (req.body.scanID == students._id) {
  							//Manual Input was used.
  							//Get student forename and surname
  							user = students;
  							console.log("Log: " + utils.date() + " " + utils.time() + " " + req.params.location.toUpperCase() + " " + user.forenames + " " + user.surname + " just scanned/entered their id. Manual Input was used.");
  							res.render('registers', { title: 'BASignIO: ' + req.params.location.toUpperCase(), user: user, id: students._id, inputFocus: inputFocus});
  						}else{
  							//Get student forename and surname
  							user = students;
  							console.log("Log: " + utils.date() + " " + utils.time() + " " + req.params.location.toUpperCase() + " " + user.forenames + " " + user.surname + " just scanned/entered their id.");
  							res.render('registers', { title: 'BASignIO: ' + req.params.location.toUpperCase(), user: user, id: students._id, inputFocus: inputFocus});
  						}
  					}
  				//else
  				}else{
  					console.log("Log: " + utils.date() + " " + utils.time() + " " + req.params.location.toUpperCase() +" Scanning ID: User isn't student checking if staff member.");
  					//Check if staff exists
            staffManager.getStaff({
              id : req.body.scanID,
              cardID : req.body.scanID,
              cardID2 : req.body.scanID
            }, (staff) => {
              if (staff.message === 'SUCCESS') {
                console.log("Log: " + utils.date() + " " + utils.time() + " " + req.params.location.toUpperCase() + " " + staff.data.forenames + " " + staff.data.surname + " just scanned/entered their id.");
                res.render('registers', { title: 'BASignIO: ' + req.params.location.toUpperCase(), user: staff.data, id: staff.data._id, inputFocus: inputFocus});
              } else {
                //if user doesn't exist.
  							req.flash('error', 'Please contact admin. Your ID does not exist.');
  							res.redirect('/reg/' + req.params.location);
              }
            })
  				}
  			})
  		}
  	//if signin button is pressed
  	}else if(req.body.signIn){
  		/*function myfunction() {};
  		setTimeout(myfunction(), 2000);*/

  		//if scanID is empty
  		if (!req.body.scanID) {
  			//Print("Please scan your id")
  			console.log("Log: " + utils.date() + " " + utils.time() + " " + req.params.location.toUpperCase() + " | ID wasn't scanned.");
  			req.flash('error', 'Please enter/scan your id.');

  			res.redirect('/reg/' + req.params.location);
  		//else
  		}else{
  			//Print('Checking ID')
  			console.log("Log: " + utils.date() + " " + utils.time() + " " + req.params.location.toUpperCase() + " | Checking ID: " + req.body.scanID)
  			//Removes focus from scan input
  			inputFocus = false;
  			//check if student exists
  			student.findOne({'_id': req.body.scanID}, (err, students) => {
  				//if student exists
  				if(students){
  					//Check if student exists on the fire register
  					fRegister.findOne({'_id': req.body.scanID}, (err, exists) => {
  						//if student exists on fire register
  						if(exists){
  							//Check if student was signed out
  								//if user was signed out
  								if (exists.io == 0) {
  									//Update fire register with new timeIn and location
  									fRegister.findOneAndUpdate({'_id': req.body.scanID}, {'timeIn': utils.time(), 'timeOut': '', 'io' : 1, 'date': utils.date(), 'loc': req.params.location.toUpperCase()}, (err, update) => {
  										if (err) {console.log('Error: ' + err)};
  									})
  									//Create new register record with timeIn and location
  									var Register = new register({
  										_id: new ObjectID(),
  							    		id: req.body.scanID,
  										surname: exists.surname,
  										forenames: exists.forenames,
  										yearGroup: exists.yearGroup,
  										type: 'student',
  										loc: req.params.location.toUpperCase(),
  										timeIn: utils.time(),
  										timeOut: '',
  										io: 1,
  										date: utils.date()
  									},
  									{
  										collection: 'registers',
  										versionKey: false
  									});
  									Register.save((err, Student) => {
  										if (err) return console.error(err);
  										//console.dir(Student);
  									})
  									//Print('Student was signed in!')
  									console.log("Log: " + utils.date() + " " + utils.time() + " " + exists.forenames + ' ' + exists.surname + ' was signed in!');
  									req.flash('success', exists.forenames + ' ' + exists.surname + ' was signed in!');
  									res.redirect('/reg/' + req.params.location);
  								//else
  								}else{
  									//Check if signin button was pressed twice
  									var currentTime = moment()
  									var lastTime = moment(exists.timeIn, 'HH:mm:ss')
  									var diffTime = currentTime.diff(lastTime, 'seconds');

  									if (diffTime > 60) {
  										//Update fire register with new timeIn and location
  										fRegister.findOneAndUpdate({'_id': req.body.scanID}, {'timeIn': utils.time(), 'timeOut': '', 'io' : 1, 'date': utils.date(), 'loc': req.params.location.toUpperCase()}, (err, update) => {
  											if (err) {
  												console.log('Error: ' + err);
  												req.flash('error', 'There was an error. Please contact admin.');
  											};
  										})
  										//Update last register record with 'N/A' for timeOut
  										register.findOneAndUpdate({'id': req.body.scanID, 'io' : 1}, {'timeOut': 'N/A', 'io' : 0}, { sort: { 'timeIn' : -1, 'date' : -1} }, (err, doc) => {
  											if (err) {
  												console.error('Error: ' + err);
  												req.flash('error', 'There was an error. Please contact admin.');
  											};
  										})
  										//Create new register record with timeIn and location
  										var Register = new register({
  											_id: new ObjectID(),
  							    			id: req.body.scanID,
  											surname: exists.surname,
  											forenames: exists.forenames,
  											yearGroup: exists.yearGroup,
  											type: 'student',
  											loc: req.params.location.toUpperCase(),
  											timeIn: utils.time(),
  											timeOut: '',
  											io: 1,
  											date: utils.date()
  										},
  										{
  											collection: 'registers',
  											versionKey: false
  										});
  										Register.save((err, Student) => {
  											if (err) return console.error(err);
  											//console.dir(Student);
  										})
  										//Print('Student was signed in, but didn't sign out. Please do so in the future.')
  										console.log("Log: " + utils.date() + " " + utils.time() + " " + exists.forenames + ' ' + exists.surname + " was signed in, but didn't sign out.");
  										req.flash('error', exists.forenames + ' ' + exists.surname + " was signed in, but didn't previously signout. Please do so in the future!");
  										res.redirect('/reg/' + req.params.location);
  									}else{
                      fRegister.findOneAndUpdate({'_id': req.body.scanID}, {'timeIn': utils.time(), 'timeOut': '', 'io' : 1, 'date': utils.date(), 'loc': req.params.location.toUpperCase()}, (err, update) => {
                        if (err) {
                          console.log('Error: ' + err);
                          req.flash('error', 'There was an error. Please contact admin.');
                        };
                      })
  										console.log("Log: " + utils.date() + " " + utils.time() + " " + exists.forenames + ' ' + exists.surname + " was signed in. Sign in button was press more than once.");
  										req.flash('success', exists.forenames + ' ' + exists.surname + ' was signed in! But you dont\'t need to spam the button.');

  										res.redirect('/reg/' + req.params.location);
  									}
  								}
  						//else, student doesn't exist on the fire register
  						}else{
  							//Create fire register record with current date and timeIn and location
  								var fireRegister = new fRegister({
  									_id: req.body.scanID,
  									surname: students.surname,
  									forenames: students.forenames,
  									yearGroup: students.yearGroup,
  									tutorGrp: students.tutorGrp,
  									type: 'student',
  									loc: req.params.location.toUpperCase(),
  									timeIn: utils.time(),
  									timeOut: '',
  									io: 1,
  									date: utils.date()
  								},
  								{
  									collection: 'fireRegisters',
  									versionKey: false
  								});

  								fireRegister.save((err, records) => {
  									if (err) return console.error(err);
  									//console.dir(records);
  								})
  								//Create new register record with timeIn and location
  								var Register = new register({
  									_id: new ObjectID(),
  							    	id: req.body.scanID,
  									surname: students.surname,
  									forenames: students.forenames,
  									yearGroup: students.yearGroup,
  									type: 'student',
  									loc: req.params.location.toUpperCase(),
  									timeIn: utils.time(),
  									timeOut: '',
  									io: 1,
  									date: utils.date()
  								},
  								{
  									collection: 'registers',
  									versionKey: false
  								});

  								Register.save((err, Staff) => {
  									if (err) return console.error(err);
  									//console.dir(Student);
  								})


  								console.log("Log: " + utils.date() + " " + utils.time() + " " + students.forenames + ' ' + students.surname + ' was signed in!');
  								req.flash('success', students.forenames + ' ' + students.surname + ' was signed in!');
  								res.redirect('/reg/' + req.params.location);

  						}
  					})
  				//else
  				}else{
  					//check if Staff exists
            staffManager.getStaff({ id : req.body.scanID }, (staff) => {
              if (staff.message === 'SUCCESS') {
                // Check if staff exists on the fire register
                fRegister.findOne({ _id : req.body.scanID }, (error, exists) => {
                  if (exists) {
                    // If staff member was signed out
                    if (exists.io === 0) {
                      fRegister.findOneAndUpdate({
                        _id : req.body.scanID
                      }, {
                        timeIn : utils.time(),
                        timeOut : '',
                        io : 1,
                        date : utils.date(),
                        loc : req.params.location.toUpperCase()
                      }, (error, update) => {
                        if (error) console.log('Error: ' + error)
                      })

                      // Create new register record
                      var Register = new register({
                        _id: new ObjectID(),
                        id : req.body.scanID,
                        surname : exists.surname,
                        forenames : exists.forenames,
                        type : 'staff',
                        loc : req.params.location.toUpperCase(),
                        timeIn : utils.time(),
                        timeOut : '',
                        io : 1,
                        date : utils.date()
                      }, {
                        collection: 'registers',
                        versionKey: false
                      })

                      Register.save((error) => {
                        if (error) {
                          console.error(error)
                          return
                        }
                        console.log("Log: " + utils.date() + " " + utils.time() + " " + exists.forenames + ' ' + exists.surname + ' was signed in!');
                        req.flash('success', exists.forenames + ' ' + exists.surname + ' was signed in!');
                        res.redirect('/reg/' + req.params.location);
                      })
                    } else {
                      // Check if signin button was pressed twice
                      let currentTime = moment()
                      let lastTime = moment(exists.timeIn, 'HH:mm:ss')
                      let diffTime = currentTime.diff(lastTime, 'seconds')

                      if (diffTime > 60) {
                        // Update fire register
                        fRegister.findOneAndUpdate({
                          _id : req.body.scanID
                        }, {
                          timeIn : utils.time(),
                          timeOut : '',
                          io : 1,
                          date : utils.date(),
                          loc : req.params.location.toUpperCase()
                        }, (error, update) => {
                          if (error) {
                            console.log('Error: ' + err);
                            req.flash('error', 'There was an error. Please contact admin.');
                          };
                        })

                        // Update last register record with NA for timeOut
                        register.findOneAndUpdate({
                          id : req.body.scanID,
                          io : 1
                        }, {
                          timeOut : 'N/A',
                          io : 0
                        }, {
                          sort : {
                            timeIn : -1,
                            date : -1
                          }
                        })

                        //Create new register record
                        var Register = new register({
                          _id: new ObjectID(),
                          id: req.body.scanID,
                          surname: exists.surname,
                          forenames: exists.forenames,
                          type: 'staff',
                          loc: req.params.location.toUpperCase(),
                          timeIn: utils.time(),
                          timeOut: '',
                          io: 1,
                          date: utils.date()
                        },
                        {
                          collection: 'registers',
                          versionKey: false
                        });
                        Register.save((error) => {
                          if (error) {
                            console.log(error)
                            return
                          }

                          console.log("Log: " + utils.date() + " " + utils.time() + " " + exists.forenames + ' ' + exists.surname + " was signed in, but didn't sign out.");
                          req.flash('error', exists.forenames + ' ' + exists.surname + " was signed in, but didn't previously signout. Please do so in the future!");
                          res.redirect('/reg/' + req.params.location);
                        })
                      } else {
                        console.log("Log: " + utils.date() + " " + utils.time() + " " + exists.forenames + ' ' + exists.surname + " was signed in. Sign in button was press more than once.");
                        req.flash('success', exists.forenames + ' ' + exists.surname + ' was signed in! But you dont\'t need to spam the button.');
                        res.redirect('/reg/' + req.params.location);
                      }
                    }
                  } else {
                    //Create fire register record
                    var fireRegister = new fRegister({
                      _id: req.body.scanID,
                      surname: staff.data.surname,
                      forenames: staff.data.forenames,
                      staffType: staff.data.staffType,
                      type: 'staff',
                      loc: req.params.location.toUpperCase(),
                      timeIn: utils.time(),
                      timeOut: '',
                      io: 1,
                      date: utils.date()
                    },
                    {
                      collection: 'fireRegisters',
                      versionKey: false
                    });

                    fireRegister.save((error) => {
                      if (error) {
                        console.error(error)
                        return
                      }
                    })
                    //Create new register record with timeIn and location
                    var Register = new register({
                      _id: new ObjectID(),
                      id: req.body.scanID,
                      surname: staff.data.surname,
                      forenames: staff.data.forenames,
                      type: 'staff',
                      loc: req.params.location.toUpperCase(),
                      timeIn: 'N/A',
                      timeOut: utils.time(),
                      io: 0,
                      date: utils.date()
                    },
                    {
                      collection: 'registers',
                      versionKey: false
                    });

                    Register.save((error) => {
                      if (error) {
                        console.error('Error @ ' + utils.time() + ' : ' + error)
                        return
                      }

                      console.log("Log: " + utils.date() + " " + utils.time() + " " + req.params.location.toUpperCase() + " | " + staff.data.forenames + ' ' + staff.data.surname + " was signed in.")
                      req.flash('success', staff.data.fullName + ' was signed in.')
                      res.redirect('/reg/' + req.params.location)
                    })
                  }
                })
              }
            })
  				}
  			})
  		}
  	//if signout button is pressed
  	}else if(req.body.signOut){
  		//if scanID is empty
  		if (!req.body.scanID) {
  			//Print("Please scan your id")
  			console.log("Log: " + utils.date() + " " + utils.time() + " " + req.params.location.toUpperCase() + " | ID wasn't scanned.");
  			req.flash('error', 'Please enter/scan your id.');

  			res.redirect('/reg/' + req.params.location);
  		//else
  		}else{
  			//Print('Checking ID')
  			console.log("Log: " + utils.date() + " " + utils.time() + " " + req.params.location.toUpperCase() + " | Checking ID: " + req.body.scanID)
  			//Removes focus from scan input
  			inputFocus = false;
  			//Check if student exists
  			student.findOne({'_id': req.body.scanID}, (err, students) => {
  				//if student exists
  				if (students) {
  					//Check if student exists on the fire register
  					fRegister.findOne({'_id': req.body.scanID}, (err, exists) => {
  						//if student exists on fire register
  						if (exists) {
  							//Check if student was signed in
  								//if student was signed in
  								if (exists.io == 1) {
  									//Update fire register with timeOut
  									fRegister.findOneAndUpdate({'_id': req.body.scanID}, {'timeOut': utils.time(), 'io': 0}, (err, update) => {
  										if (err) {
  											console.log('Error: ' + err);
  											req.flash('error', 'There was an error. Please contact admin.');
  										};
  									})
  									//Update register record with timeOut
  									register.findOneAndUpdate({'id': req.body.scanID, 'io' : 1}, {'timeOut': utils.time(), 'io' : 0}, { sort: { 'timeIn' : -1, 'date' : -1} }, (err, doc) => {
  										if (err) {
  											console.error('Error: ' + err);
  											req.flash('error', 'There was an error. Please contact admin.');
  										};
  									})
  									//Print('Student was signed out')
  									console.log("Log: " + utils.date() + " " + utils.time() + " " + req.params.location.toUpperCase() + " | " + exists.forenames + ' ' + exists.surname + " was signed out.");
  									req.flash('success', exists.fullName + ' was signed out.')
  									res.redirect('/reg/' + req.params.location);
  								//else
  								}else{
  									//Check if signout button was pressed twice
  									var currentTime = moment()
  									var lastTime = moment(exists.timeOut, 'HH:mm:ss');
  									var diffTime = currentTime.diff(lastTime, 'seconds');

  									if (diffTime > 60) {
  										//Update fire register with timeIn as 'N/A', new timeOut and new location
  										fRegister.findOneAndUpdate({'_id': req.body.scanID}, {'timeIn': 'N/A','timeOut': utils.time(), 'io' : 0, 'date': utils.date(), 'loc': req.params.location.toUpperCase()}, (err, update) => {
  											if (err) {
  												console.log('Error: ' + err);
  												req.flash('error', 'There was an error. Please contact admin.');
  											};
  										})
  										//Update register record with timeOut as 'N/A'
  										register.findOneAndUpdate({'id': req.body.scanID, 'io' : 1}, {'timeOut': 'N/A', 'io' : 0}, { sort: { 'timeIn' : -1, 'date' : -1} }, (err, doc) => {
  											if (err) {
  												console.error('Error: ' + err);
  												req.flash('error', 'There was an error. Please contact admin.');
  											};
  										})
  										//Create new register record with timeIn as 'N/A', timeOut as current time, and new location
  										var Register = new register({
  											_id: new ObjectID(),
  											id: req.body.scanID,
  											surname: exists.surname,
  											forenames: exists.forenames,
  											yearGroup: exists.yearGroup,
  											type: 'student',
  											loc: req.params.location.toUpperCase(),
  											timeIn: 'N/A',
  											timeOut: utils.time(),
  											io: 0,
  											date: utils.date()
  										},
  										{
  											collection: 'registers',
  											versionKey: false
  										});

  										Register.save((err, Student) => {
  											if (err) return console.error('Error @ ' + utils.time() + ' : ' + err);
  											//console.dir(Student);
  										})

  										//Print('Student was signed out, but didn't sign in)
  										console.log("Log: " + utils.date() + " " + utils.time() + " " + req.params.location.toUpperCase() + " | " + exists.forenames + ' ' + exists.surname + " was signed out, but didn't sign in.");
  										req.flash('error', exists.fullName + " was signed out, but didn't sign in. Please do so in the future!")
  										res.redirect('/reg/' + req.params.location);
  									}else{

  										console.log("Log: " + utils.date() + " " + utils.time() + " " + req.params.location.toUpperCase() + " | " + exists.forenames + ' ' + exists.surname + " was signed out. Sign Out button was press more than once.");
  										req.flash('success', exists.fullName + ' was signed out. But you dont\'t need to spam the button.')

  										res.redirect('/reg/' + req.params.location);
  									}

  								}
  						//else; student doesn't exist on the fire register
  						}else{
  							//Create fire register record with current date and timeIn and location
  							var fireRegister = new fRegister({
  								_id: req.body.scanID,
  								surname: students.surname,
  								forenames: students.forenames,
  								yearGroup: students.yearGroup,
  								tutorGrp: students.tutorGrp,
  								type: 'student',
  								loc: req.params.location.toUpperCase(),
  								timeIn: 'N/A',
  								timeOut: utils.time(),
  								io: 1,
  								date: utils.date()
  							},
  							{
  								collection: 'fireRegisters',
  								versionKey: false
  							});

  							fireRegister.save((err, records) => {
  								if (err) return console.error(err);
  								//console.dir(Student);
  							})
  							//Create new register record with timeIn and location
  							var Register = new register({
  								_id: new ObjectID(),
  								id: req.body.scanID,
  								surname: students.surname,
  								forenames: students.forenames,
  								yearGroup: students.yearGroup,
  								type: 'student',
  								loc: req.params.location.toUpperCase(),
  								timeIn: 'N/A',
  								timeOut: utils.time(),
  								io: 0,
  								date: utils.date()
  							},
  							{
  								collection: 'registers',
  								versionKey: false
  							});

  							Register.save((err, Student) => {
  								if (err) return console.error('Error @ ' + utils.time() + ' : ' + err);
  								//console.dir(Student);
  							})

  							//Print('Student was signed out, but didn't sign in)
  							console.log("Log: " + utils.date() + " " + utils.time() + " " + req.params.location.toUpperCase() + " | " + students.forenames + ' ' + students.surname + " was signed!");
  							req.flash('error', students.fullName + " was signed out!")
  							res.redirect('/reg/' + req.params.location);
  						}
  					})
  				//else
  				}else{
  					//Check if user is staff
            staffManager.getStaff({ id : req.body.scanID }, (staff) => {
              if (staff.message === 'SUCCESS') {
                // Check if staff exists on the fire register
                fRegister.findOne({ _id : req.body.scanID }, (error, exists) => {
                  if (exists) {
                    // Check if staff was signed in
                    if (exists.io == 1) {
                      // Update fire register
                      fRegister.findOneAndUpdate({
                        _id : req.body.scanID
                      }, {
                        timeOut : utils.time(),
                        io : 0,
                        date : utils.date(),
                        loc : req.params.location.toUpperCase()
                      }, (error, update) => {
                        if (error) {
                          console.log('Error: ' + error);
                          req.flash('error', 'There was an error. Please contact admin.');
                        }
                      })
                      //Update the last register record
                      register.findOneAndUpdate({
                        id : req.body.scanID,
                        io : 1
                      }, {
                        timeOut : utils.time(),
                        io : 0
                      }, {
                        sort: {
                          timeIn : -1,
                          date : -1
                        }
                      }, (error, doc) => {
                        if (error) {
                          console.error('Error: ' + error);
                          req.flash('error', 'There was an error. Please contact admin.');
                        };
                      })

                      console.log("Log: " + utils.date() + " " + utils.time() + " " + req.params.location.toUpperCase() + " | " + exists.forenames + ' ' + exists.surname + " was signed out.");
                      req.flash('success', exists.fullName + ' was signed out.')
                      res.redirect('/reg/' + req.params.location);
                    } else {
                      let currentTime = moment()
                      let lastTime = moment(exists.timeOut, 'HH:mm:ss')
                      let diffTime = currentTime.diff(lastTime, 'seconds')

                      if (diffTime > 60) {
                        //Update fire register with timeIn as 'N/A'
                        fRegister.findOneAndUpdate({
                          _id : req.body.scanID
                        }, {
                          timeIn : 'N/A',
                          timeOut : utils.time(),
                          io : 0,
                          date : utils.date(),
                          loc : req.params.location.toUpperCase()
                        }, (error, update) => {
                          if (error) {
                            console.log('Error: ' + error);
                            req.flash('error', 'There was an error. Please contact admin.');
                          };
                        })
                        //Update register record with timeOut as 'N/A'
                        register.findOneAndUpdate({
                          id : req.body.scanID,
                          io : 1
                        }, {
                          timeOut : 'N/A',
                          io : 0
                        }, {
                          sort: {
                            timeIn : -1,
                            date : -1
                          }
                        }, (error, doc) => {
                          if (error) {
                            console.error('Error: ' + error);
                            req.flash('error', 'There was an error. Please contact admin.');
                          };
                        })

                        //Create new register record with timeIn as 'N/A'
                        var Register = new register({
                          _id: new ObjectID(),
                          id: req.body.scanID,
                          surname: exists.surname,
                          forenames: exists.forenames,
                          type: 'staff',
                          loc: req.params.location.toUpperCase(),
                          timeIn: 'N/A',
                          timeOut: utils.time(),
                          io: 0,
                          date: utils.date()
                        },
                        {
                          collection: 'registers',
                          versionKey: false
                        });

                        Register.save((error, Student) => {
                          if (error) {
                            console.error('Error @ ' + utils.time() + ' : ' + error)
                            return
                          }
                          console.log("Log: " + utils.date() + " " + utils.time() + " " + req.params.location.toUpperCase() + " | " + exists.forenames + ' ' + exists.surname + " was signed out, but didn't sign in.");
                          req.flash('error', exists.fullName + " was signed out, but didn't sign in. Please do so in the future!")
                          res.redirect('/reg/' + req.params.location);
                        })
                      } else {
                        console.log("Log: " + utils.date() + " " + utils.time() + " " + req.params.location.toUpperCase() + " | " + exists.forenames + ' ' + exists.surname + " was signed out. Sign Out button was press more than once.");
                        req.flash('success', exists.fullName + ' was signed out. But you dont\'t need to spam the button.')
                        res.redirect('/reg/' + req.params.location);
                      }
                    }
                  } else {
                    //Create fire register record
  									var fireRegister = new fRegister({
  										_id: req.body.scanID,
  										surname: staffs.surname,
  										forenames: staffs.forenames,
  										staffType: staffs.staffType,
  										type: 'staff',
  										loc: req.params.location.toUpperCase(),
  										timeIn: 'N/A',
  										timeOut: utils.time(),
  										io: 0,
  										date: utils.date()
  									},
  									{
  										collection: 'fireRegisters',
  										versionKey: false
  									});

  									fireRegister.save((error, records) => {
  										if (error) {
                        console.error(error)
                        return
                      }
  									})

                    //Create new register record
                    var Register = new register({
                      _id: new ObjectID(),
                      id: req.body.scanID,
                      surname: staffs.surname,
                      forenames: staffs.forenames,
                      type: 'staff',
                      loc: req.params.location.toUpperCase(),
                      timeIn: 'N/A',
                      timeOut: utils.time(),
                      io: 0,
                      date: utils.date()
                    },
                    {
                      collection: 'registers',
                      versionKey: false
                    });

                    Register.save((error, Staff) => {
                      if (error) {
                        console.error('Error @ ' + utils.time() + ' : ' + error);
                      }
                    })

                    console.log("Log: " + utils.date() + " " + utils.time() + " " + req.params.location.toUpperCase() + " | " + staffs.forenames + ' ' + staff.surname + " was signed out.");
  									req.flash('error', staffs.fullName + " was signed out!")
  									res.redirect('/reg/' + req.params.location);
                  }
                })
              } else {
                console.log("Log: " + utils.date() + " " + utils.time() + " " + req.params.location.toUpperCase() + " | User tried to enter ID: " + req.body.scanID);
                req.flash('error', "ID: " + req.body.scanID + " doesn't exist. Please contact admin.")
                res.redirect('/reg/' + req.params.location);
              }
            })
  				}
  			})
  		}
  	}
 })


 // Export router module
 module.exports = router;
