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
 const registerManager = require('../modules/register-manager')
 const fireRegisterManager = require('../modules/fire-register-manager')

 // Config
 const config = require('../config')

 // Database Models
 const student = require('../models/student');

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
  				                text: students.forenames + ' ' + students.surname + ' has used all their manual input allowance.'
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
            try {
              fireRegisterManager.getRecord({ id : req.body.scanID }, (fireRecord) => {
                if (fireRecord.message === 'SUCCESS') {
                  if (fireRecord.data.io === 0) {
                    fireRegisterManager.updateRecord({
                      id : fireRecord.data.id,
                      forenames : students.forenames,
                      surname : students.surname,
                      type : 'student',
                      loc : req.params.location.toUpperCase(),
                      io : 1,
                      yearGroup : students.yearGroup,
                      tutorGrp : students.tutorGrp,
                      timeIn : utils.time(),
                      timeOut : ''
                    }, (record) => {

                    })
                    registerManager.createNewRecord({
                      id : students._id,
                      forenames : students.forenames,
                      surname : students.surname,
                      type : 'student',
                      loc : req.params.location.toUpperCase(),
                      io : 1,
                      yearGroup : students.yearGroup,
                      tutorGrp : students.tutorGrp
                    }, (record) => {
                      console.log("Log: " + utils.date() + " " + utils.time() + " " + students.forenames + ' ' + students.surname + ' was signed in!');
                      req.flash('success', students.forenames + ' ' + students.surname + ' was signed in!');
                      res.redirect('/reg/' + req.params.location);
                    })
                  } else {
                    // Check if signin button was pressed twice
                    let currentTime = moment()
                    let lastTime = moment(fireRecord.data.timeIn, 'HH:mm:ss')
                    let diffTime = currentTime.diff(lastTime, 'seconds')

                    if (diffTime > 60) {
                      fireRegisterManager.updateRecord({
                        id : fireRecord.data.id,
                        forenames : students.forenames,
                        surname : students.surname,
                        type : 'student',
                        loc : req.params.location.toUpperCase(),
                        io : 1,
                        yearGroup : students.yearGroup,
                        tutorGrp : students.tutorGrp,
                        timeIn : utils.time(),
                        timeOut : ''
                      }, (record) => {

                      })

                      if (fireRecord.data.timeOut.length === 0) {
                        // Update last register record with 'N/A' for timeOut
                        registerManager.updateLatestRecord({
                          id : req.body.scanID,
                          io : 1,
                          timeOut : 'N/A'
                        }, (record) => {

                        })
                      }

                      console.log("Log: " + utils.date() + " " + utils.time() + " " + students.forenames + ' ' + students.surname + " was signed in, but didn't sign out.");
                      req.flash('error', students.forenames + ' ' + students.surname + " was signed in, but didn't previously signout. Please do so in the future!");
                      res.redirect('/reg/' + req.params.location);
                    } else {
                      console.log("Log: " + utils.date() + " " + utils.time() + " " + students.forenames + ' ' + students.surname + " was signed in. Sign in button was press more than once.");
                      req.flash('success', students.forenames + ' ' + students.surname + ' was signed in! But you dont\'t need to spam the button.');
                      res.redirect('/reg/' + req.params.location);
                    }
                  }
                } else {
                  // Create fire register record
                  fireRegisterManager.createNewRecord({
                    id : students._id,
                    forenames : students.forenames,
                    surname : students.surname,
                    type : 'student',
                    loc : req.params.location.toUpperCase(),
                    io : 1,
                    yearGroup : students.yearGroup,
                    tutorGrp : students.tutorGrp,
                    timeIn : utils.time(),
                    timeOut : ''
                  }, (record) => {

                  })
                  // Create new register record
                  registerManager.createNewRecord({
                    id : req.body.scanID,
                    surname : students.surname,
                    forenames : students.forenames,
                    type : 'student',
                    yearGroup : students.yearGroup,
                    tutorGrp : students.tutorGrp,
                    loc : req.params.location.toUpperCase(),
                    io : 1
                  }, (record) => {

                  })
                  console.log("Log: " + utils.date() + " " + utils.time() + " " + students.forenames + ' ' + students.surname + ' was signed in!');
  								req.flash('success', students.forenames + ' ' + students.surname + ' was signed in!');
  								res.redirect('/reg/' + req.params.location);
                }
              })
            } catch (e) {
              console.log(e)
              req.flash('error', 'There was an error. Please contact admin.');
              res.redirect('/reg/' + req.params.location);
            }
  				//else
  				}else{
            try {
              //check if Staff exists
              staffManager.getStaff({ id : req.body.scanID }, (staff) => {
                if (staff.message === 'SUCCESS') {
                  // Check if staff exists on the fire register
                  fireRegisterManager.getRecord({ id : staff.data._id }, (fireRecord) => {
                    if (fireRecord.message === 'SUCCESS') {
                      // Check if staff member was signed out
                      if (fireRecord.data.io === 0) {
                        fireRegisterManager.updateRecord({
                          id : staff.data._id,
                          forenames : staff.data.forenames,
                          surname : staff.data.surname,
                          type : 'staff',
                          loc : req.params.location.toUpperCase(),
                          io : 1,
                          timeIn : utils.time(),
                          timeOut : '',
                          staffType : staff.data.staffType
                        }, (record) => {

                        })
                        // Create new register record
                        registerManager.createNewRecord({
                          id : staff.data._id,
                          surname : staff.data.surname,
                          forenames : staff.data.forenames,
                          type : 'staff',
                          loc : req.params.location.toUpperCase(),
                          io : 1
                        }, (record) => {

                        })
                        console.log("Log: " + utils.date() + " " + utils.time() + " " + staff.data.forenames + ' ' + staff.data.surname + ' was signed in!');
                        req.flash('success', staff.data.forenames + ' ' + staff.data.surname + ' was signed in!');
                        res.redirect('/reg/' + req.params.location);
                      } else {
                        let currentTime = moment()
                        let lastTime = moment(fireRecord.data.timeIn, 'HH:mm:ss')
                        let diffTime = currentTime.diff(lastTime, 'seconds')

                        if (diffTime > 60) {
                          fireRegisterManager.updateRecord({
                            id : staff.data._id,
                            forenames : staff.data.forenames,
                            surname : staff.data.surname,
                            type : 'staff',
                            loc : req.params.location.toUpperCase(),
                            io : 1,
                            timeIn : utils.time(),
                            timeOut : '',
                            staffType : staff.data.staffType
                          }, (record) => {

                          })

                          if (fireRecord.data.timeOut.length === 0) {
                            // Update last register record with 'N/A' for timeOut
                            registerManager.updateLatestRecord({
                              id : req.body.scanID,
                              io : 1,
                              timeOut : 'N/A'
                            }, (record) => {

                            })
                          }

                          //Create new register record
                          registerManager.createNewRecord({
                            id : staff.data._id,
                            surname : staff.data.surname,
                            forenames : staff.data.forenames,
                            type : 'staff',
                            loc : req.params.location.toUpperCase(),
                            io : 1
                          }, (record) => {

                          })
                          console.log("Log: " + utils.date() + " " + utils.time() + " " + staff.data.forenames + ' ' + staff.data.surname + " was signed in, but didn't sign out.");
                          req.flash('error', staff.data.forenames + ' ' + staff.data.surname + " was signed in, but didn't previously signout. Please do so in the future!");
                          res.redirect('/reg/' + req.params.location);
                        } else {
                          console.log("Log: " + utils.date() + " " + utils.time() + " " + staff.data.forenames + ' ' + staff.data.surname + " was signed in. Sign in button was press more than once.");
                          req.flash('success', staff.data.forenames + ' ' + staff.data.surname + ' was signed in! But you dont\'t need to spam the button.');
                          res.redirect('/reg/' + req.params.location);
                        }
                      }
                    } else {
                      // Staff member doesn't have a fire register record
                      fireRegisterManager.createNewRecord({
                        id : staff.data._id,
                        forenames : staff.data.forenames,
                        surname : staff.data.surname,
                        type : 'staff',
                        loc : req.params.location.toUpperCase(),
                        io : 1,
                        staffType : staff.data.staffType,
                        timeIn : utils.time(),
                        timeOut : ''
                      }, (record) => {

                      })
                      //Create new register record
                      registerManager.createNewRecord({
                        id : staff.data._id,
                        surname : staff.data.surname,
                        forenames : staff.data.forenames,
                        type : 'staff',
                        loc : req.params.location.toUpperCase(),
                        io : 1
                      }, (record) => {

                      })
                      console.log("Log: " + utils.date() + " " + utils.time() + " " + req.params.location.toUpperCase() + " | " + staff.data.forenames + ' ' + staff.data.surname + " was signed in.")
                      req.flash('success', staff.data.forenames + ' ' + staff.data.surname + ' was signed in.')
                      res.redirect('/reg/' + req.params.location)
                    }
                  })
                }
              })
            } catch (e) {
              console.log("Log: " + utils.date() + " " + utils.time() + " " + staff.data.forenames + ' ' + staff.data.surname + " was signed in, but didn't sign out.");
              req.flash('error', staff.data.forenames + ' ' + staff.data.surname + " was signed in, but didn't previously signout. Please do so in the future!");
              res.redirect('/reg/' + req.params.location);
            }
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
            try {
              //Check if student exists on the fire register
              fireRegisterManager.getRecord({ id : students._id }, (fireRecord) => {
                if (fireRecord.message === 'SUCCESS') {
                  // Check if the student was signed in
                  if (fireRecord.data.io === 1) {
                    // Update fireRecord
                    fireRegisterManager.updateRecord({
                      id : students._id,
                      forenames : students.forenames,
                      surname : students.surname,
                      type : 'student',
                      loc : req.params.location.toUpperCase(),
                      io : 0,
                      timeOut: utils.time(),
                      yearGroup : students.yearGroup,
                      tutorGrp : students.tutorGrp
                    }, (record) => {

                    })
                    if (fireRecord.data.timeOut.length === 0) {
                      // Update last register record with 'N/A' for timeOut
                      registerManager.updateLatestRecord({
                        id : req.body.scanID,
                        io : 1,
                        timeOut : 'N/A'
                      }, (record) => {

                      })
                    }
                    console.log("Log: " + utils.date() + " " + utils.time() + " " + req.params.location.toUpperCase() + " | " + students.forenames + ' ' + students.surname + " was signed out.");
                    req.flash('success', students.forenames + ' ' + students.surname + ' was signed out.')
                    res.redirect('/reg/' + req.params.location);
                  } else {
                    // Student was already signed out, so check if user pressed button twice
                    let currentTime = moment()
                    let lastTime = moment(fireRecord.data.timeOut, 'HH:mm:ss')
                    let diffTime = currentTime.diff(lastTime, 'seconds')

                    if (diffTime > 60) {
                      // Student didn't sign in, update fire register and register records with timeIn as 'N/A'
                      fireRegisterModel.updateRecord({
                        id : students._id,
                        forenames : students.forenames,
                        surname : students.surname,
                        type : 'student',
                        loc : req.params.location.toUpperCase(),
                        io : 0,
                        yearGroup : students.yearGroup,
                        tutorGrp : students.tutorGrp,
                        timeIn : 'N/A',
                        timeOut : utils.time()
                      }, (record) => {

                      })

                      if (fireRecord.data.timeOut.length === 0) {
                        // Update last register record with 'N/A' for timeOut
                        registerManager.updateLatestRecord({
                          id : req.body.scanID,
                          io : 1,
                          timeOut : 'N/A'
                        }, (record) => {

                        })
                      }

                      // Create new record with current time
                      registerManager.createNewRecord({
                        id : req.body.scanID,
                        surname : students.surname,
                        forenames : students.forenames,
                        type : 'student',
                        yearGroup : students.yearGroup,
                        tutorGrp : students.tutorGrp,
                        loc : req.params.location.toUpperCase(),
                        io : 0
                      }, (record) => {

                      })
                      console.log("Log: " + utils.date() + " " + utils.time() + " " + req.params.location.toUpperCase() + " | " + students.forenames + ' ' + students.surname + " was signed out, but didn't sign in.");
  										req.flash('error', students.forenames + ' ' + students.surname + " was signed out, but didn't sign in. Please do so in the future!")
  										res.redirect('/reg/' + req.params.location);
                    } else {
                      console.log("Log: " + utils.date() + " " + utils.time() + " " + req.params.location.toUpperCase() + " | " + students.forenames + ' ' + students.surname + " was signed out. Sign Out button was press more than once.");
                      req.flash('success', students.forenames + ' ' + students.surname + ' was signed out. But you dont\'t need to spam the button.')
                      res.redirect('/reg/' + req.params.location);
                    }
                  }
                } else {
                  // Create fire register record
                  fireRegisterManager.createNewRecord({
                    id : students._id,
                    forenames : students.forenames,
                    surname : students.surname,
                    type : 'student',
                    loc : req.params.location.toUpperCase(),
                    io : 0,
                    yearGroup : students.yearGroup,
                    tutorGrp : students.tutorGrp,
                    timeIn : 'N/A',
                    timeOut : utils.time()
                  }, (record) => {

                  })
                  registerManager.createNewRecord({
                    id : req.body.scanID,
                    surname : students.surname,
                    forenames : students.forenames,
                    type : 'student',
                    yearGroup : students.yearGroup,
                    tutorGrp : students.tutorGrp,
                    loc : req.params.location.toUpperCase(),
                    io : 0
                  }, (record) => {

                  })

                  console.log("Log: " + utils.date() + " " + utils.time() + " " + req.params.location.toUpperCase() + " | " + students.forenames + ' ' + students.surname + " was signed!");
    							req.flash('error', students.forenames + ' ' + students.surname + " was signed out!")
    							res.redirect('/reg/' + req.params.location);
                }
              })
            } catch (e) {
              console.log(e)
              req.flash('error', 'There was an error. Please contact admin.');
              res.redirect('/reg/' + req.params.location);
            }
  				//else
  				}else{
            try {
              //Check if user is staff
              staffManager.getStaff({ id : req.body.scanID }, (staff) => {
                if (staff.message === 'SUCCESS') {
                  // Check if staff exists on the fire register
                  fireRegisterManager.getRecord({ id : staff.data._id }, (fireRecord) => {
                    if (fireRecord.message === 'SUCCESS') {
                      // Check if staff member was signed in
                      if (fireRecord.data.io === 1) {
                        // Update fire register
                        fireRegisterManager.updateRecord({
                          id : staff.data._id,
                          forenames : staff.data.forenames,
                          surname : staff.data.surname,
                          type : 'staff',
                          loc : req.params.location.toUpperCase(),
                          io : 0,
                          staffType : staff.data.staffType,
                          timeOut : utils.time()
                        }, (record) => {

                        })

                        if (fireRecord.data.timeOut.length === 0) {
                          // Update last register record with 'N/A' for timeOut
                          registerManager.updateLatestRecord({
                            id : req.body.scanID,
                            io : 1,
                            timeOut : 'N/A'
                          }, (record) => {

                          })
                        }

                        console.log("Log: " + utils.date() + " " + utils.time() + " " + req.params.location.toUpperCase() + " | " + staff.data.forenames + ' ' + staff.data.surname + " was signed out.");
                        req.flash('success', staff.data.forenames + ' ' + staff.data.surname + ' was signed out.')
                        res.redirect('/reg/' + req.params.location);
                      } else {
                        // Staff member was already signed out, so check if user pressed button twice
                        let currentTime = moment()
                        let lastTime = moment(fireRecord.data.timeOut, 'HH:mm:ss')
                        let diffTime = currentTime.diff(lastTime, 'seconds')

                        if (diffTime > 60) {

                          // Update fire register
                          fireRegisterManager.updateRecord({
                            id : staff.data._id,
                            forenames : staff.data.forenames,
                            surname : staff.data.surname,
                            type : 'staff',
                            loc : req.params.location.toUpperCase(),
                            io : 0,
                            staffType : staff.data.staffType,
                            timeIn : 'N/A',
                            timeOut : utils.time()
                          }, (record) => {

                          })
                          if (fireRecord.data.timeOut.length === 0) {
                            // Update last register record with 'N/A' for timeOut
                            registerManager.updateLatestRecord({
                              id : req.body.scanID,
                              io : 1,
                              timeOut : 'N/A'
                            }, (record) => {

                            })
                          }
                          //Create new register record
                          registerManager.createNewRecord({
                            id : req.body.scanID,
                            surname : staff.surname,
                            forenames : staff.forenames,
                            type : 'staff',
                            loc : req.params.location.toUpperCase(),
                            io : 0
                          }, (record) => {

                          })
                          console.log("Log: " + utils.date() + " " + utils.time() + " " + req.params.location.toUpperCase() + " | " + staff.data.forenames + ' ' + staff.data.surname + " was signed out, but didn't sign in.");
                          req.flash('error', staff.data.forenames + ' ' + staff.data.surname + " was signed out, but didn't sign in. Please do so in the future!")
                          res.redirect('/reg/' + req.params.location);
                        } else {
                          console.log(' ')
                          console.log(`${staff.data.forenames} ${staff.data.surname}`)
                          req.flash('success', `${staff.data.forenames} ${staff.data.surname} was signed out. But you don't need to spam the button.`)
                          console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | ${staff.data.forenames} ${staff.data.surname} was signed out. Sign Out button was press more than once.`)
                          res.redirect('/reg/' + req.params.location);
                        }
                      }
                    } else {
                      fireRegisterManager.createNewRecord({
                        id : staff.data._id,
                        forenames : staff.data.forenames,
                        surname : staff.data.surname,
                        type : 'staff',
                        loc : req.params.location.toUpperCase(),
                        io : 0,
                        staffType : staff.data.staffType,
                        timeIn : 'N/A',
                        timeOut : utils.time()
                      }, (record) => {

                      })

                      //Create new register record
                      registerManager.createNewRecord({
                        id : req.body.scanID,
                        surname : staff.surname,
                        forenames : staff.forenames,
                        type : 'staff',
                        loc : req.params.location.toUpperCase(),
                        io : 0
                      }, (record) => {

                      })
                      console.log("Log: " + utils.date() + " " + utils.time() + " " + req.params.location.toUpperCase() + " | " + staff.data.forenames + ' ' + staff.data.surname + " was signed out.");
    									req.flash('error', staff.data.forenames + ' ' + staff.data.surname + " was signed out!")
    									res.redirect('/reg/' + req.params.location);
                    }
                  })
                } else {
                  console.log("Log: " + utils.date() + " " + utils.time() + " " + req.params.location.toUpperCase() + " | User tried to enter ID: " + req.body.scanID);
                  req.flash('error', "ID: " + req.body.scanID + " doesn't exist. Please contact admin.")
                  res.redirect('/reg/' + req.params.location);
                }
              })
            } catch (e) {
              console.log(e)
              req.flash('error', 'There was an error. Please contact admin.');
              res.redirect('/reg/' + req.params.location);
            }
  				}
  			})
  		}
  	}
 })


 // Export router module
 module.exports = router;
