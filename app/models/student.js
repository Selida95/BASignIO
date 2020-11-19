//student.js
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var student = new Schema({
	_id: {type: Number, required: true},
	cardID: {type: Number, required: true},
	surname: {type: String, required: true},
	forenames: {type: String, required: true},
	tutorGrp: {type: String},
	house: {type: String},
	yearGroup: {type: Number, required: true},
	manualCount: {type: Number}
});

student.virtual('fullName').get(function () {
  return this.forenames + ' ' + this.surname;
});


// the schema is useless so far
// we need to create a model using it
var Student = mongoose.model('Student', student);

// make this available to our users in our Node applications
module.exports = Student;