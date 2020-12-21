/*
 * ---------------------------
 * BASignIO: Register Manager
 * ---------------------------
 */

 // Dependencies
 const ObjectID = require('mongodb').ObjectID
 const utils = require('utilties')

 // Database Models
 const registerModel = require('../models/register')

 // Define manager object
 let manager = {}

 // Create New Record
 // Required Fields: parameterObject(contains: id, surname, forenames, type, loc, io), callback
 // Optional Fields: parameterObject(contains: yearGroup, tutorGrp)
 manager.createNewRecord = (parameterObject, callback) => {
   let id = typeof(parseInt(parameterObject.id)) === 'number' && !isNaN(parameterObject.id) ? parseInt(parameterObject.id) : false
   let forenames = typeof(parameterObject.forenames) === 'string' && parameterObject.forenames.length > 0 ? parameterObject.forenames : false
   let surname = typeof(parameterObject.surname) === 'string' && parameterObject.surname.length > 0 ? parameterObject.surname : false
   let type = typeof(parameterObject.type) === 'string' && parameterObject.type.length > 0 ? parameterObject.type : false
   let location = typeof(parameterObject.loc) === 'string' && parameterObject.loc.length > 0 ? parameterObject.loc : false
   let io = typeof(parseInt(parameterObject.io)) === 'number' && isNaN(parameterObject.io) ? parseInt(parameterObject.io) : false

   if (id && forenames && surname && type && location && io) {
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
       timeIn : io === 1 ? utils.time() : '',
       timeOut : io === 0 ? utils.time() : '',
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

 // Update Record
 // Required Fields: parameterObject(contains: id, io), callback
 // Optional Fields: none
 manager.updateRecord = (parameterObject, callback) => {
   let id = typeof(parseInt(parameterObject.id)) === 'number' && !isNaN(parameterObject.id) ? parseInt(parameterObject.id) : false
   let io = typeof(parseInt(parameterObject.io)) === 'number' && !isNaN(parameterObject.io) ? parseInt(parameterObject.io) : false

   if (id && io) {
     manager.getLatestRecord({
       id : id
     }, (record) => {
       record.data.io = io
       record.data.timeIn = record.data.io === io && io === 0 ? 'N/A' : utils.time()
       record.data.timeOut = record.data.io === io && io === 1 ? 'N/A' : utils.time()
       record.data.save((error) => {
         if (error) throw error

         callback({ message : 'SUCCESS'})
       })
     })
   } else {
     throw new Error('REQUIRED_FIELDS_INVALID')
   }
 }

 // Export module
 module.exports = manager
