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
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const  cors = require('cors')
let PRODUCTION = true;
const app = express();


const swaggerOptions = {
  swaggerDefinition: {
    info: {
      version: '1.0.0',
      title: '2Win API',
      description: '2 WIN API Information',
      contact: {
        name: 'bankaraj00@gmail.com',
      },
      servers: ['http://localhost:3000',"https://twowin.herokuapp.com"]
    },
  },
  // ['.routes/*.js']
  apis: ['./routes/*.js'],
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


// models

const User = require("./model/user")


const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');


var url = process.env.DATABASE_URL || 'mongodb://localhost:27017/Hackathon';
mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true,useCreateIndex: true,useFindAndModify:false });
var db = mongoose.connection;
db.on('error',console.error.bind(console,"conncetion error"));
db.once('open',function(){
  console.log("connected")
})

var whitelist = ["http://localhost:3000"]
var corsOptions = {
  methods: ['GET','PUT','POST','DELETE','OPTIONS'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  credentials: true,
  exposedHeaders: ['Set-Cookie'],
  allowedHeaders: ['Content-Type','Authorization', 'X-HTTP-Method-Override' ,'X-Requested-With', 'device-remember-token', 'Accept'],
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      console.log(origin,"This is origin");
      callback(new Error('Not allowed by CORS'))
    }
  }
}
if(PRODUCTION==false)
{  
  app.use(cors())
}else{
  app.use(cors(corsOptions))
}


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
        email:profile._json.email,
      })
      newuser.isverified = true
      
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
