/*
 * ----------------------------
 * BASignIO - Staff Manager
 * ----------------------------
 */

 // Dependencies

 // Database Models
 const staffModel = require('../models/staff');

 // Config
 const config = require('../config');

 // Define manager object
 var manager = {};

 // Get Staff
 // Required Fields: id (Staff ID Number, Card Id), callback
 // Optional Fields: None
 manager.getStaff = (staff_id, callback) => {
   // Validate id
   let id = typeof(staff_id) == 'string' && staff_id.length > 0 ? staff_id.trim() : false;

   if (id !== true) {
     throw "REQUIRED_FIELD_INVALID";
   }

   staffModel.findOne({$or : [{ '_id' : id }, { 'cardID' : id }, { 'cardID2' : id }]}, (error, staff) => {
      if (error) {
        throw error;
      }

      if (Object.keys(staff.length > 0)) {
        callback({ message : 'SUCCESS', data : staff});
        return;
      }

      callback({ message : 'NOT_FOUND' });
      return;
   });

 }

 // Update Staff
 // Required Fields: parameterObject (Must contain the id and at least one optional field to update), result variable
 // Optional Fields: cardID, forenames, surname
 manager.updateStaff = (parameterObject, callback) => {
   // Validate id
   let id = typeof(parameterObject.id) === 'string' && parameterObject.id.length > 0 ? parameterObject.id.trim() : false;
   if (id !== true) {
     throw "REQUIRED_FIELD_INVALID";
   }
   try {
     manager.getStaff(id, (result) => {

       if (result.message === 'NOT_FOUND') {
         callback({ message : 'NOT_FOUND' })
       }

       result.data.cardID = typeof(parameterObject.cardID) === 'string' & parameterObject.cardID.length > 0 ? parameterObject.cardID.trim() : result.data.cardID;
       result.data.forenames = typeof(parameterObject.forenames) === 'string' & parameterObject.forenames.length > 0 ? parameterObject.forenames.trim() : result.data.forenames;
       result.data.surname = typeof(parameterObject.surname) === 'string' & parameterObject.surname.length > 0 ? parameterObject.surname.trim() : result.data.surname;
       result.data.save();

       callback({ message : 'SUCCESS'})
     })
   } catch (e) {
     throw e;
   }
 }

 // Export Module
 module.exports = manager;
