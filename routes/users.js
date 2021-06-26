const express = require('express');
const router = express.Router();
const {isloggedin, errorHandler} = require("../middleware/index");
const {sendMail,getHistory,getFuture} = require("../controllers/user")
/* GET users listing. */
router.post('/sendMail',isloggedin,errorHandler(sendMail));
router.get('/',isloggedin,errorHandler(getFuture));
router.get('/history',isloggedin,errorHandler(getHistory));

module.exports = router;
