const User = require("../model/user")
const util = require("util");
const passport = require("passport");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const crypto = require("crypto");
const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(process.env.CLIENT_ID)
const Token = require("../model/token")
module.exports={
   async postregister(req,res,next){
       try{

           const{username,email} = req.body;
           if(!req.body.password || req.body.password.length<6)
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
           const tokenval = new Token({userId:user._id,token:crypto.randomBytes(16).toString('hex')});
           await tokenval.save();
           const msg = {
             to: user.email,
             from: 'jon doe<bankaraj00@gmail.com>',
             subject: 'Email verification',
             text:"Hello,\n\n" + "Please verify your account by clicking the link: http://" + req.headers.host + "/verify-email/" + tokenval.token +".\n"
           };
           await sgMail.send(msg);
           return res.status(200).send({success:true,msg:"Email has been sent to your account with further instructions"});
       }catch(err){
            console.log(err);
            return res.status(400).send({success:false,msg:err});
       }
},
    async postlogin(req,res,next){
        console.log(req.body,"This is the req.body inside login")
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
   async updateProfile(req,res,next){

    const {username,email,firstName,lastName} = req.body;
    const {user} = res.locals;

    if(username) user.username = username;
    if(email) user.email = email;
    if(firstName) user.firstName = firstName;
    if(lastName) user.lastName = lastName;
    try {
        await user.save();
        const login = util.promisify(req.login.bind(req));
        await login(user);
        return res.status(200).send({success:true,msg:"Profile successfully updated"});
    } catch (err) {
        let error =err.message;
        console.log(error);
        if(error.includes("duplicate")&&error.includes("index: email_1 dup key")){
            error = "User with Email already exists";
        }else{
            error = "UserName Already Taken";
        }
     return res.status(400).send({success:false,error});
    }

  },
  async putforgotPwd(req,res,next)
  {
     const token = crypto.randomBytes(20).toString('hex');
     const user = await User.findOne({ email: req.body.email })
       if (!user) {
         return res.status(400).send({success:false,msg:'No account with that email address exists.'});
        }
       if(user.googleId)
       {
        return res.status(400).send({success:false,msg:'You Previously Signed Up with Google'});
    }

       user.resetPasswordToken = token;
       user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
       console.log(user)
       console.log(req.headers.host,"before")
       await user.save();
       const msg = {
         to: user.email,
         from: 'jonDoe<bankaraj00@gmail.com>',
         subject: 'Forgot Password / Reset',
         text: 
           `You are receiving this because you (or someone else) have requested the reset of the password for your account.
           Please click on the following link, or copy and paste it into your browser to complete the process:
           http://${req.headers.host}/reset/${token} 
           If you did not request this, please ignore this email and your password will remain unchanged.`.replace(/           /g, '')
       };
       // give the frontend url
       await sgMail.send(msg);
       return res.status(200).send({success:true,msg:`An e-mail has been sent to ${user.email} with further instructions.`})
  },
  async putReset(req, res, next) {
    const { token } = req.params;
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    
    if (!user) {
     return res.status(400).send({success:false,msg:"Password reset token is invalid or has expired."});
    }

    if(req.body.password.length<6){
        return res.status(400).send({success:false,msg:"Length of Password must be atleast 6"});
    }
  
    if(req.body.password === req.body.confirm) {
      await user.setPassword(req.body.password);
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();
      const login = util.promisify(req.login.bind(req));
      await login(user);
    } else {
      return res.status(400).send({success:false,msg:"password don't match"});
    }
  
    const msg = {
      to: user.email,
      from: 'john doe<bankaraj00@gmail.com>',
      subject: 'Password Changed',
      text: `Hello,
        This email is to confirm that the password for your account has just been changed.
        If you did not make this change, please hit reply and notify us at once.`.replace(/		  	/g, '')
    };
    
    await sgMail.send(msg);
    return res.status(200).send({success:true,msg:"Password has been successfully changed"});
  },
  async googlelogin(req,res,next){
  //   const { token }  = req.body
  //   const ticket = await client.verifyIdToken({
  //     idToken: token,
  //     audience: process.env.CLIENT_ID
  // });
  // console.log("data recieved from google",ticket.getPayload());
  // let data = ticket.getPayload();
  // return res.status(200).send({success:true,data});
  // const { name, email, picture } = ticket.getPayload(); 
  // const userpresent = await User.findOne({googleId})
  //   if(userpresent){
  //    return res.status(200).send({success:true,userpresent});
  //   }else{
  //     const users = await User.findOne({email});
  //     if(users)
  //     {
  //       return res.status(400).send({success:false,msg:"Primary email already registered"});
  //     }
  //     var newuser = new User({
  //       googleId:profile.id,
  //       firstName:profile.given_name,
  //       lastName:profile.family_name,
  //       username:profile.given_name,
  //       email
  //     })
  //     newuser.isverfied = true
  //     await newuser.save();
  //     const login = util.promisify(req.login.bind(req));
  //     await login(newuser);
  //     return res.status(200).send({success:true,newuser});
  //   }

    passport.authenticate("google",async (err,user,info)=>{
      if(!user){
        return res.status(400).send({success:false,msg:"Primary user is already registered"});
      }else{
        const login =  util.promisify(req.login.bind(req));
        await login(user);
        return res.status(200).send({success:true,msg:"You are successfully logged in "});
        
      }
    })(req,res)
  },
async resendEmail(req,res,next){
  if(req.user.isverified)
  {
    return res.status(400).send({success:false,msg:"User already verified"});
  }
  const tokenval = new Token({userId:req.user._id, token: crypto.randomBytes(16).toString("hex")});
  await tokenval.save();
  const msg = {
   to: req.user.email,
   from: 'john doe<bankaraj00@gmail.com>',
   subject: 'Email verification',
   text:"Hello,\n\n" + "Please verify your account by clicking the link: https://" + req.headers.host + "/verify-email/" + tokenval.token +".\n"
 };
 // give frontend url
 await sgMail.send(msg);
 return res.status(200).send({success:true,msg:`An e-mail has been sent to ${req.user.email} with further instructions.`});
},
 async emailverification(req,res,next){
  const token = await Token.findOne({token:req.params.id});
  if(!token)
  {
      return res.status(400).send({success:false,msg:"Token is invalid or has expired Please request for a new token"});
    }
  const user = await User.findOne(token.userId);
  if(!user)
  {
      return res.status(400).send({success:false,msg:"No such user exists"});
  }
  
  if(user.isverified)
  {    
    return res.status(400).send({success:false,msg:"Email already verified"});
  }
  user.isverified=true;
  await user.save();
  return res.status(200).send({success:true,msg:"Email-Id is Successfully Verified"});
}

}