/*
 * ---------------------------
 * BASignIO - Routes: Reports
 * ---------------------------
 */

 // Dependencies
 const router = require('express').Router();
 const utils = require('../lib/utilities.js');

 // Database Models
 const fireRegisters = require('../models/fireRegister');
 const registers = require('../models/register');

 /*router.get('/pdfexport', (req, res) => {
 	var students = {};
 	var date = req.query.date ? req.query.date.trim() : utils.date();
 	if (req.query.fireReg == 1) {
 		if (req.query.loc) {
 			fRegisters.find({yearGroup : "7", loc: req.query.loc.toUpperCase(), io : 1}, (err, year7) => {
 				students.year7 = year7;
 				fRegisters.find({yearGroup : "8", loc: req.query.loc.toUpperCase(), io : 1, date: date}, (err, year8) => {
 					students.year8 = year8;
 					fRegisters.find({yearGroup : "9", loc: req.query.loc.toUpperCase(), io : 1, date: date}, (err, year9) => {
 						students.year9 = year9;
 						fRegisters.find({yearGroup : "10", loc: req.query.loc.toUpperCase(), io : 1, date: date}, (err, year10) => {
 							students.year10 = year10;
 							fRegisters.find({yearGroup : "11", loc: req.query.loc.toUpperCase(), io : 1, date: date}, (err, year11) => {
 								students.year11 = year11;
 								fRegisters.find({yearGroup : "12", loc: req.query.loc.toUpperCase(), io : 1, date: date}, (err, year12) => {
 									students.year12 = year12;
 									fRegisters.find({yearGroup : "13", loc: req.query.loc.toUpperCase(), io : 1, date: date}, (err, year13) => {
 										students.year13 = year13;
 										fRegisters.find({type : "staff", loc : req.query.loc.toUpperCase(), io : 1, date: date}, (err, staff) => {
 											//console.dir(students)
 											res.render('pdfExport', { title: 'BASignIO ' + req.query.loc.toUpperCase() + ': ' + date, students: students, staff: staff});
 										}).sort({surname : 1})
 									}).sort({surname : 1})
 								}).sort({surname : 1})
 							}).sort({surname : 1})
 						}).sort({surname : 1})
 					}).sort({surname : 1})
 				}).sort({surname : 1})
 			}).sort({surname : 1});
 		} else {
 			fRegisters.find({yearGroup : "7", date: date}, (err, year7) => {
 				students.year7 = year7;
 				fRegisters.find({yearGroup : "8", date: date}, (err, year8) => {
 					students.year8 = year8;
 					fRegisters.find({yearGroup : "9", date: date}, (err, year9) => {
 						students.year9 = year9;
 						fRegisters.find({yearGroup : "10", date: date}, (err, year10) => {
 							students.year10 = year10;
 							fRegisters.find({yearGroup : "11", date: date}, (err, year11) => {
 								students.year11 = year11;
 								fRegisters.find({yearGroup : "12", date: date}, (err, year12) => {
 									students.year12 = year12;
 									fRegisters.find({yearGroup : "13", date: date}, (err, year13) => {
 										students.year13 = year13;
 										fRegisters.find({type : "staff", date : date}, (err, staff) => {
 											res.render('firePdfExport', { title: 'BASignIO: ' + date, students: students, staff: staff});
 										}).sort({surname : 1})
 									}).sort({surname : 1})
 								}).sort({surname : 1})
 							}).sort({surname : 1})
 						}).sort({surname : 1})
 					}).sort({surname : 1})
 				}).sort({surname : 1})
 			}).sort({surname : 1});
 		}
 	} else {
 		if (req.query.loc) {
 			registers.find({yearGroup : "7", date: date, loc: req.query.loc}, (err, year7) => {
 				students.year7 = year7;
 				registers.find({yearGroup : "8", date: date, loc: req.query.loc}, (err, year8) => {
 					students.year8 = year8;
 					registers.find({yearGroup : "9", date: date, loc: req.query.loc}, (err, year9) => {
 						students.year9 = year9;
 						registers.find({yearGroup : "10", date: date, loc: req.query.loc}, (err, year10) => {
 							students.year10 = year10;
 							registers.find({yearGroup : "11", date: date, loc: req.query.loc}, (err, year11) => {
 								students.year11 = year11;
 								registers.find({yearGroup : "12", date: date, loc: req.query.loc}, (err, year12) => {
 									students.year12 = year12;
 									registers.find({yearGroup : "13", date: date, loc: req.query.loc}, (err, year13) => {
 										students.year13 = year13;
 										registers.find({type : "staff", date : date, loc : req.query.loc}, (err, staff) => {
 											res.render('pdfExport', { title: 'BASignIO ' + req.query.loc.toUpperCase() + ': ' + date, students: students, staff: staff});
 										}).sort({surname : 1})
 									}).sort({surname : 1})
 								}).sort({surname : 1})
 							}).sort({surname : 1})
 						}).sort({surname : 1})
 					}).sort({surname : 1})
 				}).sort({surname : 1})
 			});
 		} else {
 			registers.find({yearGroup : "7", date: date}, (err, year7) => {
 				students.year7 = year7;
 				registers.find({yearGroup : "8", date: date}, (err, year8) => {
 					students.year8 = year8;
 					registers.find({yearGroup : "9", date: date}, (err, year9) => {
 						students.year9 = year9;
 						registers.find({yearGroup : "10", date: date}, (err, year10) => {
 							students.year10 = year10;
 							registers.find({yearGroup : "11", date: date}, (err, year11) => {
 								students.year11 = year11;
 								registers.find({yearGroup : "12", date: date}, (err, year12) => {
 									students.year12 = year12;
 									registers.find({yearGroup : "13", date: date}, (err, year13) => {
 										students.year13 = year13;
 										registers.find({type : "staff", date : date}, (err, staff) => {
 											res.render('pdfExport', { title: 'BASignIO: ' + date, students: students, staff: staff});
 										}).sort({surname : 1})
 									}).sort({surname : 1})
 								}).sort({surname : 1})
 							}).sort({surname : 1})
 						}).sort({surname : 1})
 					}).sort({surname : 1})
 				}).sort({surname : 1})
 			}).sort({surname : 1});
 		}
 	}

});*/

 router.get('/pdfexport', (req, res) => {
    let date = req.query.date ? req.query.date.trim() : utils.date();
    if (req.query.fireReg) {
      if (req.query.loc) {
        fireRegisters.find({loc : req.query.loc.toUpperCase(), io : 1, date : date}, (error, register) => {
          // Handle error
          if (error) {
            console.error(error);
          }
          console.log(register)
          res.render('pdfExport', { title : 'BASignIO ' + req.query.loc.toUpperCase() + ': ' + date, register : register});
        }).sort({surname: 1});
      } else {
        fireRegisters.find({io : 1, date : date}, (error, register) => {
          res.render('pdfExport', { title : 'BASignIO: ' + date, register : register});
        }).sort({surname: 1});;
      }
    } else {
      if (req.query.loc) {
        registers.find({ loc: req.query.loc.toUpperCase(), date : date }, (error, register) => {
          res.render('pdfExport', { title : 'BASignIO ' + req.query.loc.toUpperCase() + ': ' + date, register : register});
        }).sort({surname: 1});;
      } else {
        registers.find({ date : date }, (error, register) => {
          res.render('pdfExport', { title : 'BASignIO: ' + date, register : register});
        }).sort({surname: 1});;
      }
    }
 });

 // Export Routes
 module.exports = router;
