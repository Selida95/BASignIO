const crypto = require('crypto');

var account = require('../models/accounts.js');

const config = require('../config')

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
