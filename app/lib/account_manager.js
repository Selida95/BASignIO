/*
 * ---------------------------
 * BASignIO - Account Manager
 * ---------------------------
 */

 // Dependences
 const crypto = require('crypto');

 // Config
 const config = require('../config');

 // Database Models
 const accountModel = require('../models/accounts')

 // Define module object
 var manager = {}

 manager.manualLogin = (user, pass, callback) => {
	 accountModel.findOne({username: user}, (err, doc) => {
		 if (err) {
			 console.log('Error: ' + err)
		 }

		 if (doc == null) {
			 callback('user-not-found');
		 }else{
			 validatePassword(pass, doc.password, (err, validate) => {
				 if (err) {
					 console.log('Error: ' + err);
				 }
				 if (validate) {
					 callback(null, doc);
				 }else{
					 callback('invalid-password');
				 }
			 });
		 }
		 //console.log("HASH: " + pwordHash);
	 })
 }

 manager.autoLogin = (user, pass, callback) => {
	 accountModel.findOne({username:user}, (err, o) => {
 		if (o) {
 			o.password == pass ? callback(o) : callback(null);
 		}else{
 			callback(null);
 		}
 	});
 }


// --- Functions --- //
	var hash = (str) => {
		const secret = config.crypto.secret;

		const hashOut = crypto.createHmac('sha256', secret)
		                   .update(str)
		                   .digest('hex');

		return hashOut;
	}

	var validatePassword = (pass, accPass, callback) => {
		var pwordHash = hash(pass)

		if (pwordHash == accPass) {
			console.log('Password Validated!');

			callback(null, 'password-validated');
		}else{
			console.log('Incorrect Password.');

			callback('validation-failed');
		}
	}
// ----------------- //

// Export Module
module.exports = manager;
