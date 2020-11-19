//fireRegister.js
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var fRegister = new Schema({
	_id: {type: Number, required: true},
	surname: {type: String, required: true},
	forenames: {type: String, required: true},
	yearGroup: {type: Number},
	tutorGrp: {type: String},
	staffType: {type: String},
	type: {type: String, required: true},
	loc: {type: String, required: true},
	timeIn: { type: String },
	timeOut: { type: String },
	io: {type: Number},
	date: {type: String}
});

fRegister.virtual('fullName').get(function () {
  return this.forenames + ' ' + this.surname;
});

var fireRegister = mongoose.model('fireRegister', fRegister);


// make this available to our users in our Node applications
module.exports = fireRegister;