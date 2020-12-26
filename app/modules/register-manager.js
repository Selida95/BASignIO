/*
 * ---------------------------
 * BASignIO: Register Manager
 * ---------------------------
 */

 // Dependencies
 const ObjectID = require('mongodb').ObjectID
 const utils = require('./utilities')

 // Database Models
 const registerModel = require('../models/register')

 // Define manager object
 let manager = {}

 // Create New Record
 // Required Fields: parameterObject(contains: id, surname, forenames, type, loc, io), callback
 // Optional Fields: parameterObject(contains: yearGroup, tutorGrp, timeIn, timeOut)
 manager.createNewRecord = (parameterObject, callback) => {
   let id = typeof(parseInt(parameterObject.id)) === 'number' && !isNaN(parameterObject.id) ? parseInt(parameterObject.id) : false
   let forenames = typeof(parameterObject.forenames) === 'string' && parameterObject.forenames.length > 0 ? parameterObject.forenames : false
   let surname = typeof(parameterObject.surname) === 'string' && parameterObject.surname.length > 0 ? parameterObject.surname : false
   let type = typeof(parameterObject.type) === 'string' && parameterObject.type.length > 0 ? parameterObject.type : false
   let location = typeof(parameterObject.loc) === 'string' && parameterObject.loc.length > 0 ? parameterObject.loc : false
   let io = typeof(parseInt(parameterObject.io)) === 'number' && !isNaN(parameterObject.io) ? parseInt(parameterObject.io) : false
   let timeIn = typeof(parameterObject.timeIn) === 'string' && parameterObject.timeIn.length > 0 ? parameterObject.timeIn : false
   let timeOut = typeof(parameterObject.timeOut) === 'string' && parameterObject.timeOut.length > 0 ? parameterObject.timeOut : false

   if (id && forenames && surname && type && location && typeof(parseInt(io)) === 'number') {
     let register = new registerModel({
       _id : new ObjectID(),
       id : id,
       forenames : forenames,
       surname : surname,
       type : type,
       loc : location,
       io : io,
       yearGroup : type === 'student' && typeof(parseInt(parameterObject.yearGroup)) === 'number' && isNaN(parameterObject.yearGroup) ? parseInt(parameterObject.yearGroup) : undefined,
       tutorGrp : type === 'student' && typeof(parameterObject.tutorGrp) === 'string' && parameterObject.tutorGrp.length > 0 ? parameterObject.tutorGrp : undefined,
       timeIn : timeIn ? timeIn : ' ',
       timeOut : timeOut ? timeOut : ' ',
       date : utils.date()
     }, {
       collection: 'registers',
       versionKey: false
     })

     register.save((error) => {
       if (error) throw error

       callback({ message : 'SUCCESS' })
     })
   } else {
     throw new Error('REQUIRED_FIELDS_INVALID')
   }
 }

 // Get Latest Record
 // Required Fields: parameterObject(contains: id), callback
 // Optional Fields: none
 manager.getLatestRecord = (parameterObject, callback) => {
   let id = typeof(parseInt(parameterObject.id)) === 'number' && !isNaN(parameterObject.id) ? parseInt(parameterObject.id) : false

   if (id) {
     registerModel.findOne({ id : id }, null, { sort : { timeIn : -1, date : -1 } }, (error, record) => {
       if (error) throw error

       if (record && Object.keys(record)) {
         callback({ message : 'SUCCESS', data : record })
       } else {
         callback({ message : 'NOT_FOUND' })
       }
     })
   } else {
     throw new Error('REQUIRED_FIELDS_INVALID')
   }
 }

 // Get All Records
 // Required Fields: parameterObject(If not optional fields, empty object), callback
 // Optional Fields: parameterObject(contains: date)
 manager.getAllRecords = (parameterObject, callback) => {
   let query = {}
   query.date = typeof(parameterObject.date) === 'string' && parameterObject.date.length > 0 ? parameterObject.date : false

   // If date is invalid, delete date key from query object
   if (!query.date) delete query['date']

   registerModel.find(query, (error, records) => {
     if (error) throw error

     if (records && Object.keys(records).length > 0) {
       callback({ message : 'SUCCESS', data : records })
     } else {
       callback({ message : 'NOT_FOUND' })
     }
   })
 }

 // Update Latest Record
 // Required Fields: parameterObject(contains: id, io), callback
 // Optional Fields: parameterObject(contains: timeIn, timeOut)
 manager.updateLatestRecord = (parameterObject, callback) => {
   let id = typeof(parseInt(parameterObject.id)) === 'number' && !isNaN(parameterObject.id) ? parseInt(parameterObject.id) : false
   let io = typeof(parseInt(parameterObject.io)) === 'number' && !isNaN(parameterObject.io) ? parseInt(parameterObject.io) : false
   let timeIn = typeof(parameterObject.timeIn) === 'string' && parameterObject.timeIn.length > 0 ? parameterObject.timeIn : false
   let timeOut = typeof(parameterObject.timeOut) === 'string' && parameterObject.timeOut.length > 0 ? parameterObject.timeOut : false

   if (typeof(id) === 'number' && typeof(io) === 'number') {
     manager.getLatestRecord({
       id : id
     }, (record) => {
       if (record.message === 'SUCCESS') {
         record.data.io = io
         record.data.timeIn = timeIn ? timeIn : record.data.timeIn
         record.data.timeOut = timeOut ? timeOut : 'ERROR'//record.data.timeOut
         record.data.save((error) => {
           if (error) throw error
           console.log('SUCCESS')
           callback({ message : 'SUCCESS'})
         })
       } else {
         callback({ message : 'NOT_FOUND'})
       }
     })
   } else {
     throw new Error('REQUIRED_FIELDS_INVALID')
   }
 }

 // Export module
 module.exports = manager
