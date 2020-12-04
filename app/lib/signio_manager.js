/*
 * --------------------------
 * BASignIO - SignIO Manager
 * --------------------------
 */

 // Dependences
 const student_manager = require('../lib/student_manager')
 const staff_manager = require('../lib/staff_manager')
 const register_manager = require('../lib/register_manager')
 const fire_register_manager = require('../lib/fire_register_manager')
 const mailer = require('../lib/email')
 const utils = require('../lib/utilities')

 // Config
 const config = require('../config')

 // Define manager object
 var manager = {}

 // Get User Data
 // Required Fields: id, location, callback
 // Optional Fields: none
 manager.getUserData = (parameterObject, callback) => {
   let id = typeof(parseInt(parameterObject.id)) === 'number' && parameterObject.id.toString().length > 0 ? parseInt(parameterObject.id) : false;
   let location = typeof(parameterObject.location) === 'string' && parameterObject.location.length > 0  ? parameterObject.location : false

   try {
     student_manager.getStudent(id, (student) => {
       // Check if id belongs to student
       if (student.message === 'SUCCESS') {
         // Check if manual input counter is enabled
         if (config.manual_input.enabled === true && parseInt(id) === student.data._id ) {
           student_manager.incrementMICounter(student.data._id, (counter) => {
             let message = 'You have used ' + counter.data + '/'+ config.manual_input.max_uses + ' of your manual input allowance.';
             if (counter.message === 'MAX_REACHED_RESET') {
               mailer.send({
                 receiver: config.manual_input.email,
                 subject: 'BASignIO: Manual Input',
                 text: students.fullName + ' has used all their manual input allowance.'
               }, (error, mail) => {
                 if (error) {
                   throw e
                 }

                 if (mail) {
                   //console.log(mail)
                 }
               })
               message = 'You have used all of your manual input allowance.';
             }
           })
           console.log("Log: " + utils.date() + " " + utils.time() + " " + location.toUpperCase() + " " + student.data.forenames + " " + student.data.surname +  'just scanned/entered their id. They have' + students.manualCount + '/'+ config.manual_input.max_uses + ' of their manual input allowance.');
           callback({ message : 'SUCCESS', data : student.data, flash_message : message })
         } else {
           if (id === student.data._id) {
             console.log("Log: " + utils.date() + " " + utils.time() + " " + location.toUpperCase() + " " + student.data.forenames + " " + student.data.surname + " just scanned/entered their id. Manual Input was used.");
             callback({ message : 'SUCCESS', data : student.data})
           } else {
             console.log("Log: " + utils.date() + " " + utils.time() + " " + location.toUpperCase() + " " + student.data.forenames + " " + student.data.surname + " just scanned/entered their id.");
             callback({ message : 'SUCCESS', data : student.data})
           }
         }
       } else {
         console.log("Log: " + utils.date() + " " + utils.time() + " " + req.params.location.toUpperCase() +" Scanning ID: User isn't student checking if staff member.");
         try {
           staff_manager.getStaff(id, (staff) => {
             if (staff.message === 'SUCCESS') {
               console.log("Log: " + utils.date() + " " + utils.time() + " " + location.toUpperCase() + " " + staff.data.forenames + " " + staff.data.surname + " just scanned/entered their id.");
               callback({ message : 'SUCCESS', data : staff.data })
             } else {
               callback({ message : 'NOT_FOUND' })
             }
           })
         } catch (e) {
           throw e
         }
       }
     })
   } catch (e) {
     throw e
   }
 }

 // Export Module
 module.exports = manager
