const User = require("../model/user");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const CronJob = require('cron').CronJob;

async function scheduleMail(to,cc,subject,text,from){
    const msg = {
        to,
        from,
        cc,
        subject,
        text
      };
      await sgMail.send(msg);
      console.log("mail has been sent to ")
}


module.exports = {
    async sendMail(req,res,next){
        const {to,cc,subject,text} = req.body;
        let arr = [];
        if(!to) arr.push({msg:"Reciept is required"});
        if(!cc) arr.push({msg:"cc is required"});
        if(!subject) arr.push({msg:"Subject is required"});
        if(!text) arr.push({msg:"Email body is required"});
        if(arr && arr.length > 0) throw arr;
        const job = new CronJob(`*/20 * * * * *`, async function() {
           await scheduleMail(to,cc,subject,text,req.user.email);
          }, null, true, 'America/Los_Angeles');
          job.start();

          return res.status(200).send({success:true,msg:`An e-mail has been sent to  with further instructions.`})
    }
}