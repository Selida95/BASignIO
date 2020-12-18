/*
 * ------------------------
 * BASignIO: Staff Manager
 * ------------------------
 */

 // Dependencies


 // Database models
 const staffModel = require('../models/staff')

 // Define manager object
 let manager = {}

 // Create New Staff
 // Required Fields: parameterObject (Contains: id, cardID, surname, forenames, staffType), callback
 // Optional Fields: parameterObject (Contains: cardID2, department)
 manager.createNewStaff = (parameterObject, callback) => {
   // Validate required fields
   let id = typeof(parseInt(parameterObject.id)) === 'number' ? parseInt(parameterObject.id) : false
   let cardID = typeof(parseInt(parameterObject.cardID)) === 'number' ? parseInt(parameterObject.cardID) : false
   let surname = typeof(parameterObject.surname) === 'string' && parameterObject.surname.length > 0 ? parameterObject.surname.trim() : false
   let forenames = typeof(parameterObject.forenames) === 'string' && parameterObject.forenames.length > 0 ? parameterObject.forenames.trim() : false
   let staffType = typeof(parameterObject.staffType) === 'string' && parameterObject.staffType.length > 0 ? parameterObject.staffType : false

   if (id && cardID && surname && forenames && staffType) {
     let staff = new staffModel({
       _id : id,
       cardID : cardID,
       cardID2 : typeof(parseInt(parameterObject.cardID2)) === 'number' ? parseInt(parameterObject.cardID2) : null,
       surname : surname,
       forenames : forenames,
       department : typeof(parameterObject.department) === 'string' && parameterObject.department.length > 0 ? parameterObject.department : 'N/A',
       staffType : staffType
     },{
       collection: 'staff',
       versionKey : false
     })

     staff.save((error) => {
       if (error) {
         throw error
         return
       }

       callback({ message : 'SUCCESS' })
     })

   } else {
     throw new Error('REQUIRED_FIELDS_INVALID');
   }
 }

 // Get Staff
 // Required Fields: parameterObject (contains: at least one optional field), callback
 // Optional Fields: parameterObject (contains: id, cardID, cardID2)
 manager.getStaff = (parameterObject, callback) => {
   // Validate required fields
   let id = typeof(parseInt(parameterObject.id)) === 'number' ? parseInt(parameterObject.id) : false
   let cardID = typeof(parseInt(parameterObject.cardID)) === 'number' ? parseInt(parameterObject.cardID) : false
   let cardID2 = typeof(parseInt(parameterObject.cardID2)) === 'number' ? parseInt(parameterObject.cardID2) : false

   // Check that at least one field is valid
   if (id || cardID || cardID2) {
     staffModel.findOne({ $or : [{ _id : id }, { cardID : cardID }, { cardID2 : cardID2 }] }, (error, staff) => {
       if (error) {
         throw error
       }

       if (staff && Object.keys(staff).length > 0) {
         callback({ message : 'SUCCCESS', data : staff })
       } else {
         callback({ message : 'NOT_FOUND'})
       }
     })
   } else {
     throw new Error('REQUIRED_FIELDS_INVALID')
   }
 }

 // Get All Staff

 // Update Staff

 // Remove Staff

 // Export Module
 module.exports = manager;
