const express = require('express');
const router = express.Router();
const passport = require("passport");
const {errorHandler,isloggedin,isvalidPassword,changePassword} = require("../middleware/index")
const {emailverification,resendEmail,googlelogin,postregister,getlogout,postlogin,updateProfile,putforgotPwd,putReset}  = require("../controllers/index")



/**
 * @swagger
 * /register:
 *   post:
 *     description: Registers the user in the database
 *     parameters:
 *      - name: username
 *        description: username of the user
 *        in: formData
 *        required: true
 *        type: string
 *      - name: firstName
 *        description: firstName of user
 *        in: formData
 *        type: string
 *      - name: lastName
 *        description: bio of the user
 *        type: string
 *        in: formData
 *      - name: email
 *        description: email of the user
 *        type: string
 *        in: formData
 *        required: true
 *      - name: password
 *        description: password of the user
 *        type: string
 *        required: true
 *        in: formData
 *      - name: passwordConfirmation
 *        description: passwordConfirmation of the user
 *        type: string
 *        in: formData
 *        require: true
 *     responses:
 *       200:
 *         description: success:true user has been registered successfully
 */
router.post('/register', errorHandler(postregister));

/**
 * @swagger
 * /login:
 *   post:
 *     description: Registers the user in the database
 *     parameters:
 *      - name: email
 *        description: email of the user
 *        type: string
 *        in: formData
 *        required: true
 *      - name: password
 *        description: password of the user
 *        type: string
 *        required: true
 *        in: formData
 *     responses:
 *       200:
 *         description: success:true user has been logged in successfully
 */
router.post('/login', errorHandler(postlogin));

/**
 * @swagger
 * /logout:
 *   get:
 *     description: Logs user out
 *     responses:
 *       200:
 *         description: success:true user has been logged in successfully
 */
router.get('/logout', getlogout);

/**
 * @swagger
 * /profile:
 *   put:
 *     description: Updates user profile
 *     parameters:
 *      - name: email
 *        description: email of the user
 *        type: string
 *        in: formData
 *        required: true
 *      - name: currentPassword
 *        description: currentPassword of the user
 *        type: string
 *        required: true
 *        in: formData
 *      - name: newPassword
 *        description: newPassword of the user
 *        type: string
 *        in: formData
 *      - name: passwordConfirmation
 *        description: passwordConfirmation of the user
 *        type: string
 *        in: formData
 *      - name: firstName
 *        description: firstName of the user
 *        type: string
 *        in: formData
 *      - name: lastName
 *        description: lastName of the user
 *        type: string
 *        in: formData
 *     responses:
 *       200:
 *         description: success:true user profile has been successfully updated
 */
router.put('/profile',isloggedin,errorHandler(isvalidPassword),errorHandler(changePassword),errorHandler(updateProfile));


/**
 * @swagger
 * /forgot-password:
 *   put:
 *     description: Send the mail to the user mail with link to reset the password
 *     parameters:
 *      - name: email
 *        description: email of the user
 *        type: string
 *        in: formData
 *        required: true
 *     responses:
 *       200:
 *         description: success:true Email sent to user with further instructions
 */
router.put('/forgot-password',errorHandler(putforgotPwd));

/**
 * @swagger
 * /reset/{token}:
 *   put:
 *     description: Changes user password
 *     parameters:
 *      - name: token
 *        description: token recieved in the mail
 *        type: string
 *        in: params
 *        required: true
 *      - name: password
 *        description: new password of the user
 *        type: string
 *        in: formData
 *        required: true
 *      - name: confirm
 *        description: confirm the new password of the user
 *        type: string
 *        in: formData
 *        required: true
 *     responses:
 *       200:
 *         description: success:true Password has been successfully changed
 */
router.put('/reset/:token',errorHandler(putReset));

/**
 * @swagger
 * /login/google:
 *   get:
 *     description: Takes you to the consent screen for google auth
 *     responses:
 *       200:
 *         description: success:true logged in
 */
router.get("/login/google",passport.authenticate("google",{
  scope:[        'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email']
}));



router.get("/login/google/callback",errorHandler(googlelogin));

// router.post("/auth/google",errorHandler(googlelogin))

/**
 * @swagger
 * /verify-email/{id}:
 *   get:
 *     description: Verifies user email
 *     parameters:
 *      - name: id
 *        description: token id recieved in the mail
 *        type: string
 *        in: params
 *        required: true
 *     responses:
 *       200:
 *         description: success:true Email-Id is Successfully Verified
 */
router.get("/verify-email/:id",errorHandler(emailverification));

/**
 * @swagger
 * /resend-email:
 *   get:
 *     description: Resend verification mail to the user
 *     responses:
 *       200:
 *         description: success:true Email sent to user with further instructions
 */
router.get("/resend-email",isloggedin,errorHandler(resendEmail));

router.get("/protected",isloggedin,(req,res,next)=>{
  res.send("ok")
})











module.exports = router;
