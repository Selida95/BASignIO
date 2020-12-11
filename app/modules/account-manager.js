/*
 * --------------------------
 * BASignIO: Account Manager
 * --------------------------
 */

 // Dependencies
 const crypto = require('crypto');

 // Database Models
 const accountModel = require('../models/accounts.js');

 // Config
 const config = require('../config')

 // Define Manager Object
 let manager = {}

 // Create New User
 // Required Fields: parameterObject (contains: username, email, password), callback
 // Optional Fields: parameterObject (contains: firstName, lastName, role)
 manager.createNewUser = (parameterObject, callback) => {
	 let username = typeof(parameterObject.username) === 'string' && parameterObject.username.length > 0 ? parameterObject.username.trim() : false;
	 let email = typeof(parameterObject.email) === 'string' && parameterObject.email.length > 0 ? parameterObject.email.trim() : false;
	 let password = typeof(parameterObject.password) === 'string' && parameterObject.password.length > 0 ? parameterObject.password.trim() : false;

	 if (username && email && password) {
		 let account = new accountModel({
			 username : username,
			 email : email,
			 password : manager.hash(password),
			 firstName : typeof(parameterObject.firstName) === 'string' && parameterObject.firstName.length > 0 ? parameterObject.firstName.trim() : '',
			 lastName : typeof(parameterObject.lastName) === 'string' && parameterObject.lastName.length > 0 ? parameterObject.lastName.trim() : '',
			 role : typeof(parameterObject.role) === 'string' && parameterObject.role.length > 0 && parameterObject.role.toLowerCase() === 'admin' ? 'admin' : 'user'
		 })

		 account.save((error) => {
			 if (error) throw error;

			 callback({ message : 'SUCCESS' });
		 })
	 } else {
		 throw new Error('REQUIRED_FIELD_INVALID')
	 }
 }

 // Get Users
 // Required Fields: id, callback
 // Optional Fields: None
 manager.getUser = (id, callback) => {
	 
 }

 // Export module
 module.exports = manager;

// --- Exports --- //

exports.manualLogin = function(user, pass, callback){
	account.findOne({username: user}, function(err, doc){
		if (err) {
			console.log('Error: ' + err)
		}

		if (doc == null) {
			callback('user-not-found');
		}else{
			validatePassword(pass, doc.password, function(err, validate){
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


exports.autoLogin = function(user, pass, callback){
	account.findOne({username:user}, function(err, o){
		if (o) {
			o.password == pass ? callback(o) : callback(null);
		}else{
			callback(null);
		}
	});
}

// --------------- //


// --- Functions --- //
	var hash = function(str){
		const secret = config.crypto.secret;

		const hashOut = crypto.createHmac('sha256', secret)
		                   .update(str)
		                   .digest('hex');

		return hashOut;
	}

	var validatePassword = function(pass, accPass, callback){
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
