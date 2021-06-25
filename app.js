require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose");
const LocalStrategy = require ('passport-local').Strategy;
const googlestrategy = require("passport-google-oauth2").Strategy;


// models

const User = require("./model/user")


const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

var url = process.env.DATABASE_URL || 'mongodb://localhost:27017/Hackathon';
mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true,useCreateIndex: true,useFindAndModify:false });
var db = mongoose.connection;
db.on('error',console.error.bind(console,"conncetion error"));
db.once('open',function(){
  console.log("connected")
})
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// passport configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))


app.use(passport.initialize());
app.use(passport.session());

passport.use (new LocalStrategy(User.authenticate()));




passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


passport.use(new googlestrategy({
  clientID:process.env.GOOGLE_CLIENT_ID,
  clientSecret:process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/login/google/callback",
  proxy: true        
},async (accessToken,refreshToken,profile,done)=>{
  console.log(profile);
  //  whenever it code will come here and user is found it will pass it on to the serialise user
  // This done callback will attach user to req.user object
    const userpresent = await User.findOne({googleId:profile.id})
    if(userpresent){
      // menas we will pass tht user to serialise it so that we can extract all the DATA AND stor eit inside a session for later use
     return done(null,userpresent)
    }else{
      const users = await User.findOne({email:profile._json.email})
      if(users)
      {
        return done({error:"Primary email already registered"})
      }
      var newuser = new User({
        googleId:profile.id,
        firstName:profile.given_name,
        lastName:profile.family_name,
        username:profile.given_name,
        image:{
          secure_url:profile._json.picture,
          public_id:profile._json.sub
        },
        email:profile._json.email,
      })
      newuser.isverfied = true
      
     await newuser.save();
     return done(null,newuser)

    }

}));

app.use('/', indexRouter);
app.use('/users', usersRouter);






















// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  console.log(err,"This is the error in app.js");
  res.status(err.status || 400);
  res.send({success:false,err});
});

module.exports = app;
