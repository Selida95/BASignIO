/*
 * ---------------------------------
 * BASignIO - Fire Register Manager
 * ---------------------------------
 */

 // Dependencies
 const utils = require('./utilities')
 const ObjectID = require('mongodb').ObjectID;

 // Database models
 const fire_register = require('../models/fireRegister')

 // Config
 const config = require('../config');

 // Define manager object
 var manager = {}

 // Create Record
 // Required Fields:
 // Optional Fields:
 manager.createRecord = (parameterObject, callback) => {

   console.log(typeof(parameterObject.id) === 'string')
   console.log(parameterObject.id.length > 0)
   console.log(typeof(parameterObject.id) === 'string' && parameterObject.id.length > 0)

   // Validate required fields
   let id = typeof(parseInt(parameterObject.id)) === 'number' && parameterObject.id.toString().length > 0 ? parseInt(parameterObject.id) : false;
   let forenames = typeof(parameterObject.forenames) === 'string' && parameterObject.forenames.length > 0  ? parameterObject.forenames : false
   let surname = typeof(parameterObject.surname) === 'string' && parameterObject.surname.length > 0  ? parameterObject.surname : false
   let type = typeof(parameterObject.type) === 'string' && parameterObject.type.toLowerCase() == 'student' || parameterObject.type.toLowerCase() == 'staff' ? parameterObject.type.toLowerCase() : false
   let location = typeof(parameterObject.location) === 'string' && parameterObject.location.length > 0  ? parameterObject.location : false
   let io = typeof(parseInt(parameterObject.io)) === 'number' && parseInt(parameterObject.io) == 0 || parseInt(parameterObject.io) == 1 ? parseInt(parameterObject.io) : false

   // Validate optional field
   let yearGroup = typeof(parseInt(parameterObject.yearGroup)) === 'number' && parseInt(parameterObject.yearGroup) < 14 && parseInt(parameterObject.yearGroup) > 0 && type === 'student' ? parseInt(parameterObject.yearGroup) : undefined
   let tutorGrp = typeof(parameterObject.tutorGrp) === 'string' && parameterObject.tutorGrp.length > 0  ? parameterObject.tutorGrp : undefined

   if (id && forenames && surname && type && location && io) {
     let Register = new fire_register({
       _id: id,
       surname: surname,
       forenames: forenames,
       yearGroup: yearGroup,
       tutorGrp: tutorGrp,
       type: type,
       loc: location.toUpperCase(),
       timeIn: io === 1 ? utils.time() : 'N/A',
       timeOut: io === 0 ? utils.time() : '',
       io: io,
       date: utils.date()
     },
     {
       collection: 'fireRegisters',
       versionKey: false
     });

     Register.save((error, records) => {
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
   fire_register.findOne({ '_id' : id }, (error, record) => {
     if (error) throw error;

     if (record && Object.keys(record).length > 0) {
       callback({ message : 'SUCCESS', data : record })
     } else {
       callback({ message : 'NOT_FOUND' })
     }
   })
 }

 // Update Record
 // Required Fields: id, io (in or out) state, location, callback
 // Optional Fields: none
 manager.updateRecord = (parameterObject) => {
   // Validate required fields
   let id = typeof(parseInt(parameterObject.id)) === 'number' && parameterObject.id.toString().length > 0 ? parseInt(parameterObject.id) : false;
   let location = typeof(parameterObject.location) === 'string' && parameterObject.location.length > 0  ? parameterObject.location : false
   let io = typeof(parseInt(parameterObject.io)) === 'number' && parseInt(parameterObject.io) == 0 || parseInt(parameterObject.io) == 1 ? parseInt(parameterObject.io) : false

   console.log(id)
   console.log(location)
   console.log(io)
   console.log(id !== false && location !== false && io !== false)

   if (id !== false && location !== false && io !== false) {
     manager.getRecord(id, (record) => {
       if (record.message === 'NOT_FOUND') throw new Error('NOT_FOUND')

       record.data.timeIn = io === 1 ? utils.time() : record.data.timeIn
       record.data.timeOut = io === 0 ? utils.time() : record.data.timeOut
       record.data.date = utils.date()
       record.data.io = io
       record.data.location = location.toUpperCase()

       record.data.save()
     })
   } else {
     throw new Error('MISSING_REQUIRED_FIELDS')
   }
 }

 // Export module
 module.exports = manager;
