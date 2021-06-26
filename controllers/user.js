const User = require("../model/user");
const sgMail = require("@sendgrid/mail");
const Mail = require("../model/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const CronJob = require('cron');

async function scheduleMail(to,cc,subject,text,from){
    const msg = {
        to,
        from,
        cc,
        subject,
        text
      };
      await sgMail.send(msg);
      console.log("mail has been sent to " + to);
}


module.exports = {
    // schedule a cron job in future using custom time
    async sendMail(req,res,next){
        let pattern,whichHour,whichMinute,whichSecond,whichDayOfMonth,whichMonth;
        let {mailobj,repeates,repeatEvery,day,hour,minute,month,dayofMonth,sechuledAt} = req.body;
        if(sechuledAt){
            // console.log(new Date(sechuledAt).toISOString(),"This is the date");
            sechuledAt = new Date(sechuledAt);
            const curDate = new Date();
            if(sechuledAt<curDate) throw "Scheduled at cannot be less than the current Date";
            pattern = sechuledAt
        }
        let arr = [];
        if(!mailobj.to) arr.push({msg:"Reciept is required"});
        if(!mailobj.cc) arr.push({msg:"cc is required"});
        if(!mailobj.subject) arr.push({msg:"Subject is required"});
        if(!mailobj.text) arr.push({msg:"Email body is required"});
        if(arr && arr.length > 0) throw arr;
        /* 
        1 -> sec
        2 -> minute
        3 -> hour
        4 -> day of month
        5 -> month
        6 -> day of week
        */
       // (0-6) (sun-sat);
    if(!sechuledAt){
        if(repeates==="second"){

              let sec = Number(repeatEvery) || 20;
              pattern = `*/${sec} * * * * *`;

        }else if(repeates==="weekly"){

                let whichDay = Number(day) || 0;  // default sunday
                whichHour = Number(hour) || 0 // default 0 (12 am);
                whichMinute = Number(minute) || 0 // default 0
                // whichSecond = Number(second) // default 0
                // whichSecond = whichSecond?`*\${whichSecond}`:'*';
                pattern = `${whichMinute} ${whichHour} * * ${whichDay}`

        }else if(repeates==="monthly"){

                whichMonth = Number(month) || '*' ;
                whichDayOfMonth = Number(dayofMonth) || 1;
                whichHour = Number(hour) || 0 // default 0 (12 am);
                whichMinute = Number(minute) || 0 // default 0
                // whichSecond = Number(second) // default 0
                // whichSecond = whichSecond?`*\${whichSecond}`:'*';
                pattern = `${whichMinute} ${whichHour} ${whichDayOfMonth} ${whichMonth} *`;
        }else if(repeates==="yearly"){
            whichHour = Number(hour) || 0;
            whichMinute = Number(minute) || 0;
            whichDayOfMonth = Number(dayofMonth) || 1;
            whichMonth = Number(month) || '*' ;
            pattern = `${whichMinute} ${whichHour} ${whichDayOfMonth} ${whichMonth} *`;
        }else{

            throw "No you cannot Schedule task other then sec,min,monthly,yearly"
        }
    }
           console.log(pattern,"cron pattern");

           const job = new CronJob.CronJob(pattern, async function() {

           await scheduleMail(mailobj.to,mailobj.cc,mailobj.subject,mailobj.text,req.user.email);

          }, null, true, "Asia/Kolkata");  // setting the indian time zone

          job.start();

          console.log(job.nextDates().format('YYYY-MM-DDTHH:mm:ss'),"Next time when cron will run");

          req.body.userid = req.user._id;

          req.body.sechuledAt = job.nextDates().format('YYYY-MM-DDTHH:mm:ss');

          const newMail = await Mail.create(req.body);

          console.log('This is the new mail which is created',newMail);
          return res.status(200).send({success:true,msg:`Job has been successfully scheduled`});
    },

    async getHistory(req,res,next){
        const AllMails = await Mail.find({userid:req.user._id,sechuledAt:{$lte:new Date().toISOString()}});
        return res.status(200).send({success:true,AllMails});
    },
    async getFuture(req,res,next){
        const AllMails = await Mail.find({userid:req.user._id,sechuledAt:{$gt:new Date().toISOString()}});
        return res.status(200).send({success:true,AllMails});
    }
}