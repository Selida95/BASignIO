/*
 * --------------------------
 * BASignIO: Student Manager
 * --------------------------
 */

 // Dependencies

 // Database Models
 const studentModel = require('../models/student');

 // Config
 const config = require('../config');

 // Define manager object
 var manager = {};

 // Create New Student
 // Require Fields: parameterObject(contains: id, cardID, forenames, surname, yearGroup), callback
 // Optional Fields: parameterObject(contains: tutorGrp, house)
 manager.createNewStudent = (parameterObject, callback) => {
   // Validate fields
   let id = typeof(parseInt(parameterObject.id)) === 'number' && !isNaN(parameterObject.id) ? parseInt(parameterObject.id) : false
   let cardID = typeof(parseInt(parameterObject.cardID)) === 'number' && !isNaN(parameterObject.cardID) ? parseInt(parameterObject.cardID) : false
   let forenames = typeof(parameterObject.forenames) === 'string' && parameterObject.forenames.length > 0 ? parameterObject.forenames.trim() : false
   let surname = typeof(parameterObject.surname) === 'string' && parameterObject.surname.length > 0 ? parameterObject.surname.trim() : false
   let yearGroup = typeof(parseInt(parameterObject.yearGroup)) === 'number' && !isNaN(parameterObject.yearGroup) ? parseInt(parameterObject.yearGroup) : false
   let tutorGrp = typeof(parseInt(parameterObject.tutorGrp)) === 'string' && parameterObject.tutorGrp.length > 0 ? parameterObject.tutorGrp.trim() : false
   let house = typeof(parameterObject.house) === 'string' && parameterObject.house.length > 0 ? parameterObject.house.trim() : false

   // Check if required fields are valid
   if (id !== false && cardID !== false && forenames, surname, yearGroup !== false) {
     let student = new studentModel({
       _id : id,
       cardID : cardID,
       forenames : forenames,
       surname : surname,
       yearGroup : yearGroup,
       tutorGrp : tutorGrp ? tutorGrp : '',
       house : house ? house : '',
       manualCount : 0
     })

     student.save((error) => {
       if (error) throw error

       callback({ message : 'SUCCESS' })
     })
   } else {
     throw new Error('REQUIRED_FIELD_INVALID')
   }
 }

 // Get Student
 // Required Fields: id (Candidate Number, Card Id), callback
 // Optional Fields: None
 manager.getStudent = (student_id, callback) => {
   // Validate id
   let id = typeof(parseInt(student_id)) === 'number' && student_id.toString().length > 0 ? parseInt(student_id) : false;

   if (!id) {
     throw new Error("REQUIRED_FIELD_INVALID");
   }

   studentModel.findOne({$or : [{ '_id' : id }, { 'cardID' : id }]}, (error, student) => {
      if (error) {
        throw error;
      }

      if (student && Object.keys(student.length > 0)) {
        callback({ message : 'SUCCESS', data : student});
        return;
      }

      callback({ message : 'NOT_FOUND' });
      return;
   });

 }


 // Get All Students
 // Required Fields: callback
 // Optional Fields: none
 manager.getAllStudents = (callback) => {
   studentModel.find({}, (error, students) => {
     if (error) throw error

     if (students && Object.keys(students).length > 0) {
       callback({ message : 'SUCCESS', data : students })
     } else {
       callback({ message : 'NOT_FOUND' })
     }
   })
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
