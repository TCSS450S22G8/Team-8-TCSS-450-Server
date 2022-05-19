/**
 * @author Sean Logan
 * @author Shilnara Dam
 * @version 1.0
 * Enpoint is used for forget password includes verification of email.
 * Sends user an email to the email associated with their account
 * for confirmation that they are the owner of the email account.
 * Therefore, they can create a new password.
 */

const { request } = require("express");
const { response } = require("express");
const express = require("express");
const jwt = require("jsonwebtoken");
const { noExceptions } = require("npm/lib/utils/parse-json");
const {
    isValidEmail,
    isValidPassword,
} = require("../utilities/validationUtils");
const router = express.Router();
const nodemailer = require("nodemailer");
const { generateSalt, generateHash } = require("../utilities");

//Access the connection to Heroku Database
const pool = require("../utilities").pool;

require("dotenv").config();

/**
 * @api {post} /forgot-password/:email Post Request to reset users password
 * @apiName PostForgotPassword
 * @apiGroup Forgot Password
 *
 * @apiDescription Request password reset by sending email verification to user.
 *
 * @apiParam {String} email users email
 *
 * @apiSuccess (Success 201) {boolean} success true when the verification email is sent to user
 *
 * @apiError (400: Invalid Email) {String} message "Invalid email"
 *
 * @apiError (401: Email Sent Error) {String} message "Error sending email, possible incorrect email"
 *
 * @apiError (400: Email Does Not Exists) {String} message "Email does not exists"
 *
 */
router.post("/:email", (request, response) => {
    const email = request.params.email;
    if (!isValidEmail(email)) {
        response.status(400).send({
            message: "Invalid email",
        });
        return;
    }
    let query = "SELECT * FROM MEMBERS WHERE MEMBERS.EMAIL = $1";
    let values = [email];

    pool.query(query, values).then((result) => {
        if (result.rowCount == 1) {
            // Creating email to send to user for forgot password verification
            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                protocol: "tls",
                service: "gmail",
                secure: false,
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASSWORD,
                },
                debug: false,
                logger: true,
            });

            const token = jwt.sign(
                {
                    memberid: result.rows[0].memberid,
                },
                process.env.JSON_WEB_TOKEN,
                { expiresIn: "10m" }
            );
            const mailConfigurations = {
                // It should be a string of sender/server email
                from: process.env.EMAIL,

                to: email,

                // Subject of Email
                subject: "Email Password Verification",

                // This would be the text of email body
                text: `Hi! To reset your password please follow the link https://tcss-450-sp22-group-8.herokuapp.com/forgot-password/${token}`,
            };
            transporter.sendMail(mailConfigurations, function (error, info) {
                if (error) {
                    console.log(error);
                    response.status(401).send({
                        message:
                            "Error sending email, possible incorrect email" +
                            error,
                    });
                    console.log(error);
                } else {
                    //We successfully sent the email to the user!
                    response.status(201).send({
                        success: true,
                        email: email,
                    });
                    console.log("Email Sent Successfully");
                    console.log(info);
                }
            });
            return;
        } else {
            response.status(400).send({
                message: "Email does not exist",
            });
        }
    });
});

/**
 * @api {get} /forget-password/:token Request to update users flag for password reset verification
 * @apiName GetSetFlag
 * @apiGroup Forgot Password
 *
 * @apiDescription Request to update users flag for password reset verification.
 *
 * @apiParam {JWT} JWT the token in the link of the verification email.
 *
 * @apiSuccess {String} message "Email verifified successfully"
 *
 * @apiError (400: No Update) {String} message "No update"
 * @apiError (400: Failed Verification) {String} message "Verification failed to update"
 *
 * @apiUse JSONError
 */
