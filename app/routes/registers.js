/*
 * -----------------------------
 * BASignIO - Routes: Registers
 * -----------------------------
 */

 // Dependencies
 const router = require('express').Router();
 const moment = require('moment');
 const utils = require('../lib/utilities')
 const mailer = require('../lib/email');
 const student_manager = require('../lib/student_manager');
 const staff_manager = require('../lib/staff_manager');
 const register_manager = require('../lib/register_manager');
 const fire_register_manager = require('../lib/fire_register_manager');

 // Config
 const config = require('../config');

 // Global Variables
 var inputFocus;


 router.get('/', (req, res, next) => {
   res.redirect('/');
 });

 router.get('/:location', (req, res, next) => {
   // Gives focus to scan ID
   inputFocus = true;
   res.render('registers', { title: 'BASignIO: ' + req.params.location.toUpperCase(), user: '', loc: req.params.location, inputFocus: inputFocus});
 });

 router.post('/:location', (req, res, next) => {
   // Check if scanSubmit is set
   if (req.body.scanSubmit) {
     // If scanId is empty
     if (!req.body.scanID) {
       // Print "Please scan your id"
       console.log("Log: " + utils.date() + " " + utils.time() + " " + req.params.location.toUpperCase() + " | ID wasn't scanned.");
       req.flash('error', 'Please enter/scan your id.');

       res.redirect('/reg/' + req.params.location);
     } else {
       // Remove focus from scan input
       inputFocus = false;
       console.log('Fetch Student')
       // Check if student exists
       try {
         student_manager.getStudent(req.body.scanID, (student) => {
           console.log('LOOKING FOR STUDENT')
           // If Student exists
           if (student.message === 'SUCCESS') {
             console.log('FOUND STUDENT')
             if (config.manual_input.enabled == "true" && req.body.scanID == student.data._id) {
               student_manager.incrementMICounter(student.data._id, (counter) => {
                 let message = 'You have used ' + counter.data + '/'+ config.manual_input.max_uses + ' of your manual input allowance.';
                 if (counter.message === 'MAX_REACHED_RESET') {
                   mailer.send({
                     receiver: config.manual_input.email + ', pagee@battleabbeyschool.com',
                     subject: 'BASignIO: Manual Input',
                     text: students.fullName + ' has used all their manual input allowance.'
                   }, (error, mail) => {
                     if (error) {
                       console.error(error);
                       return;
                     }

                     if (mail) {
                       console.log(mail);
                     }
                   });
                   message = 'You have used all of your manual input allowance.';
                 }
               })
               // Get student forename and surname
               console.log("Log: " + utils.date() + " " + utils.time() + " " + req.params.location.toUpperCase() + " " + student.data.forenames + " " + student.data.surname +  'just scanned/entered their id. They have' + students.manualCount + '/'+ config.manual_input.max_uses + ' of their manual input allowance.');
               res.render('registers', { title: 'BASignIO: ' + req.params.location.toUpperCase(), user: student.data, id: students._id, inputFocus: inputFocus, warning: message});
             } else {
               if (req.body.scanID == student.data._id) {
                 // Manual Input was used.
                 console.log("Log: " + utils.date() + " " + utils.time() + " " + req.params.location.toUpperCase() + " " + student.data.forenames + " " + student.data.surname + " just scanned/entered their id. Manual Input was used.");
                 res.render('registers', { title: 'BASignIO: ' + req.params.location.toUpperCase(), user: student.data, id: student.data._id, inputFocus: inputFocus});
               } else {
                 console.log("Log: " + utils.date() + " " + utils.time() + " " + req.params.location.toUpperCase() + " " + student.data.forenames + " " + student.data.surname + " just scanned/entered their id.");
                 res.render('registers', { title: 'BASignIO: ' + req.params.location.toUpperCase(), user: student.data, id: student.data._id, inputFocus: inputFocus});
               }
             }
           } else {
             console.log('NOT_FOUND STUDENT')
             console.log("Log: " + utils.date() + " " + utils.time() + " " + req.params.location.toUpperCase() +" Scanning ID: User isn't student checking if staff member.");
             //Check if staff exists
             staff_manager.getStaff(req.body.scanID, (staff) => {
               //if staff exists
               if (staff.message === 'SUCCESS') {
                 //Get staff forename and surname
                 console.log("Log: " + utils.date() + " " + utils.time() + " " + req.params.location.toUpperCase() + " " + staff.data.forenames + " " + staff.data.surname + " just scanned/entered their id.");
                 res.render('registers', { title: 'BASignIO: ' + req.params.location.toUpperCase(), user: staff.data, id: staff.data._id, inputFocus: inputFocus});
               }else{
                 //if user doesn't exist.
                 req.flash('error', 'Please contact admin. Your ID does not exist.');
                 res.redirect('/reg/' + req.params.location);
               }
             })
           }
         })
       } catch (e) {
         console.log(e)
         req.flash('error', 'Something went wrong. Please contact admin.');
         res.redirect('/reg/' + req.params.location);
       }
     }
   } else if(req.body.signIn) {
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
       student_manager.getStudent(req.body.scanID, (student) => {
         //if student exists
         if(student.message === 'SUCCESS'){
           //Check if student exists on the fire register
           fire_register_manager.getRecord(student.data._id, (record) => {
             //if student exists on fire register
             if(record.message == 'SUCCESS'){
               //Check if student was signed out
                 //if user was signed out
                 if (record.data.io == 0) {
                   //Update fire register with new timeIn and location
                   fire_register_manager.updateRecord({
                     id : student.data._id,
                     io : 1,
                     location : req.params.location
                   })
                   register_manager.createRecord({
                     id : req.body.scanID,
                     forenames : student.data.forenames,
                     surname : student.data.surname,
                     type : 'student',
                     location : req.params.location,
                     yearGroup : student.data.yearGroup,
                     io : 1
                   }, (record) => {
                     if (record.message === 'SUCCESS') {
                       //Print('Student was signed in!')
                       console.log("Log: " + utils.date() + " " + utils.time() + " " + student.data.forenames + ' ' + student.data.surname + ' was signed in!');
                       req.flash('success', student.forenames + ' ' + student.surname + ' was signed in!');
                     } else {
                       console.log("Log: " + utils.date() + " " + utils.time() + " Something went wrong trying to sign " + student.data.forenames + " " + student.data.surname + " in");
                       req.flash('error', "Something went wrong trying to sign your in. Please try again.");
                     }
                     res.redirect('/reg/' + req.params.location);
                   })
                 //else
                 }else{
                   //Check if signin button was pressed twice
                   var currentTime = moment()
                   var lastTime = moment(student.data.timeIn, 'HH:mm:ss')
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
                     //Create new register record
                     register_manager.createRecord({
                       id : req.body.scanID,
                       forenames : student.data.forenames,
                       surname : student.data.surname,
                       type : 'student',
                       location : req.params.location,
                       yearGroup : student.data.yearGroup,
                       io : 1
                     }, (record) => {
                       if (record.message === 'SUCCESS') {
                         console.log("Log: " + utils.date() + " " + utils.time() + " " + student.data.forenames + ' ' + student.data.surname + " was signed in, but didn't sign out.");
                         req.flash('error', student.data.forenames + ' ' + student.data.surname + " was signed in, but didn't previously signout. Please do so in the future!");
                       } else {
                         console.log("Log: " + utils.date() + " " + utils.time() + " Something went wrong trying to sign " + student.data.forenames + " " + student.data.surname + " in");
                         req.flash('error', "Something went wrong trying to sign your in. Please try again.");
                       }
                       res.redirect('/reg/' + req.params.location);
                     })
                   }else{
                     fire_register_manager.updateRecord({
                       id : student.data._id,
                       io : 1,
                       location : req.params.location
                     })
                     console.log("Log: " + utils.date() + " " + utils.time() + " " + student.data.forenames + ' ' + student.data.surname + " was signed in. Sign in button was press more than once.");
                     req.flash('success', student.data.forenames + ' ' + student.data.surname + ' was signed in! But you dont\'t need to spam the button.');

                     res.redirect('/reg/' + req.params.location);
                   }
                 }
             //else, student doesn't exist on the fire register
             }else{
               //Create fire register record
               fire_register_manager.createRecord({
                 id : student.data._id,
                 forenames : student.data.forenames,
                 surname : student.data.surname,
                 yearGroup : student.data.yearGroup,
                 tutorGrp : student.data.tutorGrp,
                 type : 'student',
                 location : req.params.location,
                 io : 1
               }, (record) => {
                 if (record.message !== 'SUCCESS') {
                   console.log("Log: " + utils.date() + " " + utils.time() + " Something went wrong trying to sign " + student.data.forenames + " " + student.data.surname + " in on fire register.");
                   req.flash('error', "Something went wrong trying to sign your in. Please try again.");
                 }
                 //Create new register record
                 register_manager.createRecord({
                   id : req.body.scanID,
                   forenames : student.data.forenames,
                   surname : student.data.surname,
                   type : 'student',
                   location : req.params.location,
                   yearGroup : student.data.yearGroup,
                   tutorGrp : student.data.tutorGrp,
                   io : 1
                 }, (record) => {
                   if (record.message === 'SUCCESS') {
                     console.log("Log: " + utils.date() + " " + utils.time() + " " + student.data.forenames + ' ' + student.data.surname + ' was signed in!');
                     req.flash('success', student.data.forenames + ' ' + student.data.surname + ' was signed in!');
                   } else {
                     console.log("Log: " + utils.date() + " " + utils.time() + " Something went wrong trying to sign " + student.data.forenames + " " + student.data.surname + " in");
                     req.flash('error', "Something went wrong trying to sign your in. Please try again.");
                   }
                   res.redirect('/reg/' + req.params.location);
                 })
               })
             }
           })
         //else
         }else{
           //check if Staff exists
           staff_manager.getStaff(req.body.scanID, (staff) => {
             //if Staff exists
             if(staff.message === 'SUCCESS'){
               //Check if Staff exists on the fire register
               fire_register_manager.getRecord(staff.data._id, (record) => {
                 //if student exists on fire register
                 if(record.message === 'SUCCESS'){
                   //Check if Staff was signed out
                     //if user was signed out
                     if (record.data.io == 0) {
                       //Update fire register, io state and location
                       fire_register_manager.updateRecord({
                         id : staff.data._id,
                         io : 1,
                         location : req.params.location
                       })

                       //Create new register record
                       register_manager.createRecord({
                         id : staff.data._id,
                         forenames : staff.data.forenames,
                         surname : staff.data.surname,
                         type : 'staff',
                         location : req.params.location,
                         io : 1
                       }, (record) => {
                         if (record.message === 'SUCCESS') {
                           console.log("Log: " + utils.date() + " " + utils.time() + " " + staff.data.forenames + ' ' + staff.data.surname + ' was signed in!');
                           req.flash('success', staff.data.forenames + ' ' + staff.data.surname + ' was signed in!');
                         } else {
                           console.log("Log: " + utils.date() + " " + utils.time() + " Something went wrong trying to sign " + staff.data.forenames + " " + staff.data.surname + " in");
                           req.flash('error', "Something went wrong trying to sign your in. Please try again.");
                         }
                         res.redirect('/reg/' + req.params.location);
                       })
                     //else
                     }else{
                       //Check if signin button was pressed twice
                       var currentTime = moment()
                       var lastTime = moment(exists.timeIn, 'HH:mm:ss')
                       var diffTime = currentTime.diff(lastTime, 'seconds');

                       //if (diffTime > 60) {
                         //Update fire register, io state and location
                         fire_register_manager.updateRecord({
                          id : staff.data._id,
                          io : 1,
                          location : req.params.location
                         })
                         //Update last register record with 'N/A' for timeOut
                         register_manager.updateLatestRecord({
                           id : staff.data._id,
                           io : 1
                         })
                         //Create new register record
                         register_manager.createRecord({
                           id : staff.data._id,
                           forenames : staff.data.forenames,
                           surname : staff.data.surname,
                           type : 'staff',
                           location : req.params.location,
                           io : 1
                         }, (record) => {
                           if (record.message === 'SUCCESS') {
                             console.log("Log: " + utils.date() + " " + utils.time() + " " + staff.data.forenames + ' ' + staff.data.surname + " was signed in, but didn't sign out.");
                             req.flash('warning', staff.data.forenames + ' ' + staff.data.surname + " was signed in, but didn't previously signout. Please do so in the future!");
                           } else {
                             console.log("Log: " + utils.date() + " " + utils.time() + " Something went wrong trying to sign " + staff.data.forenames + " " + staff.data.surname + " in");
                             req.flash('error', "Something went wrong trying to sign your in. Please try again.");
                           }
                           res.redirect('/reg/' + req.params.location);
                         })
                     }
                 //else, Staff doesn't exist on the fire register
                 }else{
                   //Create fire register record
                   fire_register_manager.createRecord({
                     id : staff.data._id,
                     forenames : staff.data.forenames,
                     surname : staff.data.surname,
                     type : 'staff',
                     loc : req.params.location,
                     io : 1
                   }, (record) => {
                     if (record.message !== 'SUCCESS') {
                       console.log("Log: " + utils.date() + " " + utils.time() + " Something went wrong trying to sign " + student.data.forenames + " " + student.data.surname + " in on fire register.");
                       req.flash('error', "Something went wrong trying to sign your in. Please try again.");
                     }
                     //Create new register record
                     register_manager.createRecord({
                       id : staff.data._id,
                       forenames : staff.data.forenames,
                       surname : staff.data.surname,
                       type : 'staff',
                       location : req.params.location,
                       io : 1
                     }, (record) => {
                       if (record.message === 'SUCCESS') {
                         console.log("Log: " + utils.date() + " " + utils.time() + " " + req.params.location.toUpperCase() + " | " + staff.data.forenames + ' ' + staff.data.surname + " was signed in.");
                         req.flash('success', staff.data.fullName + " was signed in!")
                       } else {
                         console.log("Log: " + utils.date() + " " + utils.time() + " Something went wrong trying to sign " + staff.data.forenames + " " + staff.data.surname + " in");
                         req.flash('error', "Something went wrong trying to sign your in. Please try again.");
                       }
                       res.redirect('/reg/' + req.params.location);
                     })
                   })
                 }
               })
             }else{
               console.log("Log: " + utils.date() + " " + utils.time() + " " + req.params.location.toUpperCase() + " | User tried to enter ID: " + req.body.scanID);
               req.flash('error', "ID: " + req.body.scanID + " doesn't exist. Please contact admin.")
               res.redirect('/reg/' + req.params.location);
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
       student_manager.getStudent(req.body.scanID, (student) => {
         //if student exists
         if (student.message === 'SUCCESS') {
           //Check if student exists on the fire register
           try {
             fire_register_manager.getRecord(student.data._id, (record) => {
               //if student exists on fire register
               if (record.message === 'SUCCESS') {
                 //Check if student was signed in
                   //if student was signed in
                   if (record.data.io == 1) {
                     //Update fire register with timeOut
                     fire_register_manager.updateRecord({
                      id : student.data._id,
                      io : 0,
                      location : req.params.location
                     })
                     //Update last register record with 'N/A' for timeOut
                     try {
                       register_manager.updateLatestRecord({
                         id : student.data._id,
                         io : 0
                       })
                     } catch (e) {
                       console.log('User wasn\'t signed in before.')
                     }
                     //Print('Student was signed out')
                     console.log("Log: " + utils.date() + " " + utils.time() + " " + req.params.location.toUpperCase() + " | " + record.data.forenames + ' ' + record.data.surname + " was signed out.");
                     req.flash('success', record.data.fullName + ' was signed out.')
                     res.redirect('/reg/' + req.params.location);
                   //else
                   } else {
                     //Check if signout button was pressed twice
                     var currentTime = moment()
                     var lastTime = moment(record.data.timeOut, 'HH:mm:ss');
                     var diffTime = currentTime.diff(lastTime, 'seconds');

                     if (diffTime > 60) {
                       //Update fire register with timeIn as 'N/A', new timeOut and new location
                       fire_register_manager.updateRecord({
                        id : student.data._id,
                        io : 0,
                        location : req.params.location
                       })
                       //Update register record with timeOut as 'N/A'
                       try {
                         register_manager.updateLatestRecord({
                           id : student.data._id,
                           io : 0
                         })
                       } catch (e) {
                         console.log('User wasn\'t signed in before.')
                       }
                       //Create new register record
                       register_manager.createRecord({
                         id : student.data._id,
                         forenames : student.data.forenames,
                         surname : student.data.surname,
                         type : 'student',
                         location : req.params.location,
                         yearGroup : student.data.yearGroup,
                         io : 0
                       }, (record) => {
                         if (record.message === 'SUCCESS') {
                           console.log("Log: " + utils.date() + " " + utils.time() + " " + student.data.forenames + ' ' + student.data.surname + " was signed in, but didn't sign out.");
                           req.flash('error', student.data.forenames + ' ' + student.data.surname + " was signed in, but didn't previously signout. Please do so in the future!");
                         } else {
                           console.log("Log: " + utils.date() + " " + utils.time() + " Something went wrong trying to sign " + student.data.forenames + " " + student.data.surname + " in");
                           req.flash('error', "Something went wrong trying to sign your in. Please try again.");
                         }
                         res.redirect('/reg/' + req.params.location);
                       })
                     }else{
                       console.log("Log: " + utils.date() + " " + utils.time() + " " + req.params.location.toUpperCase() + " | " + student.data.forenames + ' ' + student.data.surname + " was signed out. Sign Out button was press more than once.");
                       req.flash('success', student.data.fullName + ' was signed out. But you dont\'t need to spam the button.')
                       res.redirect('/reg/' + req.params.location);
                     }
                   }
               //else; student doesn't exist on the fire register
               }else{
                 //Create fire register record with current date and timeIn and location
                 //Create fire register record
                 fire_register_manager.createRecord({
                   id : student.data._id,
                   forenames : student.data.forenames,
                   surname : student.data.surname,
                   yearGroup : student.data.yearGroup,
                   tutorGrp : student.data.tutorGrp,
                   type : 'student',
                   loc : req.params.location,
                   io : 0
                 }, (record) => {
                   if (record.message !== 'SUCCESS') {
                     console.log("Log: " + utils.date() + " " + utils.time() + " Something went wrong trying to sign " + student.data.forenames + " " + student.data.surname + " in on fire register.");
                     req.flash('error', "Something went wrong trying to sign your in. Please try again.");
                   }
                   //Create new register record
                   register_manager.createRecord({
                     id : student.data._id,
                     forenames : student.data.forenames,
                     surname : student.data.surname,
                     type : 'student',
                     location : req.params.location,
                     yearGroup : student.data.yearGroup,
                     io : 0
                   }, (record) => {
                     if (record.message === 'SUCCESS') {
                       console.log("Log: " + utils.date() + " " + utils.time() + " " + student.data.forenames + ' ' + student.data.surname + " was signed in, but didn't sign out.");
                       req.flash('error', student.data.forenames + ' ' + student.data.surname + " was signed in, but didn't previously signout. Please do so in the future!");
                     } else {
                       console.log("Log: " + utils.date() + " " + utils.time() + " Something went wrong trying to sign " + student.data.forenames + " " + student.data.surname + " in");
                       req.flash('error', "Something went wrong trying to sign your in. Please try again.");
                     }
                     res.redirect('/reg/' + req.params.location);
                   })
                 })
               }
             })
           } catch (e) {
             console.log(e)
             req.flash('error', 'Something went wrong. Please contact admin.');
             res.redirect('/reg/' + req.params.location);
           }
         //else
         }else{
           //Check if user is staff
           staff_manager.getStaff(req.body.scanID, (staff) => {
             //if staff exists
             if (staff.message === 'SUCCESS') {
               //Check if staff exists on the fire register
               fire_register_manager.getRecord(staff.data._id, (record) => {
                 //if staff exists on the fire register
                 if (record.message === 'SUCCESS') {
                   //Check if staff was signed in
                     //if staff was signed in
                     if(record.data.io == 1){
                       //Update fire register with timeOut
                       fire_register_manager.updateRecord({
                        id : staff.data._id,
                        io : 0,
                        location : req.params.location
                       })
                       //Update last register record with 'N/A' for timeOut
                       try {
                         register_manager.updateLatestRecord({
                           id : staff.data._id,
                           io : 0
                         })
                       } catch (e) {
                         console.log('User wasn\'t signed in before.')
                       }
                       //Print('Staff was signed out')
                       console.log("Log: " + utils.date() + " " + utils.time() + " " + req.params.location.toUpperCase() + " | " + staff.data.forenames + ' ' + staff.data.surname + " was signed out.");
                       req.flash('success', staff.data.fullName + ' was signed out.')
                       res.redirect('/reg/' + req.params.location);
                     //else
                     }else{
                       //Check if signout button was pressed twice
                       var currentTime = moment()
                       var lastTime = moment(staff.data.timeOut, 'HH:mm:ss');
                       var diffTime = currentTime.diff(lastTime, 'seconds');

                       //if (diffTime > 60) {
                         //Update fire register with timeIn as 'N/A', new timeOut and new location
                         fire_register_manager.updateRecord({
                          id : staff.data._id,
                          io : 0,
                          location : req.params.location
                         })
                         //Update last register record with 'N/A' for timeOut
                         try {
                           register_manager.updateLatestRecord({
                             id : staff.data._id,
                             io : 0
                           })
                         } catch (e) {
                           console.log('User wasn\'t signed in before.')
                         }

                         //Create new register record
                         register_manager.createRecord({
                           id : staff.data._id,
                           forenames : staff.data.forenames,
                           surname : staff.data.surname,
                           type : 'staff',
                           location : req.params.location,
                           io : 0
                         }, (record) => {
                           if (record.message === 'SUCCESS') {
                             console.log("Log: " + utils.date() + " " + utils.time() + " " + req.params.location.toUpperCase() + " | " + staff.data.forenames + ' ' + staff.data.surname + " was signed in.");
                             req.flash('success', staff.data.fullName + " was signed in!")
                           } else {
                             console.log("Log: " + utils.date() + " " + utils.time() + " Something went wrong trying to sign " + staff.data.forenames + " " + staff.data.surname + " in");
                             req.flash('error', "Something went wrong trying to sign your in. Please try again.");
                           }
                           res.redirect('/reg/' + req.params.location);
                         })
                     }
                 //else; staff doesn't exist on the fire register
                 }else{
                   //Create fire register record
                   fire_register_manager.createRecord({
                     id : staff.data._id,
                     forenames : staff.data.forenames,
                     surname : staff.data.surname,
                     type : 'staff',
                     loc : req.params.location,
                     io : 0
                   }, (record) => {
                     if (record.message !== 'SUCCESS') {
                       console.log("Log: " + utils.date() + " " + utils.time() + " Something went wrong trying to sign " + student.data.forenames + " " + student.data.surname + " in on fire register.");
                       req.flash('error', "Something went wrong trying to sign your in. Please try again.");
                     }
                     //Create new register record
                     register_manager.createRecord({
                       id : staff.data._id,
                       forenames : staff.data.forenames,
                       surname : staff.data.surname,
                       type : 'staff',
                       location : req.params.location,
                       io : 0
                     }, (record) => {
                       if (record.message === 'SUCCESS') {
                         console.log("Log: " + utils.date() + " " + utils.time() + " " + req.params.location.toUpperCase() + " | " + staff.data.forenames + ' ' + staff.data.surname + " was signed in.");
                         req.flash('success', staff.data.fullName + " was signed in!")
                       } else {
                         console.log("Log: " + utils.date() + " " + utils.time() + " Something went wrong trying to sign " + staff.data.forenames + " " + staff.data.surname + " in");
                         req.flash('error', "Something went wrong trying to sign your in. Please try again.");
                       }
                       res.redirect('/reg/' + req.params.location);
                     })
                   })
                 }
               })
             }else{
               console.log("Log: " + utils.date() + " " + utils.time() + " " + req.params.location.toUpperCase() + " | User tried to enter ID: " + req.body.scanID);
               req.flash('error', "ID: " + req.body.scanID + " doesn't exist. Please contact admin.")
               res.redirect('/reg/' + req.params.location);
             }
           })
         }
       })
     }
   }
 });

 // Export Routes
 module.exports = router;
