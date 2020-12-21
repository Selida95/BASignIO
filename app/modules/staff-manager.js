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
   let id = typeof(parseInt(parameterObject.id)) === 'number' && !isNaN(parameterObject.id)? parseInt(parameterObject.id) : 0
   let cardID = typeof(parseInt(parameterObject.cardID)) === 'number' && !isNaN(parameterObject.cardID) ? parseInt(parameterObject.cardID) : 0
   let cardID2 = typeof(parseInt(parameterObject.cardID2)) === 'number' && !isNaN(parameterObject.cardID2) ? parseInt(parameterObject.cardID2) : 0

   // Check that at least one field is valid
   if (id || cardID || cardID2) {
     staffModel.findOne({ $or : [{ _id : id }, { cardID : cardID }, { cardID2 : cardID2 }] }, (error, staff) => {
       if (error) {
         throw error
         return
       }

       if (staff && Object.keys(staff).length > 0) {
         callback({ message : 'SUCCESS', data : staff })
       } else {
         callback({ message : 'NOT_FOUND'})
       }
     })
   } else {
     throw new Error('REQUIRED_FIELDS_INVALID')
   }
 }

 // Get All Staff
 // Required Fields: callback
 // Optional Fields: none
 manager.getAllStaff = (callback) => {
   staffModel.find({}, (error, staff) => {
     if (error) {
       throw error
       return
     }

     if (staff && Object.keys(staff).length > 0) {
       callback({ message : 'SUCCESS', data : staff})
     } else {
       callback({ message : 'NOT_FOUND' })
     }
   })
 }

 // Update Staff
 // Required Fields: parameterObject(contains: id, and at least one optional field), callback
 // Optional Fields: parameterObject(contains: cardID, cardID2, surname, forenames, staffType, department)
 manager.updateStaff = (parameterObject, callback) => {
   let id = typeof(parseInt(parameterObject.id)) === 'number' ? parseInt(parameterObject.id) : false
   let cardID = typeof(parseInt(parameterObject.cardID)) === 'number' ? parseInt(parameterObject.cardID) : false
   let cardID2 = typeof(parseInt(parameterObject.cardID2)) === 'number' ? parseInt(parameterObject.cardID2) : false
   let surname = typeof(parameterObject.surname) === 'string' && parameterObject.surname.length > 0 ? parameterObject.surname.trim() : false
   let forenames = typeof(parameterObject.forenames) === 'string' && parameterObject.forenames.length > 0 ? parameterObject.forenames.trim() : false
   let staffType = typeof(parameterObject.staffType) === 'string' && parameterObject.staffType.length > 0 ? parameterObject.staffType : false
   let department = typeof(parameterObject.department) === 'string' && parameterObject.department.length > 0 ? parameterObject.department : false

   if (id && (cardID || cardID2 || surname || forenames || staffType || department)) {
     manager.getStaff({
       id : id
     }, (staff) => {
       if (staff.message === 'SUCCESS') {
         staff.data.cardID = cardID ? cardID : staff.cardID
         staff.data.cardID2 = cardID2 ? cardID2 : staff.cardID2
         staff.data.surname = surname ? surname : staff.surname
         staff.data.forenames = forenames ? forenames : staff.forenames
         staff.data.staffType = staffType ? staffType : staff.staffType
         staff.data.department = department ? department : staff.department
         staff.data.save((error) => {
           if (error) throw error

           callback({ message : 'SUCCESS' })
         })
       } else {
         callback({ message : 'NOT_FOUND'})
       }
     })
   } else {
     throw new Error('REQUIRED_FIELDS_INVALID')
   }
 }

 // Remove Staff
 manager.removeStaff = (staff_id, callback) => {
   let id = typeof(parseInt(staff_id)) === 'number' ? parseInt(staff_id) : false

   staffModel.findOneAndRemove({ '_id' : id }, (error, removed) => {
     if (error) {
       throw error
       return
     }

     if (removed && Object.keys(removed).length > 0) {
       callback({ message : 'SUCCESS' })
     } else {
       callback({ message : 'NOT_FOUND' })
     }
   })
 }

 // Export Module
 module.exports = manager;
