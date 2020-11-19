//register.js
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var register = new Schema({
	_id: {type: Object, required: true},
	id: {type: Number, required: true},
	surname: {type: String, required: true},
	forenames: {type: String, required: true},
	yearGroup: {type: Number},
	type: {type: String, required: true},
	loc: {type: String, required: true},
	timeIn: { type: String },
	timeOut: { type: String },
	io: {type: Number},
	date: {type: String}
});

var Register = mongoose.model('Register', register);


// make this available to our users in our Node applications
module.exports = Register;