const User = require("../model/user")
const util = require("util");
const passport = require("passport");
const {} = require("../middleware/index")

module.exports={
   async postregister(req,res,next){
       try{
           const{username,email} = req.body;
           if(req.body.password.length<6)
           {
               error = "Password must be 6 digit long";
               return res.status(400).send({error,username,email})
           }
           if(req.body.password != req.body.passwordConfirmation)
           {
               error = "Password dont Match";
               return res.status(400).send({error,username,email})
           }
           let user = await User.register(new User(req.body),req.body.password);
           const login =  util.promisify(req.login.bind(req));
           await login(user);
           return res.status(200).send({success:true,msg:"You are successfully registered and logged in"});
       }catch(err){
            console.log(err);
            return res.status(400).send({success:false,msg:err});
       }
},
    async postlogin(req,res,next){
        const {email,password} = req.body;
        try{
            const{user,error}  = await User.authenticate()(email,password);
            if(error)throw error
            const login =  util.promisify(req.login.bind(req));
            await login(user);
            return res.status(200).send({success:true,msg:"You are successfully logged in "});
        }catch(err){
            console.log(err);
            return res.status(400).send({success:false,msg:"Email or password incorrect"});
        }
  },
    getlogout(req,res,next)
    {
        req.logout();
        return res.status(200).send({success:true,msg:"You are successfully logged out"});
    },

   async userprofile(req,res,next){
       const user = await User.findById(req.params.id);
       if(!user)
       {
         return res.status(400).send({success:false,msg:"No such user found in the db"});
       }
       return res.status(200).send({success:true,user});
   },
   async updateProfile(req,res,next){

    const {username,email,firstName,lastName,bio,tagline} = req.body;
    const {user} = res.locals;

    if(username) user.username = username;
    if(email) user.email = email;
    if(firstName) user.firstName = firstName;
    if(lastName) user.lastName = lastName;
    user.bio = bio;
    user.tagline = tagline;

    if(req.file)
    {
      if(user.image.public_id) await cloudinary.uploader.destroy(user.image.public_id);
      const {path,filename} =req.file;
      user.image = {secure_url:path,public_id:filename};
    }
    try {
        await user.save();
        // now since credentials are changed we need to log user in we can use simple req.login but it will not return promise it only takes callback
        const login = util.promisify(req.login.bind(req));
        // we req.login requires use of req but since we are storing the promise inside a variable we will loose req object so we use bind methd bind req to user it is like this
        await login(user);
        req.session.success = "Profile updated";
        res.redirect("/profile")
    } catch (err) {
        let error =err.message;
        if(error.includes("duplicate")&&error.includes("index: email_1 dup key")){
            error = "User with Email already exists";
        }else{
            error = "UserName Already Taken";
        }
     return res.render("profile",{error})
    }

  },
  async putforgotPwd(req,res,next)
  {
     const token = crypto.randomBytes(20).toString('hex');
     const user = await User.findOne({ email: req.body.email })
       if (!user) {
         req.session.error = 'No account with that email address exists.';
         return res.redirect('/forgot-password');
       }
       if(user.googleId)
       {
        req.session.error = 'You Previously Signed Up with Google';;
        return res.redirect('/forgot-password');
       }

       user.resetPasswordToken = token;
       user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
       console.log(user)
       console.log(req.headers.host,"before")
       await user.save();
       const msg = {
         to: user.email,
         from: 'Photo-app Admin <bankaraj00@gmail.com>',
         subject: 'Photo-app - Forgot Password / Reset',
         text: 
           `You are receiving this because you (or someone else) have requested the reset of the password for your account.
           Please click on the following link, or copy and paste it into your browser to complete the process:
           http://${req.headers.host}/reset/${token}
           If you did not request this, please ignore this email and your password will remain unchanged.`.replace(/           /g, '')
       };
       await sgMail.send(msg);
       req.session.success = `An e-mail has been sent to ${user.email} with further instructions.`;
       res.redirect('/forgot-password');
  },
  async putReset(req, res, next) {
    const { token } = req.params;
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    
    if (!user) {
     req.session.error = 'Password reset token is invalid or has expired.';
     return res.redirect(`/reset/${ token }`);
    }

    if(req.body.password.length<6){
        req.session.error = "Length of Password must be atleast 6";
        return res.redirect(`/reset/${ token }`);
    }
  
    if(req.body.password === req.body.confirm) {
      await user.setPassword(req.body.password);
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();
      const login = util.promisify(req.login.bind(req));
      await login(user);
    } else {
      req.session.error = 'Passwords do not match.';
      return res.redirect(`/reset/${ token }`);
    }
  
    const msg = {
      to: user.email,
      from: 'Surf Shop Admin <bankaraj00@gmail.com>',
      subject: 'Surf Shop - Password Changed',
      text: `Hello,
        This email is to confirm that the password for your account has just been changed.
        If you did not make this change, please hit reply and notify us at once.`.replace(/		  	/g, '')
    };
    
    await sgMail.send(msg);
  
    req.session.success = 'Password successfully updated!';
    res.redirect('/post');
  },
  async googlelogin(req,res,next){
    passport.authenticate("google",(err,user,info)=>{
      // console.log("yaha aaya2")
      if(!user){
        // console.log(err,"Thjos os error");
        // console.log(info);
        req.session.error = "Primary email already registered";
        return res.redirect("/login");
      }else{
        req.login(user,(err)=>{
          if(err){
            req.session.error("Something went wrong");
            return res.redirect("/login");
          }else{
            req.session.success = "Welcome back "+user.username;
            var redirect = req.session.redirectTo || "/post";
            delete req.session.redirectTo;
            return res.redirect(redirect);
          }
        })
      }
    })(req,res)
  },
async resendEmail(req,res,next){
  if(req.user.isverfied)
  {
    req.session.success = "User already verified";
    return res.redirect("/post");
  }
  const tokenval = new Token({userId:req.user._id, token: crypto.randomBytes(16).toString("hex")});
  await tokenval.save();
  const msg = {
   to: req.user.email,
   from: 'Photo-app Admin <bankaraj00@gmail.com>',
   subject: 'Email verification',
   text:"Hello,\n\n" + "Please verify your account by clicking the link: http://" + req.headers.host + "/verify-email/" + tokenval.token +".\n"

 };
 await sgMail.send(msg);
 req.session.success = `An e-mail has been sent to ${req.user.email} with further instructions.`;
 return res.redirect("/resend-page");
 },
 async emailverification(req,res,next){
  const token = await Token.findOne({token:req.params.id});
  if(!token)
  {
      req.session.error = "Token is invalid or has expired Please request for a new token";
      return res.redirect("/resend-page");
  }
  const user = await User.findOne(token.userId);
  if(!user)
  {
      req.session.error = "No such user exists";
      return res.redirect("/post");
  }
  
  if(user.isverfied)
  {    
      req.session.error = "Email already verified";
      return res.redirect("/post");
  }
  user.isverfied=true;
  await user.save();
  req.session.success = "Email-Id is Successfully Verified";
  return res.redirect(`/post`);
}

}