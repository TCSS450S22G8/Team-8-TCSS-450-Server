//Get the connection to Heroku Database
const pool = require("./sql_conn.js");

//Get the crypto utility functions
const credUtils = require("./credentialingUtils");
const generateHash = credUtils.generateHash;
const generateSalt = credUtils.generateSalt;

const validation = require("./validationUtils.js");

//Oauth
const OAuth = require("./OAuthUtils");
const sendEmail = OAuth.sendEmail;

let messaging = require("./pushy_utilities.js");

module.exports = {
    pool,
    generateHash,
    generateSalt,
    validation,
    messaging,
    sendEmail,
};
