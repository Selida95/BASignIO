/*
 * --------------------------------
 * BASignIO: Fire Register Manager
 * --------------------------------
 */

 // Dependencies
 const utils = require('./utilities')

 // Database Models
 const fireRegisterModel = require('../models/fireRegister')

 // Define manager object
 let manager = {}

 // Create New Record
 // Required Fields: parameterObject(contains: id, forenames, surname, type, location, io), callback
 // Optional Fields: parameterObject(contains: staffType, yearGroup, tutorGrp)
 manager.createNewRecord = (parameterObject, callback) => {
   let id = typeof(parseInt(parameterObject.id)) === 'number' && !isNaN(parameterObject.id) ? parseInt(parameterObject.id) : false
   let forenames = typeof(parameterObject.forenames) === 'string' && parameterObject.forenames.length > 0 ? parameterObject.forenames : false
   let surname = typeof(parameterObject.surname) === 'string' && parameterObject.surname.length > 0 ? parameterObject.surname : false
   let type = typeof(parameterObject.type) === 'string' && parameterObject.type.length > 0 ? parameterObject.type : false
   let location = typeof(parameterObject.loc) === 'string' && parameterObject.loc.length > 0 ? parameterObject.loc : false
   let io = typeof(parseInt(parameterObject.io)) === 'number' && !isNaN(parameterObject.io) ? parseInt(parameterObject.io) : false
   let timeIn = typeof(parameterObject.timeIn) === 'string' && parameterObject.timeIn.length > 0 ? parameterObject.timeIn : false
   let timeOut = typeof(parameterObject.timeOut) === 'string' && parameterObject.timeOut.length > 0 ? parameterObject.timeOut : false

   if (id && forenames && surname && type && location && io) {
     let register = new fireRegisterModel({
       _id : id,
       forenames : forenames,
       surname : surname,
       type : type,
       staffType : type === 'staff' && typeof(parameterObject.staffType) === 'string' && parameterObject.staffType.length > 0 ? parameterObject.staffType : undefined,
       yearGroup : type === 'student' && typeof(parseInt(parameterObject.yearGroup)) === 'number' && !isNaN(parameterObject.yearGroup) ? parseInt(parameterObject.yearGroup) : undefined,
       tutorGrp : type === 'student' && typeof(parameterObject.tutorGrp) === 'string' && parameterObject.tutorGrp.length > 0 ? parameterObject.tutorGrp : undefined,
       loc : location,
       io : io,
       timeIn : timeIn ? timeIn : '',
       timeOut : timeOut ? timeOut : '',
       date : utils.date()
     })

     register.save((error) => {
       if (error) throw error

       callback({ message : 'SUCCESS' })
     })
   } else {
     throw new Error('REQUIRED_FIELDS_INVALID')
   }
 }

 // Get All Records
 // Required Fields: parameterObject(If not optional fields, empty object), callback
 // Optional Fields: parameterObject(contains: date, io)
 manager.getAllRecords = (parameterObject, callback) => {
   let query = {}
   query.date = typeof(parameterObject.date) === 'string' && parameterObject.date.length > 0 ? parameterObject.date : false
   query.io = typeof(parseInt(parameterObject.io)) === 'number' && !isNaN(parameterObject.io) ? parseInt(parameterObject.io) : false

   // If date is invalid, delete date key from query object
   if (!query.date) delete query['date']

   // If date is invalid, delete date key from query object
   if (!query.io) delete query['io']

   fireRegisterModel.find(query, (error, records) => {
     if (error) throw error

     if (records && Object.keys(records)) {
       callback({ message : 'SUCCESS', data : records })
     } else {
       callback({ message : 'NOT_FOUND' })
     }
   })
 }

 // Get Record
 // Required Fields: parameterObject(contains: id), callback
 // Optional Fields: none
 manager.getRecord = (parameterObject, callback) => {
   let id = typeof(parseInt(parameterObject.id)) === 'number' && !isNaN(parameterObject.id) ? parseInt(parameterObject.id) : false

   fireRegisterModel.findOne({ _id : id }, (error, record) => {
     if (error) throw error

     if (record && Object.keys(record)) {
       callback({ message : 'SUCCESS', data : record})
     } else {
       callback({ message : 'NOT_FOUND' })
     }
   })
 }

 // Update Record
 // Required Fields: parameterObject(contains: id and at least one optional field), callback
 // Optional Fields: parameterObject(contains: forenames, surname, type, location, io, staffType, yearGroup, tutorGrp, timeIn, timeOut)
 manager.updateRecord = (parameterObject, callback) => {
   let id = typeof(parseInt(parameterObject.id)) === 'number' && !isNaN(parameterObject.id) ? parseInt(parameterObject.id) : false
   let forenames = typeof(parameterObject.forenames) === 'string' && parameterObject.forenames.length > 0 ? parameterObject.forenames : false
   let surname = typeof(parameterObject.surname) === 'string' && parameterObject.surname.length > 0 ? parameterObject.surname : false
   let type = typeof(parameterObject.type) === 'string' && parameterObject.type.length > 0 ? parameterObject.type : false
   let location = typeof(parameterObject.loc) === 'string' && parameterObject.loc.length > 0 ? parameterObject.loc : false
   let io = typeof(parseInt(parameterObject.io)) === 'number' && !isNaN(parameterObject.io) ? parseInt(parameterObject.io) : false
   let staffType = type === 'staff' && typeof(parameterObject.staffType) === 'string' && parameterObject.staffType.length > 0 ? parameterObject.staffType : false
   let yearGroup = type === 'student' && typeof(parseInt(parameterObject.yearGroup)) === 'number' && !isNaN(parameterObject.yearGroup) ? parseInt(parameterObject.staffType) : false
   let tutorGrp = type === 'student' && typeof(parameterObject.tutorGrp) === 'string' && parameterObject.tutorGrp.length > 0 ? parameterObject.tutorGrp : false
   let timeIn = typeof(parameterObject.timeIn) === 'string' && parameterObject.timeIn.length > 0 ? parameterObject.timeIn : false
   let timeOut = typeof(parameterObject.timeOut) === 'string' && parameterObject.timeOut.length > 0 ? parameterObject.timeOut : false

   console.log(`io : ${io}`)

   if (id && (forenames || surname || type || location || io || staffType || yearGroup || tutorGrp || timeIn || timeOut)) {
     try {
       manager.getRecord({
         id : id
       }, (record) => {
         record.data.forenames = forenames ? forenames : record.data.forenames
         record.data.surname = surname ? surname : record.data.surname
         record.data.type = type ? type : record.data.type
         record.data.loc = location ? location : record.data.loc
         record.data.io = typeof(io) === 'number' ? io : record.data.io
         record.data.staffType = staffType ? staffType : record.data.staffType
         record.data.yearGroup = yearGroup ? yearGroup : record.data.yearGroup
         record.data.tutorGrp = tutorGrp ? tutorGrp : record.data.tutorGrp
         record.data.timeIn = timeIn ? timeIn : record.data.timeIn
         record.data.timeOut = timeOut ? timeOut : record.data.timeIn
         record.data.date = utils.date()

         record.data.save((error) => {
           if (error) throw error

           callback({ message : 'SUCCESS' })
         })
       })
     } catch (e) {
       throw e
     }
   } else {
     throw new Error('REQUIRED_FIELDS_INVALID')
   }
 }

 // Export module
 module.exports = manager
