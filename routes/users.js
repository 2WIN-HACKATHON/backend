const express = require('express');
const router = express.Router();
const {isloggedin, errorHandler} = require("../middleware/index");
const {sendMail} = require("../controllers/user")
/* GET users listing. */
router.post('/sendMail',isloggedin,errorHandler(sendMail));

module.exports = router;
