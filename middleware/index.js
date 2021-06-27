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
        if(!req.body.currentPassword) throw "currentPassword is required"
        const {user} = await User.authenticate()(req.user.email,req.body.currentPassword)
        if(user)
        {
          res.locals.user = user
          next();
        }else{
          return res.status(401).send({success:false,msg:"Incorrect Current Password"});
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
            return res.status(400).send({success:false,msg:"Password must be 6 digit long"});
          }
          if(newPassword === passwordConfirmation)
          {
            await user.setPassword(newPassword);
            next();
          }else{
            return res.status(400).send({success:false,msg:"Password must match"});
          }
        }else{
          next();
        }
      },
      isverifiedUser(req,res,next){
        if(req.user.isverfied || req.user.googleId)
        {
          return next();
        }
        return res.status(400).send({success:false,msg:"You Need To verify Your Email to continue"});
      },
};









module.exports = middleware;