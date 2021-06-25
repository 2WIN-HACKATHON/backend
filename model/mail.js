const mongoose = require("mongoose");

const mailStatus = new mongoose.Schema({
    userid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    email:String,
    sechuledAt:{type:Date , required:true},
});


module.exports = mongoose.model("MailStatus",mailStatus);