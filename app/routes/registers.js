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
 const studentManager = require('../modules/student-manager')
 const registerManager = require('../modules/register-manager')
 const fireRegisterManager = require('../modules/fire-register-manager')

 // Config
 const config = require('../config')

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
        console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | ID wasn't scanned.`)
  			req.flash('error', 'Please enter/scan your id.');
  			res.redirect('/reg/' + req.params.location);
  		//else
  		}else{
  			//Remove focus from scan input
  			inputFocus = false;
  			//Check if student exists
        try {
          studentManager.getStudent({ id : req.body.scanID }, (student) => {

            if (student.message === 'SUCCESS') {
              let msg = null;
              if (config.manual_input.enabled == "true" && req.body.scanID == student.data._id) {
                try {
                  studentManager.incrementMICounter({ id : student.data._id }, (counter) => {
                    if (counter.message === 'MAX_REACHED_RESET') {
                      console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | ${student.data.forenames} ${student.data.surname} has used all their manual input allowance. Emailing and reseting to 0.`)
                      mailer.send({
                        receiver : config.manual_input.email,
                        subject : 'BASignIO: Manual Input',
                        text : `${student.data.forenames} ${student.data.surname} has used all their manual input allowance.`
                      }, (mail) => {
                        msg = 'You have used all of your manual input allowance.';
                      })
                    } else {
                      msg = `You have used ${student.data.manualCount}/${config.manual_input.max_uses} of your manual input allowance.`
                    }

                    console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | ${student.data.forenames} ${student.data.surname} justed scanned/entered their id. They have ${student.data.manualCount}/${config.manual_input.max_uses} of their manual input allowance.`)
                    res.render('registers', { title: 'BASignIO: ' + req.params.location.toUpperCase(), user: student.data, id: student.data._id, inputFocus: inputFocus, warning: msg});
                  })
                } catch (e) {
                  throw e
                }
              } else {
                if (req.body.scanID == student.data._id) {
                  //Manual Input was used, but not enabled.
                  console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | ${student.data.forenames} ${student.data.surname} just scanned/endered their id. Manual Input was used.`)
                  res.render('registers', { title: 'BASignIO: ' + req.params.location.toUpperCase(), user: student.data, id: student.data._id, inputFocus: inputFocus});
                }else{
                  //Get student forename and surname
                  console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | ${student.data.forenames} ${student.data.surname} just scanned/entered their id.`)
                  res.render('registers', { title: 'BASignIO: ' + req.params.location.toUpperCase(), user: student.data, id: student.data._id, inputFocus: inputFocus});
                }
              }

            } else {
              console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | Scanning ID: User isn't student, checking if user is a staff member`)
    					//Check if staff exists
              staffManager.getStaff({
                id : req.body.scanID,
                cardID : req.body.scanID,
                cardID2 : req.body.scanID
              }, (staff) => {
                if (staff.message === 'SUCCESS') {
                  console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | ${staff.data.forenames} ${staff.data.surname} just scanned/entered their id.`)
                  res.render('registers', { title: 'BASignIO: ' + req.params.location.toUpperCase(), user: staff.data, id: staff.data._id, inputFocus: inputFocus});
                } else {
                  //if user doesn't exist.
    							req.flash('error', 'Please contact admin. Your ID does not exist.');
    							res.redirect('/reg/' + req.params.location);
                }
              })
            }
          })
        } catch (e) {
          console.log(e)
        }
  		}
  	//if signin button is pressed
  	}else if(req.body.signIn){
  		/*function myfunction() {};
  		setTimeout(myfunction(), 2000);*/

  		//if scanID is empty
  		if (!req.body.scanID) {
  			//Print("Please scan your id")
        console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | ID wasn't scanned.`)
  			req.flash('error', 'Please enter/scan your id.');

  			res.redirect('/reg/' + req.params.location);
  		//else
  		}else{
  			//Print('Checking ID')
        console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | Checking ID: ${req.body.scanID}`)
  			//Removes focus from scan input
  			inputFocus = false;
  			//check if student exists
        try {
          studentManager.getStudent({ id : req.body.scanID }, (student) => {
            if (student.message === 'SUCCESS') {
              fireRegisterManager.getRecord({ id : student.data._id }, (fireRecord) => {
                if (fireRecord.message === 'SUCCESS') {
                  if (fireRecord.data.io === 0) {
                    fireRegisterManager.updateRecord({
                      id : student.data._id,
                      forenames : student.data.forenames,
                      surname : student.data.surname,
                      type : 'student',
                      loc : req.params.location.toUpperCase(),
                      io : 1,
                      yearGroup : student.data.yearGroup,
                      tutorGrp : student.data.tutorGrp,
                      timeIn : utils.time(),
                      timeOut : ' '
                    }, (record) => {
                      console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | Student fire register record was updated.`)
                    })
                    registerManager.createNewRecord({
                      id : student.data._id,
                      forenames : student.data.forenames,
                      surname : student.data.surname,
                      type : 'student',
                      loc : req.params.location.toUpperCase(),
                      io : 1,
                      yearGroup : student.data.yearGroup,
                      tutorGrp : student.data.tutorGrp,
                      timeIn : utils.time()
                    }, (record) => {
                      console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | New student register record was created.`)
                    })
                    console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | ${student.data.forenames} ${student.data.surname} was signed in!`)
                    req.flash('success', `${student.data.forenames} ${student.data.surname} was signed in!`)
                    res.redirect('/reg/' + req.params.location);
                  } else {
                    // Check if signin button was pressed twice
                    let currentTime = moment()
                    let lastTime = moment(fireRecord.data.timeIn, 'HH:mm:ss')
                    let diffTime = currentTime.diff(lastTime, 'seconds')

                    if (diffTime > 60) {
                      fireRegisterManager.updateRecord({
                        id : student.data._id,
                        forenames : student.data.forenames,
                        surname : student.data.surname,
                        type : 'student',
                        loc : req.params.location.toUpperCase(),
                        io : 1,
                        yearGroup : student.data.yearGroup,
                        tutorGrp : student.data.tutorGrp,
                        timeIn : utils.time(),
                        timeOut : ' '
                      }, (record) => {
                        console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | Student fire register record was updated.`)
                      })

                      // Update last register record with 'N/A' for timeOut
                      registerManager.updateLatestRecord({
                        id : student.data._id,
                        io : 1,
                        timeOut : 'N/A'
                      }, (record) => {
                        if (record.message === 'SUCCESS') {
                          console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | Student register record was updated with timeOut: N/A`)
                        } else {
                          console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | Register record could not be found with that student id.`)
                        }

                        //Create new register record
                        registerManager.createNewRecord({
                          id : student.data._id,
                          surname : student.data.surname,
                          forenames : student.data.forenames,
                          type : 'student',
                          loc : req.params.location.toUpperCase(),
                          yearGroup : student.data.yearGroup,
                          tutorGrp : student.data.tutorGrp,
                          io : 1,
                          timeIn : utils.time()
                        }, (record) => {
                          console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | New student register record was created.`)
                        })
                      })

                      console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | ${student.data.forenames} ${student.data.surname} was signed in, but didn't sign out.`)
                      req.flash('error', `${student.data.forenames} ${student.data.surname} was signed in, but didn't previously signout. Please do so in the future!`)
                      res.redirect('/reg/' + req.params.location);
                    } else {
                      console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | ${student.data.forenames} ${student.data.surname} was signed in. Sign in button was pressed more than once.`)
                      req.flash('success', `${student.data.forenames} ${student.data.surname} was signed in! But you don't need to spam the button.`)
                      res.redirect('/reg/' + req.params.location);
                    }
                  }
                } else {
                  // Create fire register record
                  fireRegisterManager.createNewRecord({
                    id : student.data._id,
                    forenames : student.data.forenames,
                    surname : student.data.surname,
                    type : 'student',
                    loc : req.params.location.toUpperCase(),
                    io : 1,
                    yearGroup : student.data.yearGroup,
                    tutorGrp : student.data.tutorGrp,
                    timeIn : utils.time(),
                    timeOut : ' '
                  }, (record) => {
                    console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | New student fire register record was created.`)
                  })
                  // Create new register record
                  registerManager.createNewRecord({
                    id : student.data._id,
                    surname : student.data.surname,
                    forenames : student.data.forenames,
                    type : 'student',
                    yearGroup : student.data.yearGroup,
                    tutorGrp : student.data.tutorGrp,
                    loc : req.params.location.toUpperCase(),
                    io : 1,
                    timeIn : utils.time()
                  }, (record) => {
                    console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | New student register record was created.`)
                  })
                  console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | ${student.data.forenames} ${student.data.surname} was signed in!`)
                  req.flash('success', `${student.data.forenames} ${student.data.surname} was signed in!`)
  								res.redirect('/reg/' + req.params.location);
                }
              })
            } else {
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
                          timeOut : ' ',
                          staffType : staff.data.staffType
                        }, (record) => {
                          console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | Staff fire register record was updated.`)
                        })
                        // Create new register record
                        registerManager.createNewRecord({
                          id : staff.data._id,
                          surname : staff.data.surname,
                          forenames : staff.data.forenames,
                          type : 'staff',
                          loc : req.params.location.toUpperCase(),
                          io : 1,
                          timeIn : utils.time()
                        }, (record) => {
                          console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | New staff register record was created.`)
                        })
                        console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | ${staff.data.forenames} ${staff.data.surname} was signed in!`)
                        req.flash('success', `${staff.data.forenames} ${staff.data.surname} was signed in!`)
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
                            timeOut : ' ',
                            staffType : staff.data.staffType
                          }, (record) => {
                            console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | Staff fire register record was updated.`)
                          })
                          // Update last register record with 'N/A' for timeOut
                          registerManager.updateLatestRecord({
                            id : staff.data._id,
                            io : 1,
                            timeOut : 'N/A'
                          }, (record) => {
                            console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | Staff register record was updated.`)

                            //Create new register record
                            registerManager.createNewRecord({
                              id : staff.data._id,
                              surname : staff.data.surname,
                              forenames : staff.data.forenames,
                              type : 'staff',
                              loc : req.params.location.toUpperCase(),
                              io : 1,
                              timeIn : utils.time()
                            }, (record) => {
                              console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | New staff register record was created.`)
                            })
                          })

                          console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | ${staff.data.forenames} ${staff.data.surname} was signed in, but didn't sign out.`)
                          req.flash('error', `${staff.data.forenames} ${staff.data.surname} was signed in, but didn't previously sign out. Please do so in the future!`)
                          res.redirect('/reg/' + req.params.location);
                        } else {
                          console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | ${staff.data.forenames} ${staff.data.surname} was signed in. The sign in button was pressed more than once.`)
                          req.flash('success', `${staff.data.forenames} ${staff.data.surname} was signed in! But you don't need to spam the button.`)
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
                        timeOut : ' '
                      }, (record) => {
                        console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | New staff fire register record was created.`)
                      })
                      //Create new register record
                      registerManager.createNewRecord({
                        id : staff.data._id,
                        surname : staff.data.surname,
                        forenames : staff.data.forenames,
                        type : 'staff',
                        loc : req.params.location.toUpperCase(),
                        io : 1,
                        timeIn : utils.time()
                      }, (record) => {
                        console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | New staff register record was created.`)
                      })

                      console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | ${staff.data.forenames} ${staff.data.surname} was signed in.`)
                      req.flash('success', `${staff.data.forenames} ${staff.data.surname} was signed in.`)
                      res.redirect('/reg/' + req.params.location)
                    }
                  })
                }
              })
            }
          })
        } catch (e) {
          console.log(e)
          req.flash('error', 'There was an error. Please contact admin.');
          res.redirect('/reg/' + req.params.location);
        }
  		}
  	//if signout button is pressed
  	}else if(req.body.signOut){
  		//if scanID is empty
  		if (!req.body.scanID) {
  			//Print("Please scan your id")
        console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | ID wasn't scanned.`)
  			req.flash('error', 'Please enter/scan your id.');
  			res.redirect('/reg/' + req.params.location);
  		//else
  		}else{
  			//Print('Checking ID')
        console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | Checking ID: ${req.body.scanID}`)
  			//Removes focus from scan input
  			inputFocus = false;
  			//Check if student exists
        try {
          studentManager.getStudent({ id : req.body.scanID }, (student) => {
            if (student.message === 'SUCCESS') {
              fireRegisterManager.getRecord({ id : student.data._id }, (fireRecord) => {
                if (fireRecord.message === 'SUCCESS') {
                  // Check if the student was signed in
                  if (fireRecord.data.io === 1) {
                    // Update fireRecord
                    fireRegisterManager.updateRecord({
                      id : student.data._id,
                      forenames : student.data.forenames,
                      surname : student.data.surname,
                      type : 'student',
                      loc : req.params.location.toUpperCase(),
                      io : 0,
                      timeOut: utils.time(),
                      yearGroup : student.data.yearGroup,
                      tutorGrp : student.data.tutorGrp
                    }, (record) => {
                      if (record.message === 'SUCCESS') {
                        console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | IO state and timeOut fields were updated for student fire register record.`)
                      }
                    })
                    // Update last register record with current time for timeOut
                    registerManager.updateLatestRecord({
                      id : student.data._id,
                      io : 0,
                      timeOut : utils.time()
                    }, (record) => {
                      if (record.message === 'SUCCESS') {
                        console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | IO state and timeOut fields were updated for student register record.`)
                      } else {
                        console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | Last register record could not be found.`)
                      }
                    })
                    console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | ${student.data.forenames} ${student.data.surname} was signed out.`)
                    req.flash('success', `${student.data.forenames} ${student.data.surname} was signed out.`)
                    res.redirect('/reg/' + req.params.location);
                  } else {
                    // Student was already signed out, so check if user pressed button twice
                    let currentTime = moment()
                    let lastTime = moment(fireRecord.data.timeOut, 'HH:mm:ss')
                    let diffTime = currentTime.diff(lastTime, 'seconds')

                    if (diffTime > 60) {
                      // Student didn't sign in, update fire register and register records with timeIn as 'N/A'
                      fireRegisterManager.updateRecord({
                        id : student.data._id,
                        forenames : student.data.forenames,
                        surname : student.data.surname,
                        type : 'student',
                        loc : req.params.location.toUpperCase(),
                        io : 0,
                        yearGroup : student.data.yearGroup,
                        tutorGrp : student.data.tutorGrp,
                        timeIn : 'N/A',
                        timeOut : utils.time()
                      }, (record) => {
                        if (record.message === 'SUCCESS') {
                          console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | IO state, timeIn and timeOut fields were updated for student fire register record.`)
                        } else {
                          console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | Student's fire register record could not be found.`)
                        }
                      })

                      if (fireRecord.data.timeOut.length === 1) {
                        // Update last register record with 'N/A' for timeOut
                        registerManager.updateLatestRecord({
                          id : student.data._id,
                          io : 0,
                          timeOut : 'N/A'
                        }, (record) => {
                          if (record.message === 'SUCCESS') {
                            console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | IO state and timeOut fields were updated for student register record.`)
                          } else {
                            console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | Last register record could not be found.`)
                          }
                        })
                      }

                      // Create new record with current time
                      registerManager.createNewRecord({
                        id : student.data._id,
                        surname : student.data.surname,
                        forenames : student.data.forenames,
                        type : 'student',
                        yearGroup : student.data.yearGroup,
                        tutorGrp : student.data.tutorGrp,
                        loc : req.params.location.toUpperCase(),
                        io : 0,
                        timeIn : 'N/A',
                        timeOut : utils.time()
                      }, (record) => {
                        if (record.message === 'SUCCESS') {
                          console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | New student register record was created with timeIn set to 'N/A and timeOut as current time.'`)
                        }
                      })
                      console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | ${student.data.forenames} ${student.data.surname} was signed out, but didn't sign in.`)
                      req.flash('error', `${student.data.forenames} ${student.data.surname} was signed out, but didn't sign in. Please do so in the future!`)
                      res.redirect('/reg/' + req.params.location);
                    } else {
                      console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | ${student.data.forenames} ${student.data.surname} was signed out. Sign Out button was pressed more than once`)
                      req.flash('success', `${student.data.forenames} ${student.data.surname} was signed out. But you don't need to spam the button.`)
                      res.redirect('/reg/' + req.params.location);
                    }
                  }
                } else {
                  // Create fire register record
                  fireRegisterManager.createNewRecord({
                    id : student.data._id,
                    forenames : student.data.forenames,
                    surname : student.data.surname,
                    type : 'student',
                    loc : req.params.location.toUpperCase(),
                    io : 0,
                    yearGroup : student.data.yearGroup,
                    tutorGrp : student.data.tutorGrp,
                    timeIn : 'N/A',
                    timeOut : utils.time()
                  }, (record) => {
                    if (record.message === 'SUCCESS') {
                      console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | New student fire register record was created with timeIn set to 'N/A and timeOut as current time.'`)
                    }
                  })
                  registerManager.createNewRecord({
                    id : student.data._id,
                    surname : student.data.surname,
                    forenames : student.data.forenames,
                    type : 'student',
                    yearGroup : student.data.yearGroup,
                    tutorGrp : student.data.tutorGrp,
                    loc : req.params.location.toUpperCase(),
                    io : 0,
                    timeIn : 'N/A',
                    timeOut : utils.time()
                  }, (record) => {
                    if (record.message === 'SUCCESS') {
                      console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | New student register record was created with timeIn set to 'N/A and timeOut as current time.'`)
                    }
                  })

                  console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | ${student.data.forenames} ${student.data.surname} was signed out!`)
                  req.flash('success', `${student.data.forenames} ${student.data.surname} was signed out!`)
                  res.redirect('/reg/' + req.params.location);
                }
              })
            } else {
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
                          if (record.message === 'SUCCESS') {
                            console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | IO state and timeOut fields were updated for staff fire register record.`)
                          } else {
                            console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | Staff member's fire register record could not be found.`)
                          }
                        })

                        // Update last register record with current time for timeOut
                        registerManager.updateLatestRecord({
                          id : staff.data._id,
                          io : 0,
                          timeOut : utils.time()
                        }, (record) => {
                          if (record.message === 'SUCCESS') {
                            console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | IO state and timeOut fields were updated for staff register record.`)
                          } else {
                            console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | Staff member's register record could not be found.`)
                          }
                        })

                        console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | ${staff.data.forenames} ${staff.data.surname} was signed out.`)
                        req.flash('success', `${staff.data.forenames} ${staff.data.surname} was signed out.`)
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
                            if (record.message === 'SUCCESS') {
                              console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | IO state, timeIn and timeOut fields were updated for staff fire register record.`)
                            } else {
                              console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | Staff member's fire register record could not be found.`)
                            }
                          })
                          if (fireRecord.data.timeOut.length === 1) {
                            // Update last register record with 'N/A' for timeOut
                            registerManager.updateLatestRecord({
                              id : staff.data._id,
                              io : 0,
                              timeOut : 'N/A'
                            }, (record) => {
                              if (record.message === 'SUCCESS') {
                                console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | IO state and timeOut fields were updated for staff register record.`)
                              } else {
                                console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | Staff member's register record could not be found.`)
                              }
                            })
                          }
                          //Create new register record
                          registerManager.createNewRecord({
                            id : staff.data._id,
                            surname : staff.data.surname,
                            forenames : staff.data.forenames,
                            type : 'staff',
                            loc : req.params.location.toUpperCase(),
                            io : 0,
                            timeIn : 'N/A',
                            timeOut : utils.time()
                          }, (record) => {
                            if (record.message === 'SUCCESS') {
                              console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | New staff register record was created with timeIn set to 'NA' and timeOut set to current time.`)
                            }
                          })

                          console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | ${staff.data.forenames} ${staff.data.surname} was signed out, but didn't sign in.`)
                          req.flash('error', `${staff.data.forenames} ${staff.data.surname} was signed out, but didn't sign in. Please do so in the future!`)
                          res.redirect('/reg/' + req.params.location);
                        } else {
                          console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | ${staff.data.forenames} ${staff.data.surname} was signed out. Sign Out button was press more than once.`)
                          req.flash('success', `${staff.data.forenames} ${staff.data.surname} was signed out. But you don't need to spam the button.`)
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
                        if (record.message === 'SUCCESS') {
                          console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | New staff fire register record was created with timeIn set to 'NA' and timeOut set to current time.`)
                        }
                      })

                      //Create new register record
                      registerManager.createNewRecord({
                        id : staff.data._id,
                        surname : staff.data.surname,
                        forenames : staff.data.forenames,
                        type : 'staff',
                        loc : req.params.location.toUpperCase(),
                        io : 0,
                        timeIn : 'N/A',
                        timeOut : utils.time()
                      }, (record) => {
                        if (record.message === 'SUCCESS') {
                          console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | New staff register record was created with timeIn set to 'NA' and timeOut set to current time.`)
                        }
                      })
                      console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | ${staff.data.forenames} ${staff.data.surname} was signed out.`)
                      req.flash('success', `${staff.data.forenames} ${staff.data.surname} was signed out!`)
                      res.redirect('/reg/' + req.params.location);
                    }
                  })
                } else {
                  console.log(`Log: ${utils.date()} ${utils.time()} ${req.params.location.toUpperCase()} | User tried to enter ID: ${req.body.scanID}`)
                  req.flash('error', `ID: ${req.body.scanID} doesn't exist. Please contact admin.`)
                  res.redirect('/reg/' + req.params.location);
                }
              })
            }
          })
        } catch (e) {
          console.log(e)
          req.flash('error', 'There was an error. Please contact admin.');
          res.redirect('/reg/' + req.params.location);
        }
  		}
  	}
 })


 // Export router module
 module.exports = router;
