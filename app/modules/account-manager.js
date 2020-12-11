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
 // Required Fields: parameterObject(containing at least one optional field), callback
 // Optional Fields: id, username
 manager.getUser = (parameterObject, callback) => {
	 let id = typeof(parameterObject.id) === 'string' && parameterObject.id.length > 0 ? parameterObject.id.trim() : null
	 let username = typeof(parameterObject.username) === 'string' && parameterObject.username.length > 0 ? parameterObject.username.trim() : null

	 if (id || username) {
		 accountModel.findOne({$or : [{ _id : id }, { username : username }]}, (error, account) => {
			 if (error) throw error;

			 if (account && Object.keys(account).length > 0) {
				 callback({ message : 'SUCCESS', data : account })
			 } else {
				 callback({ message : 'NOT_FOUND' })
			 }
		 })
	 } else {
		 throw new Error('REQUIRED_FIELD_INVALID')
	 }
 }

 // Update User
 // Required Fields: parameterObject(Contains: id and at least one optional field), callback
 // Optional Fields: username, email, firstName, lastName, password, role
 manager.updateUser = (parameterObject, callback) => {
	 let id = typeof(parameterObject.id) === 'string' && parameterObject.id.length > 0 ? parameterObject.id : false

	 if (id) {
		 try {
			 manager.getUser({ id : id }, (user) => {
				 if (user.message === 'SUCCESS') {
					 user.data.username = typeof(parameterObject.username) === 'string' && parameterObject.username.length > 0 ? parameterObject.username : user.data.username;
					 user.data.email = typeof(parameterObject.email) === 'string' && parameterObject.email.length > 0 ? parameterObject.email : user.data.email;
					 user.data.firstName = typeof(parameterObject.firstName) === 'string' && parameterObject.firstName.length > 0 ? parameterObject.firstName : user.data.firstName;
					 user.data.lastName = typeof(parameterObject.lastName) === 'string' && parameterObject.lastName.length > 0 ? parameterObject.lastName : user.data.lastName;
					 user.data.password = typeof(parameterObject.password) === 'string' && parameterObject.password.length > 0 ? manager.hash(parameterObject.pasword) : user.data.password;
					 user.data.role = typeof(parameterObject.role) === 'string' && parameterObject.role.length > 0 ? parameterObject.role : user.data.role;

					 user.data.save((error) => {
						 if (error) throw error;

						 callback({ message : 'SUCCESS'})
					 })
				 } else {
					 callback({ message : 'NOT_FOUND' })
				 }
			 })
		 } catch (e) {
			 throw e
		 }
	 } else {
		 throw new Error('REQUIRED_FIELD_INVALID')
	 }
 }

 // Authenticate
 // Required Fields: parameterObject(containing: username, password), callback
 // Optional Fields: None
 manager.authenticate = (parameterObject, callback) => {
	 let username = typeof(parameterObject.username) === 'string' && parameterObject.username.length > 0 ? parameterObject.username.trim() : false;
	 let password = typeof(parameterObject.password) === 'string' && parameterObject.password.length > 0 ? manager.hash(parameterObject.password) : false;

	 if (username && password) {
		 try {
			 manager.getUser({ username : username }, (user) => {

				 // Check that user exists
				 if (user.message === 'SUCCESS') {
					 // Check if password is correct
					 if (password == user.data.password) {
						 callback({ message : 'AUTHENTICATED', data : user.data })
					 } else {
						 callback({ message : 'INVALID_PASSWORD' })
					 }
				 } else {
					 callback({ message : 'NOT_FOUND' })
				 }
			 })
		 } catch (e) {
			 throw e
		 }
	 } else {
		 throw new Error('REQUIRED_FIELD_INVALID')
	 }
 }

 // Hash
 // Required Fields: String
 // Optional Fields: None
 manager.hash = (string) => {
	 return crypto.createHmac('sha256', config.crypto.secret)
											.update(string)
											.digest('hex');
 }

 // Export module
 module.exports = manager;
