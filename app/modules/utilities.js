/*
 * --------------------
 * BASignIO: Utilities
 * --------------------
 */

 // Dependencies
 const moment = require('moment');

 // Define module object
 var utils = {}

 utils.time = () => {
	 return moment().format('HH:mm:ss')
 }

 utils.date = () => {
	 return moment().format('DD-MM-YYYY')
 }

module.exports = utils;
