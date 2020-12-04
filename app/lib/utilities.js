/*
 * -----------------------------
 * BASignIO - Utility Functions
 * -----------------------------
 */

 // Dependencies
 const moment = require('moment')

 // Define module object
 var lib = {}

 lib.time = () => {
   return moment().format('HH:mm:ss')
 }

 lib.date = () => {
   return moment().format('DD-MM-YYYY')
 }

 // Export Module
 module.exports = lib
