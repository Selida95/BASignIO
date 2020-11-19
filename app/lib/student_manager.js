/*
 * ----------------
 * Student Manager
 * ----------------
 */

 // Dependencies

 // Database Models
 const studentModel = require('../models/student');

 // Define manager object
 var manager = {};

 // Get Student
 // Required Fields: id (Candidate Number, Card Id), callback
 // Optional Fields: None
 manager.getStudent = (id, callback) => {
   // Validate id
   let id = typeof(id) == 'string' && id.length > 0 ? id.trim() : false;

   studentModel.findOne({$or : [{ '_id' : id }, { 'cardID' : id }]}, (error, student) => {
     if (error) {
       callback(error, null);
       return;
     }

     if (student) {
       callback(null, { message : 'SUCCESS', data : student});
       return;
     }

     callback(null, { message : 'NOT_FOUND' });
   });
 }

 // Export Module
 module.exports = manager;
