const express = require('express');
const router = express.Router();
const {isloggedin, errorHandler,isverifiedUser} = require("../middleware/index");
const {sendMail,getHistory,getFuture} = require("../controllers/user")




/**
 * @swagger
 * /users/sendMail:
 *   post:
 *     description: Please use postman for this route with same key
 *     parameters:
 *      - name: repeates value = (second,weekly,monthly,yearly)
 *        description: when should the mail be repeated
 *        type: string
 *        in: formData
 *      - name: repeatEvery
 *        description: How often the mail should the mail be sent in seconds
 *        type: number
 *        in: formData
 *      - name: day
 *        description: what day mail should be sent
 *        type: number
 *        in: formData
 *      - name: hour
 *        description: what hour mail should be sent
 *        type: number
 *        in: formData
 *      - name: minute
 *        description: what minute mail should be sent
 *        type: number
 *        in: formData
 *      - name: month
 *        description: what month mail should be sent
 *        type: number
 *        in: formData
 *      - name: dayofMonth
 *        description: what dayofMonth mail should be sent
 *        type: number
 *        in: formData
 *      - name: sechuledAt
 *        description: custom date to schedule the mail
 *        type: date-time
 *        in: formData
 *      - name: mailobj
 *        type: object
 *        properties:
 *            to:
 *              type: string
 *              in: formData
 *            cc:
 *              type: string
 *              in: formData
 *            subject:
 *              type: string
 *              in: formData
 *            text:
 *              type: string
 *              in: formData
 *        in: body  
 *     responses:
 *       200:
 *         description: success:true user profile has been successfully updated
 */
router.post('/sendMail',isloggedin,errorHandler(sendMail));


/**
 * @swagger
 * /users:
 *   get:
 *     description: gets the list of all the mails scheduled for the future
 *     responses:
 *       200:
 *         description: success:true Sends the list of all the mails scheduled for the future
 */
router.get('/',isloggedin,isverifiedUser,errorHandler(getFuture));

/**
 * @swagger
 * /users/history:
 *   get:
 *     description: gets the list of all the mails send till now
 *     responses:
 *       200:
 *         description: success:true Sends the list of all the mails sent till now
 */
router.get('/history',isloggedin,isverifiedUser,errorHandler(getHistory));

module.exports = router;
