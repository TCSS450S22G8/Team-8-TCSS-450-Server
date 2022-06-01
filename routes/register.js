/**
 * Endpoint is used for user registering with the application.
 * Adapted from original code by Charles Bryan.
 *
 * @author Charles Bryan
 * @author Sean Logan
 * @author Shilnara Dam
 * @version 1.0
 */

//express is the framework we're going to use to handle requests
const express = require("express");

// For email verification
require("dotenv").config();

//OAuth Import
const sendEmail = require("../utilities/OAuthUtils").sendEmail;

const jwt = require("jsonwebtoken");
const {
    isValidEmail,
    isValidPassword,
    isValidNickname,
} = require("../utilities/validationUtils");

//Access the connection to Heroku Database
const pool = require("../utilities").pool;
const validation = require("../utilities").validation;
let isStringProvided = validation.isStringProvided;

const generateHash = require("../utilities").generateHash;
const generateSalt = require("../utilities").generateSalt;

const router = express.Router();

/**
 * @api {post} /auth Request to register a user
 * @apiName PostAuthRegister
 * @apiGroup Auth
 *
 * @apiParam {String} first a users first name
 * @apiParam {String} last a users last name
 * @apiParam {String} username a username *unique
 * @apiParam {String} email a users email *unique
 * @apiParam {String} password a users password
 *
 * @apiBodyExample {json} Request-Body-Example:
 *  {
 *      "first":"testFirst",
 *      "last":"testLast",
 *      "username":"testUser",
 *      "email":"testEmail@fake.email",
 *      "password":"test12345"
 *  }
 *
 * @apiSuccess (Success 201) {boolean} success true when the name is inserted
 * @apiSuccess (Success 201) {String} email the email of the user inserted
 *
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 *
 * @apiError (400: Username exists) {String} message "Username exists"
 *
 * @apiError (400: Email exists) {String} message "Email exists"
 *
 * @apiError (400: Other Error) {String} message "other error, see detail"
 * @apiError (400: Other Error) {String} detail Information about the error
 *
 */
router.post(
    "/",
    (request, response, next) => {
        //Retrieve data from query params
        const first = request.body.first;
        const last = request.body.last;
        const username = isStringProvided(request.body.username)
            ? request.body.username
            : request.body.email;
        const email = request.body.email;
        const password = request.body.password;

        //Verify that the caller supplied all the parameters
        //In js, empty strings or null values evaluate to false
        if (
            isValidNickname(first) &&
            isValidNickname(last) &&
            isValidNickname(username) &&
            isValidEmail(email) &&
            isValidPassword(password)
        ) {
            //We're using placeholders ($1, $2, $3) in the SQL query string to avoid SQL Injection
            //If you want to read more: https://stackoverflow.com/a/8265319
            let theQuery =
                "INSERT INTO MEMBERS(FirstName, LastName, Username, Email) VALUES ($1, $2, $3, $4) RETURNING Email, MemberID";
            let values = [first, last, username, email];
            pool.query(theQuery, values)
                .then((result) => {
                    //stash the memberid into the request object to be used in the next function
                    request.memberid = result.rows[0].memberid;

                    next();
                })
                .catch((error) => {
                    //log the error  for debugging
                    // console.log("Member insert")
                    // console.log(error)
                    if (error.constraint == "members_username_key") {
                        response.status(400).send({
                            message: "Username exists",
                        });
                    } else if (error.constraint == "members_email_key") {
                        response.status(400).send({
                            message: "Email exists",
                        });
                    } else {
                        response.status(400).send({
                            message: "other error, see detail",
                            detail: error.detail,
                        });
                    }
                });
        } else {
            response.status(400).send({
                message: "Missing required information",
            });
        }
    },
    (request, response, next) => {
        //We're storing salted hashes to make our application more secure
        //If you're interested as to what that is, and why we should use it
        //watch this youtube video: https://www.youtube.com/watch?v=8ZtInClXe1Q
        let salt = generateSalt(32);
        let salted_hash = generateHash(request.body.password, salt);
        let theQuery =
            "INSERT INTO CREDENTIALS(MemberId, SaltedHash, Salt) VALUES ($1, $2, $3)";
        let values = [request.memberid, salted_hash, salt];
        pool.query(theQuery, values)
            .then((result) => {
                memberEmail = request.body.email;
                const token = jwt.sign(
                    {
                        memberid: request.memberid,
                    },
                    process.env.JSON_WEB_TOKEN,
                    { expiresIn: "14400m" }
                );
                const mailConfigurations = {
                    // It should be a string of sender/server email
                    from: process.env.EMAIL,

                    to: request.body.email,

                    // Subject of Email
                    subject: "Email Verification",

                    // This would be the text of email body
                    text: `Hi! To register please follow the link https://tcss-450-sp22-group-8.herokuapp.com/verify/${token}`,
                };
                sendEmail(mailConfigurations);
                next();
            })
            .catch((error) => {
                //log the error for debugging
                // console.log("PWD insert")
                console.log(error);

                /***********************************************************************
                 * If we get an error inserting the PWD, we should go back and remove
                 * the user from the member table. We don't want a member in that table
                 * without a PWD! That implementation is up to you if you want to add
                 * that step.
                 **********************************************************************/

                response.status(400).send({
                    message: "other error, see detail",
                    detail: error.detail,
                });
            });
    },
    (request, response) => {
        let query =
            "INSERT INTO CHATMEMBERS (CHATID, MEMBERID) SELECT 1, MEMBERS.MEMBERID FROM MEMBERS WHERE MEMBERS.EMAIL = $1";
        let values = [memberEmail];
        pool.query(query, values)
            .then((result) => {
                if (result.rowCount == 1) {
                    response.status(200).send({
                        message:
                            "Email for account verification succesfully sent! You have been added to a global chat!",
                    });
                } else {
                    response.status(400).send({
                        message: "Could not add user to global chat.",
                    });
                }
            })
            .catch((err) => {
                response.status(500).send({
                    message: "Database Failed",
                });
            });
    }
);

module.exports = router;
