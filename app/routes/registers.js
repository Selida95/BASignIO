/*
 * -----------------------------
 * BASignIO - Routes: Registers
 * -----------------------------
 */

 // Dependencies
 const router = require('express').Router();
 const moment = require('moment');
 const functions = require('../lib/functions');
 const mailer = require('../lib/email');
 const student_manager = require('../lib/student_manager');

 // Config
 const config = require('../config');

 // Database Models
 const student = require('../models/student');
 const staff = require('../models/staff');
 const register = require('../models/register');
 const fRegister = require('../models/fireRegister');

 // Global Variables
 var ObjectID = require('mongodb').ObjectID;
 var user;
 var inputFocus;


 router.get('/', (req, res, next) => {
   res.redirect('/');
 });

 router.get('/:location', (req, res, next) => {
   // Gives focus to scan ID
   inputFocus = true;

   // Clears user info
   user = '';

   res.render('registers', { title: 'BASignIO: ' + req.params.location.toUpperCase(), user: user, loc: req.params.location, inputFocus: inputFocus});
 });

 router.post('/:location', (req, res, next) => {
   // Check if scanSubmit is set
   if (req.body.scanSubmit) {
     // If scanId is empty
     if (!req.body.scanId) {
       // Print "Please scan your id"
       console.log("Log: " + functions.date() + " " + functions.time() + " " + req.params.location.toUpperCase() + " | ID wasn't scanned.");
       req.flash('error', 'Please enter/scan your id.');

       res.redirect('/reg/' + req.params.location);
     } else {
       // Remove focus from scan input
       inputFocus = false;

       // Check if student exists
       student.findOne({$or: [{'_id': req.body.scanID}, {'cardID': req.body.scanID}]}, (error, students) => {
         if (error) {
           console.error('ERROR: ' + functions.date() + " " + functions.time() + " " + req.params.location.toUpperCase() + ' | ' + err);
           req.flash('error', 'There was an error. Please contact admin.');
           res.redirect('/reg/' + req.params.location);
         }

         // If Student exists
         if (student) {
           if (config.manual_input.enabled == "true" && req.body.scanID == students._id) {
             students.manualCount = students.manualCount + 1;
             students.save();

             let msg;

             if (students.manualCount == config.manual_input.max_uses) {
               console.log("Allowance reached. Emailing and resetting.");
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
               students.manualCount = 0;
               students.save();
               msg = 'You have used all of your manual input allowance.';
             } else {
               msg = 'You have used ' + students.manualCount + '/'+ config.manual_input.max_uses + ' of your manual input allowance.';
             }
             // Get student forename and surname
             user = students;
             console.log("Log: " + functions.date() + " " + functions.time() + " " + req.params.location.toUpperCase() + " " + user.forenames + " " + user.surname +  'just scanned/entered their id. They have' + students.manualCount + '/'+ config.manual_input.max_uses + ' of their manual input allowance.');
             res.render('registers', { title: 'BASignIO: ' + req.params.location.toUpperCase(), user: user, id: students._id, inputFocus: inputFocus, warning: msg});
           } else {
             if (req.body.scanID == students._id) {
               // Manual Input was used.
               // Get student forename and surname
               user = students;
               console.log("Log: " + functions.date() + " " + functions.time() + " " + req.params.location.toUpperCase() + " " + user.forenames + " " + user.surname + " just scanned/entered their id. Manual Input was used.");
               res.render('registers', { title: 'BASignIO: ' + req.params.location.toUpperCase(), user: user, id: students._id, inputFocus: inputFocus});
             } else {
               //Get student forename and surname
               user = students;
               console.log("Log: " + functions.date() + " " + functions.time() + " " + req.params.location.toUpperCase() + " " + user.forenames + " " + user.surname + " just scanned/entered their id.");
               res.render('registers', { title: 'BASignIO: ' + req.params.location.toUpperCase(), user: user, id: students._id, inputFocus: inputFocus});
             }
           }
         } else {
           console.log("Log: " + functions.date() + " " + functions.time() + " " + req.params.location.toUpperCase() +" Scanning ID: User isn't student checking if staff member.");
           //Check if staff exists
           staff.findOne({$or: [{'_id': req.body.scanID}, {'cardID': req.body.scanID}, {'cardID2': req.body.scanID}]}, (err, staffs) => {
             //if staff exists
             if (staffs) {
               //Get staff forename and surname
               user = staffs;
               console.log("Log: " + functions.date() + " " + functions.time() + " " + req.params.location.toUpperCase() + " " + user.forenames + " " + user.surname + " just scanned/entered their id.");
               res.render('registers', { title: 'BASignIO: ' + req.params.location.toUpperCase(), user: user, id: staffs._id, inputFocus: inputFocus});
             }else{
               //if user doesn't exist.
               req.flash('error', 'Please contact admin. Your ID does not exist.');
               res.redirect('/reg/' + req.params.location);
             }
           })
         }
       })
     }
   } else if(req.body.signIn) {
     /*function myfunction() {};
     setTimeout(myfunction(), 2000);*/

     //if scanID is empty
     if (!req.body.scanID) {
       //Print("Please scan your id")
       console.log("Log: " + functions.date() + " " + functions.time() + " " + req.params.location.toUpperCase() + " | ID wasn't scanned.");
       req.flash('error', 'Please enter/scan your id.');

       res.redirect('/reg/' + req.params.location);
     //else
     }else{
       //Print('Checking ID')
       console.log("Log: " + functions.date() + " " + functions.time() + " " + req.params.location.toUpperCase() + " | Checking ID: " + req.body.scanID)
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
                   fRegister.findOneAndUpdate({'_id': req.body.scanID}, {'timeIn': functions.time(), 'timeOut': '', 'io' : 1, 'date': functions.date(), 'loc': req.params.location.toUpperCase()}, (err, update) => {
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
                     timeIn: functions.time(),
                     timeOut: '',
                     io: 1,
                     date: functions.date()
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
                   console.log("Log: " + functions.date() + " " + functions.time() + " " + exists.forenames + ' ' + exists.surname + ' was signed in!');
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
                     fRegister.findOneAndUpdate({'_id': req.body.scanID}, {'timeIn': functions.time(), 'timeOut': '', 'io' : 1, 'date': functions.date(), 'loc': req.params.location.toUpperCase()}, (err, update) => {
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
                       timeIn: functions.time(),
                       timeOut: '',
                       io: 1,
                       date: functions.date()
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
                     console.log("Log: " + functions.date() + " " + functions.time() + " " + exists.forenames + ' ' + exists.surname + " was signed in, but didn't sign out.");
                     req.flash('error', exists.forenames + ' ' + exists.surname + " was signed in, but didn't previously signout. Please do so in the future!");
                     res.redirect('/reg/' + req.params.location);
                   }else{
                     fRegister.findOneAndUpdate({'_id': req.body.scanID}, {'timeIn': functions.time(), 'timeOut': '', 'io' : 1, 'date': functions.date(), 'loc': req.params.location.toUpperCase()}, (err, update) => {
                       if (err) {
                         console.log('Error: ' + err);
                         req.flash('error', 'There was an error. Please contact admin.');
                       };
                     })
                     console.log("Log: " + functions.date() + " " + functions.time() + " " + exists.forenames + ' ' + exists.surname + " was signed in. Sign in button was press more than once.");
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
                   timeIn: functions.time(),
                   timeOut: '',
                   io: 1,
                   date: functions.date()
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
                   timeIn: functions.time(),
                   timeOut: '',
                   io: 1,
                   date: functions.date()
                 },
                 {
                   collection: 'registers',
                   versionKey: false
                 });

                 Register.save((err, Staff) => {
                   if (err) return console.error(err);
                   //console.dir(Student);
                 })


                 console.log("Log: " + functions.date() + " " + functions.time() + " " + students.forenames + ' ' + students.surname + ' was signed in!');
                 req.flash('success', students.forenames + ' ' + students.surname + ' was signed in!');
                 res.redirect('/reg/' + req.params.location);

             }
           })
         //else
         }else{
           //check if Staff exists
           staff.findOne({'_id': req.body.scanID}, (err, staffs) => {
             //if Staff exists
             if(staffs){
               //Check if Staff exists on the fire register
               fRegister.findOne({'_id': req.body.scanID}, (err, exists) => {
                 //if student exists on fire register
                 if(exists){
                   //Check if Staff was signed out
                     //if user was signed out
                     if (exists.io == 0) {
                       //Update fire register with new timeIn and location
                       fRegister.findOneAndUpdate({'_id': req.body.scanID}, {'timeIn': functions.time(), 'timeOut': '', 'io' : 1, 'date': functions.date(), 'loc': req.params.location.toUpperCase()}, (err, update) => {
                         if (err) {console.log('Error: ' + err)};
                       })
                       //Create new register record with timeIn and location
                       var Register = new register({
                         _id: new ObjectID(),
                           id: req.body.scanID,
                         surname: exists.surname,
                         forenames: exists.forenames,
                         type: 'staff',
                         loc: req.params.location.toUpperCase(),
                         timeIn: functions.time(),
                         timeOut: '',
                         io: 1,
                         date: functions.date()
                       },
                       {
                         collection: 'registers',
                         versionKey: false
                       });
                       Register.save((err, Staff) => {
                         if (err) return console.error(err);
                         //console.dir(Staff);
                       })
                       //Print('Staff was signed in!')
                       console.log("Log: " + functions.date() + " " + functions.time() + " " + exists.forenames + ' ' + exists.surname + ' was signed in!');
                       req.flash('success', exists.forenames + ' ' + exists.surname + ' was signed in!');
                       res.redirect('/reg/' + req.params.location);

                     //else
                     }else{
                       //Check if signin button was pressed twice
                       var currentTime = moment()
                       var lastTime = moment(exists.timeIn, 'HH:mm:ss')
                       var diffTime = currentTime.diff(lastTime, 'seconds');

                       //if (diffTime > 60) {
                         //Update fire register with new timeIn and location
                         fRegister.findOneAndUpdate({'_id': req.body.scanID}, {'timeIn': functions.time(), 'timeOut': '', 'io' : 1, 'date': functions.date(), 'loc': req.params.location.toUpperCase()}, (err, update) => {
                           if (err) {
                             console.log('Error: ' + err);
                             req.flash('error', 'There was an error. Please contact admin.');
                           };
                         })
                         //Update last register record with 'N/A' for timeOut
                         register.findOneAndUpdate({'id': req.body.scanID, 'io' : 1}, {'timeOut': 'N/A', 'io' : 0}, { sort: { 'timeIn' : -1, 'date' : -1} }, (err, doc) =>{
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
                           type: 'staff',
                           loc: req.params.location.toUpperCase(),
                           timeIn: functions.time(),
                           timeOut: '',
                           io: 1,
                           date: functions.date()
                         },
                         {
                           collection: 'registers',
                           versionKey: false
                         });
                         Register.save((err, Staff) => {
                           if (err) return console.error(err);
                           //console.dir(Staff);
                         })
                         //Print('Staff was signed in, but didn't sign out. Please do so in the future.')
                         console.log("Log: " + functions.date() + " " + functions.time() + " " + exists.forenames + ' ' + exists.surname + " was signed in, but didn't sign out.");
                         req.flash('error', exists.forenames + ' ' + exists.surname + " was signed in, but didn't previously signout. Please do so in the future!");
                         res.redirect('/reg/' + req.params.location);
                       /*}else{

                         console.log("Log: " + functions.date() + " " + functions.time() + " " + exists.forenames + ' ' + exists.surname + " was signed in. Sign in button was press more than once.");
                         req.flash('success', exists.forenames + ' ' + exists.surname + ' was signed in! But you dont\'t need to spam the button.');

                         res.redirect('/reg/' + req.params.location);
                       }*/
                     }
                 //else, Staff doesn't exist on the fire register
                 }else{

                   staff.findOne({'_id': req.body.scanID}, (err, exists) => {
                   //Create fire register record with current date and timeIn and location
                     var fireRegister = new fRegister({
                       _id: req.body.scanID,
                       surname: exists.surname,
                       forenames: exists.forenames,
                       staffType: staffs.staffType,
                       type: 'staff',
                       loc: req.params.location.toUpperCase(),
                       timeIn: functions.time(),
                       timeOut: '',
                       io: 1,
                       date: functions.date()
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
                       surname: exists.surname,
                       forenames: exists.forenames,
                       type: 'staff',
                       loc: req.params.location.toUpperCase(),
                       timeIn: functions.time(),
                       timeOut: '',
                       io: 1,
                       date: functions.date()
                     },
                     {
                       collection: 'registers',
                       versionKey: false
                     });

                     Register.save((err, Staff) => {
                       if (err) return console.error(err);
                       //console.dir(Student);
                     })
                     console.log("Log: " + functions.date() + " " + functions.time() + " " + req.params.location.toUpperCase() + " | " + staffs.forenames + ' ' + staff.surname + " was signed in.");
                     req.flash('success', staffs.fullName + " was signed in!")
                     res.redirect('/reg/' + req.params.location);
                     })
                 }
               })
             }else{
               console.log("Log: " + functions.date() + " " + functions.time() + " " + req.params.location.toUpperCase() + " | User tried to enter ID: " + req.body.scanID);
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
       console.log("Log: " + functions.date() + " " + functions.time() + " " + req.params.location.toUpperCase() + " | ID wasn't scanned.");
       req.flash('error', 'Please enter/scan your id.');

       res.redirect('/reg/' + req.params.location);
     //else
     }else{
       //Print('Checking ID')
       console.log("Log: " + functions.date() + " " + functions.time() + " " + req.params.location.toUpperCase() + " | Checking ID: " + req.body.scanID)
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
                   fRegister.findOneAndUpdate({'_id': req.body.scanID}, {'timeOut': functions.time(), 'io': 0}, (err, update) => {
                     if (err) {
                       console.log('Error: ' + err);
                       req.flash('error', 'There was an error. Please contact admin.');
                     };
                   })
                   //Update register record with timeOut
                   register.findOneAndUpdate({'id': req.body.scanID, 'io' : 1}, {'timeOut': functions.time(), 'io' : 0}, { sort: { 'timeIn' : -1, 'date' : -1} }, (err, doc) => {
                     if (err) {
                       console.error('Error: ' + err);
                       req.flash('error', 'There was an error. Please contact admin.');
                     };
                   })
                   //Print('Student was signed out')
                   console.log("Log: " + functions.date() + " " + functions.time() + " " + req.params.location.toUpperCase() + " | " + exists.forenames + ' ' + exists.surname + " was signed out.");
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
                     fRegister.findOneAndUpdate({'_id': req.body.scanID}, {'timeIn': 'N/A','timeOut': functions.time(), 'io' : 0, 'date': functions.date(), 'loc': req.params.location.toUpperCase()}, (err, update) => {
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
                       timeOut: functions.time(),
                       io: 0,
                       date: functions.date()
                     },
                     {
                       collection: 'registers',
                       versionKey: false
                     });

                     Register.save((err, Student) => {
                       if (err) return console.error('Error @ ' + functions.time() + ' : ' + err);
                       //console.dir(Student);
                     })

                     //Print('Student was signed out, but didn't sign in)
                     console.log("Log: " + functions.date() + " " + functions.time() + " " + req.params.location.toUpperCase() + " | " + exists.forenames + ' ' + exists.surname + " was signed out, but didn't sign in.");
                     req.flash('error', exists.fullName + " was signed out, but didn't sign in. Please do so in the future!")
                     res.redirect('/reg/' + req.params.location);
                   }else{

                     console.log("Log: " + functions.date() + " " + functions.time() + " " + req.params.location.toUpperCase() + " | " + exists.forenames + ' ' + exists.surname + " was signed out. Sign Out button was press more than once.");
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
                 timeOut: functions.time(),
                 io: 1,
                 date: functions.date()
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
                 timeOut: functions.time(),
                 io: 0,
                 date: functions.date()
               },
               {
                 collection: 'registers',
                 versionKey: false
               });

               Register.save((err, Student) => {
                 if (err) return console.error('Error @ ' + functions.time() + ' : ' + err);
                 //console.dir(Student);
               })

               //Print('Student was signed out, but didn't sign in)
               console.log("Log: " + functions.date() + " " + functions.time() + " " + req.params.location.toUpperCase() + " | " + students.forenames + ' ' + students.surname + " was signed!");
               req.flash('error', students.fullName + " was signed out!")
               res.redirect('/reg/' + req.params.location);
             }
           })
         //else
         }else{
           //Check if user is staff
           staff.findOne({'_id': req.body.scanID}, (err, staffs) => {
             //if staff exists
             if (staffs) {
               //Check if staff exists on the fire register
               fRegister.findOne({'_id': req.body.scanID}, (err, exists) => {
                 //if staff exists on the fire register
                 if (exists) {
                   //Check if staff was signed in
                     //if staff was signed in
                     if(exists.io == 1){
                       //Update fire register with timeOut
                       fRegister.findOneAndUpdate({'_id': req.body.scanID}, {'timeOut': functions.time(), 'io' : 0, 'date': functions.date(), 'loc': req.params.location.toUpperCase()}, (err, update) => {
                         if (err) {
                           console.log('Error: ' + err);
                           req.flash('error', 'There was an error. Please contact admin.');
                         };

                       })
                       //Update register record with timeOut
                       register.findOneAndUpdate({'id': req.body.scanID, 'io' : 1}, {'timeOut': functions.time(), 'io' : 0}, { sort: { 'timeIn' : -1, 'date' : -1} }, (err, doc) => {
                         if (err) {
                           console.error('Error: ' + err);
                           req.flash('error', 'There was an error. Please contact admin.');
                         };

                       })
                       //Print('Staff was signed out')
                       console.log("Log: " + functions.date() + " " + functions.time() + " " + req.params.location.toUpperCase() + " | " + exists.forenames + ' ' + exists.surname + " was signed out.");
                       req.flash('success', exists.fullName + ' was signed out.')
                       res.redirect('/reg/' + req.params.location);
                     //else
                     }else{
                       //Check if signout button was pressed twice
                       var currentTime = moment()
                       var lastTime = moment(exists.timeOut, 'HH:mm:ss');
                       var diffTime = currentTime.diff(lastTime, 'seconds');

                       //if (diffTime > 60) {
                         //Update fire register with timeIn as 'N/A', new timeOut and new location
                         fRegister.findOneAndUpdate({'_id': req.body.scanID}, {'timeIn': 'N/A', 'timeOut': functions.time(), 'io' : 0, 'date': functions.date(), 'loc': req.params.location.toUpperCase()}, (err, update) => {
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
                           type: 'staff',
                           loc: req.params.location.toUpperCase(),
                           timeIn: 'N/A',
                           timeOut: functions.time(),
                           io: 0,
                           date: functions.date()
                         },
                         {
                           collection: 'registers',
                           versionKey: false
                         });

                         Register.save((err, Student) => {
                           if (err) return console.error('Error @ ' + functions.time() + ' : ' + err);
                           //console.dir(Student);
                         })

                         //Print('Staff was signed out, But didn't sign in)
                         console.log("Log: " + functions.date() + " " + functions.time() + " " + req.params.location.toUpperCase() + " | " + exists.forenames + ' ' + exists.surname + " was signed out, but didn't sign in.");
                         req.flash('error', exists.fullName + " was signed out, but didn't sign in. Please do so in the future!")
                         res.redirect('/reg/' + req.params.location);
                       /*}else{
                         console.log("Log: " + functions.date() + " " + functions.time() + " " + req.params.location.toUpperCase() + " | " + exists.forenames + ' ' + exists.surname + " was signed out. Sign Out button was press more than once.");
                         req.flash('success', exists.fullName + ' was signed out. But you dont\'t need to spam the button.')

                         res.redirect('/reg/' + req.params.location);
                       }*/

                     }
                 //else; staff doesn't exist on the fire register
                 }else{
                   //Create fire register record with current date and timeIn and location
                   var fireRegister = new fRegister({
                     _id: req.body.scanID,
                     surname: staffs.surname,
                     forenames: staffs.forenames,
                     staffType: staffs.staffType,
                     type: 'staff',
                     loc: req.params.location.toUpperCase(),
                     timeIn: 'N/A',
                     timeOut: functions.time(),
                     io: 0,
                     date: functions.date()
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
                     surname: staffs.surname,
                     forenames: staffs.forenames,
                     type: 'staff',
                     loc: req.params.location.toUpperCase(),
                     timeIn: 'N/A',
                     timeOut: functions.time(),
                     io: 0,
                     date: functions.date()
                   },
                   {
                     collection: 'registers',
                     versionKey: false
                   });

                   Register.save((err, Staff) => {
                     if (err) return console.error('Error @ ' + functions.time() + ' : ' + err);
                     //console.dir(Staff);
                   })

                   //Print('Staff was signed out, But didn't sign in)
                   console.log("Log: " + functions.date() + " " + functions.time() + " " + req.params.location.toUpperCase() + " | " + staffs.forenames + ' ' + staff.surname + " was signed out.");
                   req.flash('error', staffs.fullName + " was signed out!")
                   res.redirect('/reg/' + req.params.location);
                 }
               })
             }else{
               console.log("Log: " + functions.date() + " " + functions.time() + " " + req.params.location.toUpperCase() + " | User tried to enter ID: " + req.body.scanID);
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
