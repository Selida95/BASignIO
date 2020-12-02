/*
 * ---------------------------------
 * BASignIO - Fire Register Manager
 * ---------------------------------
 */

 // Dependencies
 const util = require('./utilities')
 const ObjectID = require('mongodb').ObjectID;

 // Database models
 const fire_register = require('../models/fireRegister')

 // Config
 const config = require('../config');

 // Define manager object
 var manager = {}

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
 manager.updateRecord = (parameterObject, callback) => {
   // Validate required fields
   let id = typeof(parameterObject.id) === 'string' && parameterObject.id.length > 0 ? parameterObject.id : false;
   let location = typeof(parameterObject.location) === 'string' && parameterObject.location.length > 0  ? parameterObject.location : false
   let io = typeof(parseInt(parameterObject.io)) === 'number' && parseInt(parameterObject.io) == 0 || parseInt(parameterObject.io) == 1 ? parseInt(parameterObject.io) : false

   if (id && location && io) {
     manager.getRecord(id, (record) => {
       if (record.message === 'NOT_FOUND') throw new Error('NOT_FOUND')

       record.data.timeIn = io === 1 ? util.time() : record.data.timeIn
       record.data.timeOut = io === 0 ? util.time() : record.data.timeOut
       record.data.date = util.date()
       record.data.io = io
       record.data.location = location.toUpperCase()

       record.data.save()

       callback({ message : 'SUCCESS' })
     })
   } else {
     throw new Error('MISSING_REQUIRED_FIELDS')
   }
 }

 // Export module
 module.exports = manager;