router.get("/:token", (request, response) => {
    const { token } = request.params;

    // Verifying the JWT token
    jwt.verify(token, process.env.JSON_WEB_TOKEN, function (err, decoded) {
        if (err) {
            console.log(err);
            res.send(
                "Email verification failed, possibly the link is invalid or expired"
            );
        } else {
            // decode the token created with const {token} = request.params; above
            const decoded = jwt.decode(token);
            let query =
                "UPDATE MEMBERS SET forgotPassVerification = 1 WHERE memberid = $1";
            const values = [decoded.memberid];
            pool.query(query, values)
                .then((result) => {
                    if (result.rowCount == 1) {
                        response.set('Content-Type', 'text/html');
                        response.setHeader('Content-Type', 'text/html');
                        response.send("<html lang=\"en\">  <head>   <meta charset=\"utf-8\" />   <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge,chrome=1\" />   <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">   <title></title>   <link href='https://fonts.googleapis.com/css?family=Lato:300,400|Montserrat:700' rel='stylesheet' type='text/css'>   <style>     @import url(//cdnjs.cloudflare.com/ajax/libs/normalize/3.0.1/normalize.min.css);     @import url(//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css);   </style>   <link rel=\"stylesheet\" href=\"https://2-22-4-dot-lead-pages.appspot.com/static/lp918/min/default_thank_you.css\">   <script src=\"https://2-22-4-dot-lead-pages.appspot.com/static/lp918/min/jquery-1.9.1.min.js\"></script>   <script src=\"https://2-22-4-dot-lead-pages.appspot.com/static/lp918/min/html5shiv.js\"></script> </head>  <body>   <header class=\"site-header\" id=\"header\">     <h1 class=\"site-header__title\" data-lead-id=\"site-header-title\">THANK YOU!</h1>   </header>    <div class=\"main-content\">     <i class=\"fa fa-check main-content__checkmark\" id=\"checkmark\"></i>     <p class=\"main-content__body\" data-lead-id=\"main-content-body\">Thanks you for verifying, you can now reset your password!</p>   </div>    <footer class=\"site-footer\" id=\"footer\">     <p class=\"site-footer__fineprint\" id=\"fineprint\">SlapChat</p>   </footer> </body>  </html>");
                    } else {
                        response.status(400).send({
                            message: "No update happened",
                        });
                    }
                })
                .catch((error) => {
                    response.status(400).send({
                        message: "Verification failed to update",
                        detail: error.detail,
                    });
                });
        }
    });
});

/**
 * @api {get} /forget-password/check-flag/:email Request to check if user has clicked link in email verification
 * @apiName GetPingVerificationFlag
 * @apiGroup Forgot Password
 *
 * @apiDescription Request to get confirmation that the user clicked the link in email verification.
 *
 * @apiParam {String} email the email to check if the user has clicked the link in email verification.
 *
 * @apiSuccess {String} message "Successfully verified for password reset"
 *
 * @apiError (400: Not Verified) {String} message "User has not successfully verified for password reset"
 *
 * @apiError (500: Database Failed) {String} message "Database Query Failed"
 *
 * @apiUse JSONError
 */
router.get("/check-flag/:email", (request, response) => {
    const email = request.params.email;
    let query = "SELECT * FROM MEMBERS WHERE EMAIL = $1";
    let values = [email];

    pool.query(query, values)
        .then((result) => {
            if (
                result.rowCount == 1 &&
                result.rows[0].forgotpassverification == 1
            ) {
                response.status(200).send({
                    message: "Successfully verified for password reset",
                });
            } else {
                response.status(400).send({
                    message:
                        "User has not successfully verified for password reset",
                });
            }
        })
        .catch((error) => {
            response.status(500).send({
                message: "Database Query Failed",
            });
        });
});

// Updates the users password in the database
/**
 * @api {put} /forget-password/new-password Request to update user password with a new password.
 * @apiName PutResetPassword
 * @apiGroup Forgot Password
 *
 * @apiDescription Request to reset users password with a new password.
 *
 * @apiBody {JSON} JSON Object containing user email and password.
 *
 * @apiBodyExample {json} Request-Body-Example:
 *  {
 *      "email":"testFirst",
 *      "password":"test12345"
 *  }
 *
 * @apiSuccess {String} message "User has successfully reset password"
 *
 * @apiError (400: Invalid Password) {String} message "Password does not meet the requirements"
 *
 * @apiError (400: Invalid Email) {String} message "Email does not meet the requirements"
 *
 * @apiError (400: Flag Not Updated) {String} message "Flag not reverted"
 *
 * @apiError (500: Database Failed) {String} message "Database Query Failed"
 *
 * @apiError (400: Failed Update) {String} message "Update Failed"
 *
 * @apiError (400: Invalid Email) {String} message "Invalid user email or user has not verified email"
 *
 * @apiUse JSONError
 */
router.put("/new-password", (request, response) => {
    const email = request.body.email;
    const password = request.body.password;
    if (!isValidPassword(password)) {
        response.status(400).send({
            message: "Password does not meet the requirements",
        });
        return;
    } else if (!isValidEmail(email)) {
        response.status(400).send({
            message: "Email does not meet the requirements",
        });
        return;
    }

    let query = "SELECT * FROM MEMBERS WHERE EMAIL = $1";
    let values = [email];

    pool.query(query, values)
        .then((result) => {
            if (
                result.rowCount == 1 &&
                result.rows[0].forgotpassverification == 1
            ) {
                let salt = generateSalt(32);
                let salted_hash = generateHash(request.body.password, salt);
                query =
                    "UPDATE CREDENTIALS SET Salt = $1, SaltedHash = $2 WHERE memberid = $3";
                values = [salt, salted_hash, result.rows[0].memberid];

                pool.query(query, values)
                    .then((result) => {
                        if (result.rowCount == 1) {
                            query =
                                "UPDATE MEMBERS SET forgotPassVerification = 0 WHERE EMAIL = $1";
                            values = [email];

                            pool.query(query, values)
                                .then((result) => {
                                    if (result.rowCount == 1) {
                                        response.status(200).send({
                                            message:
                                                "User has successfully reset password",
                                        });
                                    } else {
                                        response.status(400).send({
                                            message: "Flag not reverted",
                                        });
                                    }
                                })
                                .catch((error) => {
                                    response.status(500).send({
                                        message: "Database Query Failed",
                                    });
                                });
                        } else {
                            response.status(400).send({
                                message: "Update Failed",
                            });
                        }
                    })
                    .catch((error) => {
                        response.status(500).send({
                            message: "Database Query Failed",
                        });
                    });
            } else {
                response.status(400).send({
                    message:
                        "Invalid user email or user has not verified email",
                });
            }
        })
        .catch((error) => {
            response.status(500).send({
                message: "Database Query Failed",
            });
        });
});

module.exports = router;
