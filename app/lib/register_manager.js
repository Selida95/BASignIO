/*
 * ----------------------------
 * BASignIO - Register Manager
 * ----------------------------
 */

 // Dependencies
 const util = require('./utilities')
 const ObjectID = require('mongodb').ObjectID;

 // Database Models
 const register = require('../models/register');

 // Config
 const config = require('../config');

 // Define manager object
 var manager = {};

 // Create Record
 // Required Fields: parameterObject (contains: id, forenames, surname, type, location, tutorGrp, IO state), callback
 // Optional Fields: yearGroup (dependent if student or staff)
 manager.createRecord = (parameterObject, callback) => {
   // Validate required fields
   let id = typeof(parameterObject.id) === 'string' && parameterObject.id.length > 0 ? parameterObject.id : false;
   let forenames = typeof(parameterObject.forenames) === 'string' && parameterObject.forenames.length > 0  ? parameterObject.forenames : false
   let surname = typeof(parameterObject.surname) === 'string' && parameterObject.surname.length > 0  ? parameterObject.surname : false
   let type = typeof(parameterObject.type) === 'string' && parameterObject.type.toLowerCase() == 'student' || parameterObject.type.toLowerCase() == 'staff' ? parameterObject.type.toLowerCase() : false
   let location = typeof(parameterObject.location) === 'string' && parameterObject.location.length > 0  ? parameterObject.location : false
   let io = typeof(parseInt(parameterObject.io)) === 'number' && parseInt(parameterObject.io) == 0 || parseInt(parameterObject.io) == 1 ? parseInt(parameterObject.io) : false

   // Validate optional field
   let yearGroup = typeof(parseInt(parameterObject.yearGroup)) === 'number' && parseInt(parameterObject.yearGroup) < 14 && parseInt(parameterObject.yearGroup) > 0 && type === 'student' ? parseInt(parameterObject.yearGroup) : undefined
   let tutorGrp = typeof(parameterObject.tutorGrp) === 'string' && parameterObject.tutorGrp.length > 0  ? parameterObject.tutorGrp : undefined

   if (id && forenames && surname && type && location && io) {
     let Register = new register({
       _id : new ObjectID(),
       id : id,
       surname : surname,
       forenames : forenames,
       type : type,
       yearGroup : yearGroup,
       tutorGrp: tutorGrp,
       loc : location.toUpperCase(),
       timeIn : io === 1 ? utils.time() : '',
       timeOut : io === 0 ? utils.time() : '',
       io : io,
       date : utils.date()
     },
     {
       collection : 'registers',
       versionKey : false
     })

     Register.save((error, record) => {
       if (error) throw error;
       callback({ message : 'SUCCESS', data : record })
     })
   } else {
     throw new Error('MISSING_REQUIRED_FIELDS')
   }
 }

 // Get Record
 // Required Fields: id, callback
 // Optional Fields: none
 manager.getRecord = (id, callback) => {
   register.findOne({ '_id' : id }, (error, record) => {
     if (error) throw error;

     if (record && Object.keys(record).length > 0) {
       callback({ message : 'SUCCESS', data : record })
     } else {
       callback({ message : 'NOT_FOUND' })
     }
   })
 }

 // Get Latest Record
 // Required Fields: id, io, callback
 // Optional Fields: none
 manager.getLatestRecord = (id, io, callback) => {
   let id = typeof(parameterObject.id) === 'string' && parameterObject.id.length > 0 ? parameterObject.id : false;
   let io = typeof(parseInt(parameterObject.io)) === 'number' && parseInt(parameterObject.io) == 0 || parseInt(parameterObject.io) == 1 ? parseInt(parameterObject.io) : false

   if (id && io) {
     register.findOne({ '_id' : id, 'io' : io === 1 ? 0 : 1 }, { sort: { 'timeIn' : -1, 'date' : -1} }, (error, record) => {
       if (error) throw error;

       if (record && Object.keys(record).length > 0) {
         callback({ message : 'SUCCESS', data : record })
       } else {
         callback({ message : 'NOT_FOUND' })
       }
     })
   } else {
     throw new Error('MISSING_REQUIRED_FIELDS')
   }
 }

 // Update Latest Record
 // Required Fields:
 // Optional Fields:
 manager.updateLatestRecord = () => {
   // Validate required fields
   let id = typeof(parameterObject.id) === 'string' && parameterObject.id.length > 0 ? parameterObject.id : false;
   let location = typeof(parameterObject.location) === 'string' && parameterObject.location.length > 0  ? parameterObject.location : false
   let io = typeof(parseInt(parameterObject.io)) === 'number' && parseInt(parameterObject.io) == 0 || parseInt(parameterObject.io) == 1 ? parseInt(parameterObject.io) : false

   if (id && location && io) {
     manager.getLatestRecord(id, io, (record) => {
       if (record.message === 'NOT_FOUND') throw new Error('NOT_FOUND')

       record.data.timeIn = io === 1 ? util.time() : record.data.timeIn
       record.data.timeOut = io === 0 ? util.time() : record.data.timeOut
       record.data.date = util.date()
       record.data.io = io
       record.data.location = location.toUpperCase()

       record.data.save()
     })
   } else {
     throw new Error('MISSING_REQUIRED_FIELDS')
   }
 }

 // Export module
 module.exports = manager
