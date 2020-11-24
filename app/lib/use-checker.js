var reg = require('../models/fireRegister');
var stu = require('../models/student');

exports.stuCheck = function(callback){
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
					callback(stud);
				}
			})
		})
		if (mStu.length > 0) {
			console.log(mStu);
		}
	})
}