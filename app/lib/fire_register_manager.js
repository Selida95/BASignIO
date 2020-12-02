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

 // Export module
 module.exports = manager;
