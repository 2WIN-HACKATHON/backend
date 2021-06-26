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
    sechuledAt:{type:Date ,default:Date.now},
},{timestamps:true});


module.exports = mongoose.model("Mail",mailSchema);