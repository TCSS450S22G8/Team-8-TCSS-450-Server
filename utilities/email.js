/**
 * @author Sean Logan
 * @author Shilnara Dam
 * @version 1.0
 * File for sending verification email to confrim that
 * a new registree is the owner of the email account
 * they entered when registering.
 * Inspiration from https://www.geeksforgeeks.org/email-verification/
 */

require('dotenv').config()

const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});
  
const token = jwt.sign({
        data: 'Token Data'  
    }, 'ourSecretKey', { expiresIn: '10m' }  
);    

const mailConfigurations = {
  
    // It should be a string of sender/server email
    from: process.env.EMAIL,
  
    to: 'Group8tcss450@gmail.com',
  
    // Subject of Email
    subject: 'Email Verification MOST RECENT',
      
    // This would be the text of email body
    text: `Hi! To register please follow the link http://localhost:5000/verify/${token}`
      
};
  
transporter.sendMail(mailConfigurations, function(error, info){
    if (error) throw Error(error);
    console.log('Email Sent Successfully');
    console.log(info);
});
//END TAKEN FROM GEEKS