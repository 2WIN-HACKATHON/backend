const express = require('express');
const router = express.Router();
const {isloggedin, errorHandler,isverifiedUser} = require("../middleware/index");
const {sendMail,getHistory,getFuture} = require("../controllers/user")
/* GET users listing. */
router.post('/sendMail',isloggedin,isverifiedUser,errorHandler(sendMail));
router.get('/',isloggedin,isverifiedUser,errorHandler(getFuture));
router.get('/history',isloggedin,isverifiedUser,errorHandler(getHistory));

module.exports = router;
