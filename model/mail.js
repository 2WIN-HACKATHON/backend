const mongoose = require("mongoose");
// add the logic when is the mail scheduled like every week , sec etc
const mailSchema = new mongoose.Schema({
    userid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    mailobj:{
        to:String,
        from:String,
        cc:String,
        subject:String,
        text:String
      },
      repeates:String,
      repeatEvery:{type:Number,default:null}, // seconds
      day:{type:Number,default:0},
      hour:{type:Number,default:0},
      minute:{type:Number,default:0},
      month:{type:Number,default:0},
      dayofMonth:{type:Number,default:0},
     sechuledAt:{type:Date,required:true,default:Date.now},
},{timestamps:true});


module.exports = mongoose.model("Mail",mailSchema);