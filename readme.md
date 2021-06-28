# 2WIN 
Mail Scheduler Made using Nodejs,express js,Mongodb,cronjs

## Features
- User can register using email and password or can register/login via google auth
- Email verification , user need to verify their email to access the Protected routes
- In case if user didn't recieve the email they can then request to get the verification mail again 
- User can also reset their Password in case they forget
- user can update their profile when logged in as well for that they need to provide their currentPassword as well
- Verified user can schedule the mail and send the recurring mail as well
- Mail can be sent every second(user can input the no of seconds)
- Mail can be sent on weekly , monthly and on yearly schedule
- User can also schedule the mail at particular time and date 
- User will be shown the list of all the mail scheduled by them in future
- User will also be shown the list of all the mail sent by then till now


## Getting Started

- Clone the repository 

- Run npm install to install the dependencies

- Make sure Nodejs and Mongodb are installed and configured Properly 

- If mongod is not set to Auto restart  Please start mongod server manually 

- run npm start and app will start running  

- Goto http://localhost:3000/api-docs/  

- to find the list of all the api endpoints if cloned locally else https://twowin.herokuapp.com/api-docs

