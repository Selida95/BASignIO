/*
 * ----------------
 * Student Manager
 * ----------------
 */

 // Dependencies

 // Database Models
 const studentModel = require('../models/student');

 // Config
 const config = require('../config');

 // Define manager object
 var manager = {};

 // Get Student
 // Required Fields: id (Candidate Number, Card Id), callback
 // Optional Fields: None
 manager.getStudent = (student_id, callback) => {
   // Validate id
   let id = typeof(student_id) == 'string' && student_id.length > 0 ? student_id.trim() : false;

   if (id !== true) {
     throw "REQUIRED_FIELD_INVALID";
   }

   studentModel.findOne({$or : [{ '_id' : id }, { 'cardID' : id }]}, (error, student) => {
      if (error) {
        throw error;
      }

      if (Object.keys(student.length > 0)) {
        callback({ message : 'SUCCESS', data : student});
        return;
      }

      callback({ message : 'NOT_FOUND' });
      return;
   });

 }

 // Update Student
 // Required Fields: parameterObject (Must contain the id and at least one optional field to update), result variable
 // Optional Fields: cardID, forenames, surname, tutorGrp, yearGroup, manualCount
 manager.updateStudent = (parameterObject, callback) => {
   // Validate id
   let id = typeof(parameterObject.id) === 'string' && parameterObject.id.length > 0 ? parameterObject.id.trim() : false;
   if (id !== true) {
     throw "REQUIRED_FIELD_INVALID";
   }
   try {
     manager.getStudent(id, (result) => {

       if (result.message === 'NOT_FOUND') {
         callback({ message : 'NOT_FOUND' })
       }

       result.data.cardID = typeof(parameterObject.cardID) === 'string' & parameterObject.cardID.length > 0 ? parameterObject.cardID.trim() : result.data.cardID;
       result.data.forenames = typeof(parameterObject.forenames) === 'string' & parameterObject.forenames.length > 0 ? parameterObject.forenames.trim() : result.data.forenames;
       result.data.surname = typeof(parameterObject.surname) === 'string' & parameterObject.surname.length > 0 ? parameterObject.surname.trim() : result.data.surname;
       result.data.tutorGrp = typeof(parameterObject.tutorGrp) === 'string' & parameterObject.tutorGrp.length > 0 ? parameterObject.tutorGrp.trim() : result.data.tutorGrp;
       result.data.yearGroup = typeof(parameterObject.yearGroup) === 'number' & parameterObject.yearGroup.toString().length > 0 ? parameterObject.yearGroup : result.data.yearGroup;
       result.data.manualCount = typeof(parameterObject.manualCount) === 'number' & parameterObject.manualCount.toString().length > 0 ? parameterObject.manualCount : result.data.manualCount;
       result.data.save();

       callback({ message : 'SUCCESS'})
     })
   } catch (e) {
     throw e;
   }
 }

 // Increment Manual Input Counter
 // Required Fields: id, callback
 // Optional Fields: None
 manager.incrementMICounter = (id, callback) => {
   try {
     manager.getStudent(id, (results) => {
       if (results.message === 'SUCCESS') {
         let counter = results.data.manualCount + 1;
         let message;
         if (counter === config.manual_input.max_uses) {
           // Reset counter if max uses has been hit
           counter = 0;
           message = 'MAX_REACHED_RESET';
         } else {
           message = 'COUNTER_INCREMENTED';
         }
         try {
           manager.updateStudent({
             id : id,
             manualCount : counter
           }, (results) => {
             if (results.message === 'SUCCESS') {
               callback({ message : message, data : counter })
             } else {
               throw 'ERROR_INCREMENTING_COUNTER'
             }
           })
         } catch (e) {
           throw e;
         }
       }
     });
   } catch (e) {
     throw e;
   }
 }

 // Export Module
 module.exports = manager;
