/*
 * -------------------------
 * BASignIO - Routes: Index
 * -------------------------
 */

 // Dependencies
 const router = require('express').Router();

 router.get('/', (req, res, next) => {
   res.redirect('/admin');
 });

 // Export Routes
 module.exports = router
