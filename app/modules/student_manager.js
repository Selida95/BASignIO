/*
 * ----------------
 * Student Manager
 * ----------------
 */

 // Dependencies

 // Database Models
 const studentModel = require('../models/student');

 // Define module constructor
 var manager = {};

 // Get All Students
 // Required Fields: callback
 // Optional Fields: yearGroup, tutorGroup, house
 manager.getAllStudents = (parameterObject, callback) => {
   // Check that callback function exists and is valid
   if (callback && typeof(callback) === 'string') {
     if (())) {

     }
     studentModel.find({}, (error, students) => {
       // Handle Error
       if (error) {
         callback({ msg : error}, null);
         return;
       }

       // Return students via callback
       callback(null, { msg : "Successfully fetched students.", data : students});
     })
   } else {
     // Otherwise, return error via console
     console.error("getAllStudents: Method requires a callback function. It is currently missing or invalid.");
   }
 }

 // Get Student
 // Required Fields
 manager.getStudents = () => {

 }

 // Export Module
 module.exports = manager;
