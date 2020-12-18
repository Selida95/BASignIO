/*
 * ---------------------------
 * BASignIO: Report Generator
 * ---------------------------
 */

 // Dependencies
 const path = require('path');
 const puppeteer = require('puppeteer');
 const useChecker = require('../modules/use-checker.js');
 const config = require('../config');

 var reportGenerator = {};

 // Fire Register Report
 // Required Fields: date, callback
 // Optional Fields: location
 reportGenerator.generateFireRegisterReport = (parameterObject, callback) => {
   // Check that callback exists and is valid
   if (callback && typeof(callback) === 'function') {
     // Validate required fields
     let date = typeof(parameterObject.date) == 'string' && parameterObject.date.length > 0 ? parameterObject.date : false;

     // Check that required fields exist and are valid
     if (date) {
       // Validate optional fields
       let location = typeof(parameterObject.location) === 'string' && parameterObject.location.length > 0 ? parameterObject.location : false;
       // Check if optional fields are exists and are valid
       if (location) {
         let reportPath = path.join(__dirname, '../public/reports/', 'BASignIO-' + location + '-' + date + '.pdf');
         (async () => {
           const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
           const page = await browser.newPage();
           await page.goto("http://localhost:" + config.http.port + "/reports/pdfExport?fireReg=1&loc=" + location + "&date=" + date);
           await page.pdf({path: reportPath, format: 'A4'});
           await browser.close();
           await callback(null, {'msg' : "Successfully generated fire report.", 'path' : reportPath});
         })();
       } else {
         let reportPath = path.join(__dirname, '../public/reports/', 'BASignIO-' + date + '.pdf');
         (async () => {
   				const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
   				const page = await browser.newPage();
   				await page.goto("http://localhost:" + config.http.port + "/reports/pdfExport?fireReg=1&date=" + date);
   				await page.pdf({path: reportPath, format: 'A4'});
          await browser.close();
          await callback(null, {'msg' : "Successfully generated fire report.", 'path' : reportPath})
   			})();
       }
     } else {
       callback({'msg' : "Required fields missing or invalid."}, null);
     }
   } else {
     // Otherwise, return error via console
     console.log("generateFireRegisterReport: Requires a callback function.");
   }
 }

 // Register Report
 // Required Fields: date, callback
 // Optional Fields: location
 reportGenerator.generateRegisterReport = (parameterObject, callback) => {
   // Check that callback exists and is valid
   if (callback && typeof(callback) === 'function') {
     // Validate required fields
     let date = typeof(parameterObject.date) === 'string' && parameterObject.date.length > 0 ? parameterObject.date : false;

     // Check that required fields exist and valid
     if (date) {
       // Validate optional fields
       let location = typeof(parameterObject.location) === 'string' && parameterObject.location.length > 0 ? parameterObject.location : false;
       let reportPath
       // Check that optional fields exist and is valid
       if (location) {
         reportPath = path.join(__dirname, '../public/reports/', 'BASignIO-' + location + '-' + date + '.pdf')
         (async () => {
           const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
           const page = await browser.newPage();
           await page.goto("http://localhost:" + config.http.port + "/reports/pdfExport?loc=" + location + "&date=" + date);
           await page.pdf({path: reportPath, format: 'A4'});
           await browser.close();
         })();
       } else {
         reportPath = path.join(__dirname, '../public/reports/', 'BASignIO-' + date + '.pdf');
         (async () => {
   				const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
   				const page = await browser.newPage();
   				await page.goto("http://localhost:" + config.http.port + "/reports/pdfExport?date=" + date);
   				await page.pdf({path: reportPath, format: 'A4'});
   				await browser.close();
   			})();
       }
       callback(null, {'msg' : "Successfully generated report.", 'path' : reportPath});
     } else {
       // Otherwise, return error.
       callback({ 'msg' : "Required fields missing or invalid." }, null)
     }
   } else {
     // Otherwise return error via console
     console.log("generateRegisterReport: Callback function is required.");
   }
 }


 // Export Module
 module.exports = reportGenerator
