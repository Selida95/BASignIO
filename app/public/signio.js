var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/basignio2', {
	useMongoClient: true
});

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){
	console.log('Connected to Database...')
});

var reg = require('../models/fireRegister');
var stu = require('../models/student');

var stuID = new Array();
var mStu = new Array();

stu.find({}, function(err, student){
	student.forEach(function(stud){
		stuID.push(stud._id);

		reg.find({_id: stud._id}, function(err, doc){
			if (err) {
				console.log(err);
			}
			if (doc.length == 0) {
				//console.log(stud._id + " - " +stud.forenames + " " + stud.surname + " - " + stud.yearGroup);
				mStu.push({stud._id, student.fornames, stud.surname, stud.yearGroup})
			}
		})
	})
	if (mstu.length > 0) {
		console.log(mStu);
	}
})
