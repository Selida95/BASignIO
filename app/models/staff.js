//staff.js
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var staff = new Schema({
	_id: {type: Number, required: true},
	cardID: {type: Number, required: true},
	cardID2: {type: Number},
	surname: {type: String, required: true},
	forenames: {type: String, required: true},
	staffType: {type: String, required: true},
	department: {type: String, required: true}
});

// the schema is useless so far
// we need to create a model using it
var Staff = mongoose.model('Staff', staff);

// make this available to our users in our Node applications
module.exports = Staff;
