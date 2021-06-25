const express = require('express');
const router = express.Router();
const passport = require("passport");
const {errorHandler,isloggedin,isvalidPassword,changePassword} = require("../middleware/index")
const {emailverification,resendEmail,googlelogin,postregister,getlogout,postlogin,userprofile,updateProfile,getForgotpwd,putforgotPwd,getReset,putReset}  = require("../controllers/index")


/* post register */
router.post('/register', errorHandler(postregister));
/* post login */
router.post('/login', errorHandler(postlogin));
/* get logout */
router.get('/logout', getlogout);

/* get public  profile */
router.get('/user/:id',errorHandler(userprofile));

/* put profile */
router.put('/profile',isloggedin,errorHandler(isvalidPassword),errorHandler(changePassword),errorHandler(updateProfile));


/* put Forgot-pwd */
router.put('/forgot-password',errorHandler(putforgotPwd));

/* get reset-token */
router.get('/reset/:token',errorHandler(getReset));

/* put reset-tooken */
router.put('/reset/:token',errorHandler(putReset));

  // This code will take use to consent screen
router.get("/login/google",passport.authenticate("google",{
  scope:[        'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email']
}));

router.get("/login/google/callback",errorHandler(googlelogin));

// resened Email 
router.get("/verify-email/:id",errorHandler(emailverification));
router.get("/resend-email",isloggedin,errorHandler(resendEmail));

router.get("/protected",isloggedin,(req,res,next)=>{
  res.send("ok");
})











module.exports = router;
