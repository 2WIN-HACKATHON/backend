let User = require("../model/user")
const middleware = {
  
    errorHandler: (fn) => (req, res, next)=>Promise.resolve(fn(req,res,next)).catch(next),   
    isloggedin: (req,res,next)=>{
        if(req.isAuthenticated()){
          return next()};
        return res.status(401).send({success:false,msg:"You need to be logged in to do that"});
      },
      isvalidPassword: async (req,res,next)=>{
        if(req.user.googleId!=undefined)
        {
          res.locals.user = req.user
         return next();
        }
        
        const {user} = await User.authenticate()(req.user.email,req.body.currentPassword)
        if(user)
        {
          res.locals.user = user
          next();
        }else{
           middleware.deleteProfileImage(req);
          req.session.error = "Incorrect Current Password";
          return res.redirect("/profile");
        }
      },
  
      changePassword: async (req,res,next)=>{
        if(req.user.googleId!=undefined)
        {
          res.locals.user = req.user
         return next();
        }
        const {newPassword,passwordConfirmation} = req.body;
        if(newPassword && passwordConfirmation)
        {// means user entered password to change
          const {user} = res.locals;
          if(newPassword.length<6)
          {
            let error;
            error="Password must be 6 digit long"
            return res.render("profile",{error});
          }
          if(newPassword === passwordConfirmation)
          {
            await user.setPassword(newPassword);
            next();
          }else{
            middleware.deleteProfileImage(req);
            req.session.error = "Password must match";
            return res.redirect("/profile");
          }
        }else{
          next();
        }
      },
      isverifiedUser(req,res,next){
        if(req.xhr && !req.user.isverfied)
        {
          return res.send("resend");
        }
        if(req.user.isverfied || req.user.googleId)
        {
          return next();
        }
        req.session.error = "You Need To verify Your Email to Create a New Post :)";
        return res.redirect("/resend-page");
      }
};









module.exports = middleware;