const mongoose = require("mongoose");
const passportlocalmongoose = require("passport-local-mongoose");


var userschema = new mongoose.Schema({
    username: {type: String,required:true},
    email: {type: String,unique:true,required:true},
    googleId:String,
    firstName:String,
    lastName:String,
    resetPasswordToken:String,
    resetPasswordExpires: Date,
    isverified:{type:Boolean,default:false}
},{timestamps:true})

userschema.plugin(passportlocalmongoose, {
    usernameField: 'email'
  });
module.exports = mongoose.model("User",userschema);